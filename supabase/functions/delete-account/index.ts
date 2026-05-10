import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type DeleteAccountBody = {
  householdId?: string;
  confirmation?: string;
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  try {
    const supabaseUrl = requireEnv("SUPABASE_URL");
    const supabaseAnonKey = requireEnv("SUPABASE_ANON_KEY");
    const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
    const authorization = request.headers.get("Authorization");

    if (!authorization) {
      return jsonResponse({ error: "Missing Authorization header." }, 401);
    }

    const body = (await request.json()) as DeleteAccountBody;
    if (body.confirmation !== "DELETE") {
      return jsonResponse({ error: "Confirmation phrase is required." }, 400);
    }

    if (!body.householdId) {
      return jsonResponse({ error: "Active household is required." }, 400);
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authorization } },
    });
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return jsonResponse({ error: "Invalid or expired session." }, 401);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: activeMembership, error: membershipError } = await adminClient
      .from("household_members")
      .select("role,status")
      .eq("household_id", body.householdId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (membershipError) throw membershipError;

    if (
      !activeMembership ||
      activeMembership.status !== "active" ||
      activeMembership.role !== "owner"
    ) {
      return jsonResponse(
        { error: "Only an active household owner can delete this account." },
        403,
      );
    }

    const { data: ownedHouseholds, error: ownedHouseholdsError } = await adminClient
      .from("households")
      .select("id")
      .eq("created_by", user.id);

    if (ownedHouseholdsError) throw ownedHouseholdsError;

    const ownedHouseholdIds = (ownedHouseholds ?? []).map((household) => household.id);

    if (ownedHouseholdIds.length > 0) {
      const { error: deleteHouseholdsError } = await adminClient
        .from("households")
        .delete()
        .in("id", ownedHouseholdIds);

      if (deleteHouseholdsError) throw deleteHouseholdsError;
    }

    const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(user.id);
    if (deleteUserError) throw deleteUserError;

    return jsonResponse({
      ok: true,
      deletedOwnedHouseholdCount: ownedHouseholdIds.length,
    });
  } catch (error) {
    console.error(error);
    return jsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not delete account.",
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

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}
