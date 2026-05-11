import { WalletCards } from "lucide-react";
import { useState } from "react";
import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";
import Input from "../../../components/ui/Input.jsx";
import AccountMenu from "../../auth/components/AccountMenu.jsx";
import { useHouseholds } from "../HouseholdProvider.jsx";

export default function HouseholdSetup() {
  const { createInitialHousehold, error, setError } = useHouseholds();
  const [name, setName] = useState("My Household");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await createInitialHousehold(name);
    } catch (currentError) {
      setError(currentError.message || "Could not create household.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[#F9FAFB] px-4 py-10">
      <div className="grid w-full max-w-md gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1F2937] text-white shadow-sm">
              <WalletCards size={21} aria-hidden="true" />
              <span className="absolute bottom-2 right-2 h-1.5 w-5 rounded-full bg-[#10B981]" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-normal text-[#111827]">
                Set up household
              </h1>
              <p className="text-sm text-[#6B7280]">Create a private workspace for WalletFlow.</p>
            </div>
          </div>
          <AccountMenu />
        </div>

        <Card>
          <form className="grid gap-4 p-5" onSubmit={handleSubmit}>
            <div>
              <h2 className="text-lg font-semibold tracking-normal text-[#111827]">
                First household
              </h2>
              <p className="mt-1 text-sm text-[#6B7280]">
                Your current tracker data will remain in this browser.
              </p>
            </div>

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-[#991B1B]">
                {error}
              </div>
            ) : null}

            <Input
              label="Household name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={80}
              required
            />

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create household"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
