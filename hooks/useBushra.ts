"use client";

import { useContext } from "react";
import { BushraContext, type BushraState } from "@/components/bushra/BushraProvider";

export function useBushra(): BushraState {
  const ctx = useContext(BushraContext);
  if (!ctx) throw new Error("useBushra must be used inside <BushraProvider>");
  return ctx;
}
