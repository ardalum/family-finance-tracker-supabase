import { Home } from "lucide-react";
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
    <div className="grid min-h-screen place-items-center bg-gray-100 px-4 py-10">
      <div className="grid w-full max-w-md gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-950 text-white">
              <Home size={20} aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-normal text-gray-950">
                Set up household
              </h1>
              <p className="text-sm text-gray-500">Create a private workspace for your tracker</p>
            </div>
          </div>
          <AccountMenu />
        </div>

        <Card>
          <form className="grid gap-4 p-5" onSubmit={handleSubmit}>
            <div>
              <h2 className="text-lg font-semibold tracking-normal text-gray-950">
                First household
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Your current tracker data will remain in this browser.
              </p>
            </div>

            {error ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
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
