import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthProvider.jsx";
import {
  clearStoredActiveHouseholdId,
  createHousehold,
  createFirstHousehold,
  getStoredActiveHouseholdId,
  listUserHouseholds,
  markHouseholdSetupComplete,
  storeActiveHouseholdId,
  updateHouseholdName,
} from "./householdService.js";

const HouseholdContext = createContext(null);

export function HouseholdProvider({ children }) {
  const { user } = useAuth();
  const [memberships, setMemberships] = useState([]);
  const [activeHouseholdId, setActiveHouseholdIdState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHouseholds = useCallback(async () => {
    if (!user?.id) {
      setMemberships([]);
      setActiveHouseholdIdState(null);
      setLoading(false);
      return [];
    }

    setLoading(true);
    setError("");

    try {
      const nextMemberships = await listUserHouseholds();
      const storedHouseholdId = getStoredActiveHouseholdId(user.id);
      const storedMembership = nextMemberships.find(
        (membership) => membership.householdId === storedHouseholdId,
      );
      const fallbackMembership = nextMemberships[0] ?? null;
      const nextActiveHouseholdId =
        storedMembership?.householdId ?? fallbackMembership?.householdId ?? null;

      setMemberships(nextMemberships);
      setActiveHouseholdIdState(nextActiveHouseholdId);

      if (nextActiveHouseholdId) {
        storeActiveHouseholdId(user.id, nextActiveHouseholdId);
      } else {
        clearStoredActiveHouseholdId(user.id);
      }

      return nextMemberships;
    } catch (currentError) {
      setError(currentError.message || "Could not load households.");
      setMemberships([]);
      setActiveHouseholdIdState(null);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadHouseholds();
  }, [loadHouseholds]);

  const setActiveHouseholdId = useCallback(
    (householdId) => {
      if (!user?.id || !householdId) return;
      setActiveHouseholdIdState(householdId);
      storeActiveHouseholdId(user.id, householdId);
    },
    [user?.id],
  );

  const createInitialHousehold = useCallback(
    async (name) => {
      if (!user?.id) throw new Error("You must be signed in to create a household.");

      setError("");
      const householdId = await createFirstHousehold(name);
      const nextMemberships = await loadHouseholds();
      const nextActiveHouseholdId =
        householdId ?? nextMemberships[0]?.householdId ?? activeHouseholdId;

      if (nextActiveHouseholdId) {
        setActiveHouseholdId(nextActiveHouseholdId);
      }

      return nextActiveHouseholdId;
    },
    [activeHouseholdId, loadHouseholds, setActiveHouseholdId, user?.id],
  );

  const createAdditionalHousehold = useCallback(
    async (name) => {
      if (!user?.id) throw new Error("You must be signed in to create a household.");

      setError("");
      const household = await createHousehold(name);
      await loadHouseholds();

      if (household?.id) {
        setActiveHouseholdId(household.id);
      }

      return household;
    },
    [loadHouseholds, setActiveHouseholdId, user?.id],
  );

  const renameActiveHousehold = useCallback(
    async (name) => {
      if (!activeHouseholdId) throw new Error("Choose a household before renaming it.");
      const household = await updateHouseholdName(activeHouseholdId, name);
      await loadHouseholds();
      return household;
    },
    [activeHouseholdId, loadHouseholds],
  );

  const completeActiveHouseholdSetup = useCallback(async () => {
    if (!activeHouseholdId) throw new Error("Choose a household before finishing setup.");
    const household = await markHouseholdSetupComplete(activeHouseholdId);
    await loadHouseholds();
    return household;
  }, [activeHouseholdId, loadHouseholds]);

  const activeMembership = useMemo(
    () => memberships.find((membership) => membership.householdId === activeHouseholdId) ?? null,
    [activeHouseholdId, memberships],
  );

  const value = useMemo(
    () => ({
      memberships,
      households: memberships.map((membership) => membership.household),
      activeHouseholdId,
      activeHousehold: activeMembership?.household ?? null,
      activeMembership,
      loading,
      error,
      setError,
      setActiveHouseholdId,
      refreshHouseholds: loadHouseholds,
      createInitialHousehold,
      createAdditionalHousehold,
      renameActiveHousehold,
      completeActiveHouseholdSetup,
    }),
    [
      activeHouseholdId,
      activeMembership,
      createInitialHousehold,
      createAdditionalHousehold,
      renameActiveHousehold,
      completeActiveHouseholdSetup,
      error,
      loadHouseholds,
      loading,
      memberships,
      setActiveHouseholdId,
    ],
  );

  return <HouseholdContext.Provider value={value}>{children}</HouseholdContext.Provider>;
}

export function useHouseholds() {
  const value = useContext(HouseholdContext);

  if (!value) {
    throw new Error("useHouseholds must be used within HouseholdProvider.");
  }

  return value;
}
