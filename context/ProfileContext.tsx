"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  loadCapabilityStatement,
  loadProfile,
  loadSavedOpportunities,
  saveCapabilityStatement,
  saveProfile,
  toggleSavedOpportunity,
} from "@/lib/profile";
import type { Opportunity, Profile } from "@/lib/types";

type ProfileContextValue = {
  profile: Profile | null;
  hydrated: boolean;
  setProfile: (p: Profile | null) => void;
  capabilityStatement: string;
  setCapabilityStatement: (s: string) => void;
  savedIds: string[];
  savedOpportunities: Opportunity[];
  toggleSaved: (opp: Opportunity) => void;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [capabilityStatement, setCapabilityStatementState] = useState("");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [savedOpportunities, setSavedOpportunities] = useState<Opportunity[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = loadSavedOpportunities();
    setProfileState(loadProfile());
    setCapabilityStatementState(loadCapabilityStatement());
    setSavedOpportunities(saved);
    setSavedIds(saved.map((o) => o.id));
    setHydrated(true);
  }, []);

  const setProfile = useCallback((p: Profile | null) => {
    setProfileState(p);
    saveProfile(p);
  }, []);

  const setCapabilityStatement = useCallback((s: string) => {
    setCapabilityStatementState(s);
    saveCapabilityStatement(s);
  }, []);

  const toggleSaved = useCallback((opp: Opportunity) => {
    const next = toggleSavedOpportunity(opp);
    setSavedOpportunities(next);
    setSavedIds(next.map((o) => o.id));
  }, []);

  const value = useMemo(
    () => ({
      profile,
      hydrated,
      setProfile,
      capabilityStatement,
      setCapabilityStatement,
      savedIds,
      savedOpportunities,
      toggleSaved,
    }),
    [
      profile,
      hydrated,
      setProfile,
      capabilityStatement,
      setCapabilityStatement,
      savedIds,
      savedOpportunities,
      toggleSaved,
    ]
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used inside ProfileProvider");
  return ctx;
}
