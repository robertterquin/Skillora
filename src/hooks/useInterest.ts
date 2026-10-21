"use client";

import { useCallback, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { findInterest, Interest } from "@/lib/interests";
import { getSupabase } from "@/lib/supabase";
import { readString, writeString, STORAGE_KEYS } from "@/lib/storage";

export function useInterest(user: User | null, authReady: boolean) {
  const [interest, setInterestState] = useState<Interest | undefined>();

  useEffect(() => {
    if (!authReady) return;
    const fromAccount = user?.user_metadata?.primary_interest as string | undefined;
    setInterestState(findInterest(fromAccount) ?? findInterest(readString(STORAGE_KEYS.interest)));
  }, [user, authReady]);

  const setInterest = useCallback(
    (id: string) => {
      const next = findInterest(id);
      if (!next) return;
      setInterestState(next);
      writeString(STORAGE_KEYS.interest, id);
      if (user) {
        getSupabase()
          .auth.updateUser({ data: { primary_interest: id } })
          .then(({ error }) => {
            if (error) console.warn("Could not save interest to account", error.message);
          });
      }
    },
    [user]
  );

  return { interest, setInterest };
}
