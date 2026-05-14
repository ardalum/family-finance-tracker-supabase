import { AuthProvider } from "../features/auth/AuthProvider.jsx";
import AuthGate from "../features/auth/components/AuthGate.jsx";
import HouseholdGate from "../features/households/components/HouseholdGate.jsx";

export default function AppProviders({ children }) {
  return (
    <AuthProvider>
      <AuthGate>
        <HouseholdGate>{children}</HouseholdGate>
      </AuthGate>
    </AuthProvider>
  );
}
