import { useCallback, useEffect, useState } from "react";
import {
  addHouseholdProfile,
  createDefaultHouseholdProfiles,
  deactivateHouseholdProfile,
  listHouseholdProfiles,
  updateHouseholdProfile,
} from "./householdProfilesService.js";

export function useHouseholdProfiles({
  activeHouseholdId,
  supabaseCreditCards,
  onProfilesChanged,
}) {
  const [householdProfiles, setHouseholdProfiles] = useState([]);
  const [householdProfilesLoading, setHouseholdProfilesLoading] = useState(true);
  const [householdProfilesSaving, setHouseholdProfilesSaving] = useState(false);
  const [householdProfilesError, setHouseholdProfilesError] = useState("");

  const loadHouseholdProfiles = useCallback(async () => {
    if (!activeHouseholdId) {
      setHouseholdProfiles([]);
      setHouseholdProfilesLoading(false);
      return [];
    }

    setHouseholdProfilesLoading(true);
    setHouseholdProfilesError("");

    try {
      const profiles = await listHouseholdProfiles(activeHouseholdId);
      setHouseholdProfiles(profiles);
      return profiles;
    } catch (error) {
      setHouseholdProfilesError(error.message || "Could not load household profiles.");
      setHouseholdProfiles([]);
      return [];
    } finally {
      setHouseholdProfilesLoading(false);
    }
  }, [activeHouseholdId]);

  useEffect(() => {
    loadHouseholdProfiles();
  }, [loadHouseholdProfiles]);

  const createHouseholdProfile = useCallback(
    async (input) => {
      setHouseholdProfilesSaving(true);
      setHouseholdProfilesError("");

      try {
        const profile = await addHouseholdProfile(activeHouseholdId, input);
        setHouseholdProfiles((profiles) =>
          [...profiles, profile].sort((a, b) => a.displayName.localeCompare(b.displayName)),
        );
        return profile;
      } catch (error) {
        setHouseholdProfilesError(error.message || "Could not add household profile.");
        throw error;
      } finally {
        setHouseholdProfilesSaving(false);
      }
    },
    [activeHouseholdId],
  );

  const saveHouseholdProfile = useCallback(
    async (profileId, input) => {
      setHouseholdProfilesSaving(true);
      setHouseholdProfilesError("");

      try {
        const profile = await updateHouseholdProfile(profileId, input);
        setHouseholdProfiles((profiles) =>
          profiles
            .map((currentProfile) => (currentProfile.id === profile.id ? profile : currentProfile))
            .sort((a, b) => a.displayName.localeCompare(b.displayName)),
        );
        if (onProfilesChanged) {
          await onProfilesChanged();
        }
        return profile;
      } catch (error) {
        setHouseholdProfilesError(error.message || "Could not update household profile.");
        throw error;
      } finally {
        setHouseholdProfilesSaving(false);
      }
    },
    [onProfilesChanged],
  );

  const deactivateProfile = useCallback(
    async (profileId) => {
      setHouseholdProfilesSaving(true);
      setHouseholdProfilesError("");

      try {
        const profile = await deactivateHouseholdProfile(profileId);
        setHouseholdProfiles((profiles) =>
          profiles.map((currentProfile) =>
            currentProfile.id === profile.id ? profile : currentProfile,
          ),
        );
        if (onProfilesChanged) {
          await onProfilesChanged();
        }
        return profile;
      } catch (error) {
        setHouseholdProfilesError(error.message || "Could not deactivate household profile.");
        throw error;
      } finally {
        setHouseholdProfilesSaving(false);
      }
    },
    [onProfilesChanged],
  );

  const addDefaultProfiles = useCallback(async () => {
    setHouseholdProfilesSaving(true);
    setHouseholdProfilesError("");

    try {
      const existingOwnerNames = [
        ...new Set(supabaseCreditCards.map((card) => card.owner?.trim()).filter(Boolean)),
      ];
      if (existingOwnerNames.length === 0) {
        setHouseholdProfilesError(
          "No existing card owner names were found. Add profiles manually.",
        );
        return [];
      }
      const profiles = await createDefaultHouseholdProfiles(
        activeHouseholdId,
        householdProfiles,
        existingOwnerNames,
      );
      if (profiles.length > 0) {
        setHouseholdProfiles((currentProfiles) =>
          [...currentProfiles, ...profiles].sort((a, b) =>
            a.displayName.localeCompare(b.displayName),
          ),
        );
      }
      return profiles;
    } catch (error) {
      setHouseholdProfilesError(error.message || "Could not create default profiles.");
      throw error;
    } finally {
      setHouseholdProfilesSaving(false);
    }
  }, [activeHouseholdId, householdProfiles, supabaseCreditCards]);

  return {
    householdProfiles,
    householdProfilesLoading,
    householdProfilesSaving,
    householdProfilesError,
    loadHouseholdProfiles,
    createHouseholdProfile,
    saveHouseholdProfile,
    deactivateProfile,
    addDefaultProfiles,
  };
}
