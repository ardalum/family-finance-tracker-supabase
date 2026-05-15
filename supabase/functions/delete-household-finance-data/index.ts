import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const defaultAllowedOrigins = [
  "http://127.0.0.1:5173",
  "http://localhost:5173",
  "https://ardalum.github.io",
];

const deleteOrder = [
  "recurring_payment_instances",
  "transaction_splits",
  "transactions",
  "monthly_card_balances",
  "recurring_payments",
  "credit_cards",
  "budget_categories",
  "household_profiles",
];

type DeleteHouseholdFinanceDataBody = {
  householdId?: string;
  confirmation?: string;
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: getCorsHeaders(request) });
  }

  if (request.method !== "POST") {
    return jsonResponse(request, { error: "Method not allowed." }, 405);
  }

  try {
    const supabaseUrl = requireEnv("SUPABASE_URL");
    const supabaseAnonKey = getSupabasePublishableKey();
    const serviceRoleKey = getSupabaseSecretKey();
    const authorization = request.headers.get("Authorization");

    if (!authorization) {
      return jsonResponse(request, { error: "Missing Authorization header." }, 401);
    }

    const body = (await request.json()) as DeleteHouseholdFinanceDataBody;
    if (body.confirmation !== "DELETE FINANCE DATA") {
      return jsonResponse(request, { error: "Type DELETE FINANCE DATA to confirm." }, 400);
    }

    if (!body.householdId) {
      return jsonResponse(request, { error: "Active household is required." }, 400);
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authorization } },
    });
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return jsonResponse(request, { error: "Invalid or expired session." }, 401);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: membership, error: membershipError } = await adminClient
      .from("household_members")
      .select("role,status")
      .eq("household_id", body.householdId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (membershipError) throw membershipError;

    if (!membership || membership.status !== "active" || membership.role !== "owner") {
      return jsonResponse(
        request,
        { error: "Only an active household owner can delete household finance data." },
        403,
      );
    }

    for (const table of deleteOrder) {
      const { error } = await adminClient.from(table).delete().eq("household_id", body.householdId);
      if (error) throw error;
    }

    const { error: householdError } = await adminClient
      .from("households")
      .update({
        setup_complete: false,
        setup_completed_at: null,
      })
      .eq("id", body.householdId);

    if (householdError) throw householdError;

    return jsonResponse(request, {
      ok: true,
      deletedHouseholdId: body.householdId,
    });
  } catch (error) {
    console.error(error);
    return jsonResponse(
      request,
      {
        error: error instanceof Error ? error.message : "Could not delete household finance data.",
      },
      500,
    );
  }
});

function requireEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

function getJsonDefaultKey(envName: string) {
  const rawValue = Deno.env.get(envName);
  if (!rawValue) return "";

  try {
    const parsed = JSON.parse(rawValue) as Record<string, string>;
    return parsed.default ?? Object.values(parsed)[0] ?? "";
  } catch {
    return rawValue;
  }
}

function getSupabasePublishableKey() {
  return (
    getJsonDefaultKey("SUPABASE_PUBLISHABLE_KEYS") ||
    Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ||
    Deno.env.get("SUPABASE_ANON_KEY") ||
    requireEnv("SUPABASE_ANON_KEY")
  );
}

function getSupabaseSecretKey() {
  return (
    getJsonDefaultKey("SUPABASE_SECRET_KEYS") ||
    Deno.env.get("SUPABASE_SECRET_KEY") ||
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
    requireEnv("SUPABASE_SERVICE_ROLE_KEY")
  );
}

function getAllowedOrigins() {
  const configuredOrigins = Deno.env
    .get("ALLOWED_ORIGINS")
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return configuredOrigins?.length ? configuredOrigins : defaultAllowedOrigins;
}

function getCorsHeaders(request: Request) {
  const origin = request.headers.get("Origin") ?? "";
  const allowedOrigins = getAllowedOrigins();
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

function jsonResponse(request: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...getCorsHeaders(request),
      "Content-Type": "application/json",
    },
  });
}
