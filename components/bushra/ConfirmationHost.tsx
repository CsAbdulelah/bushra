"use client";

import { useBushra } from "@/hooks/useBushra";
import { FaceIdModal } from "./FaceIdModal";
import { OtpModal } from "./OtpModal";

/** Routes agent `requires_confirmation` events to the matching modal. */
export function ConfirmationHost() {
  const b = useBushra();
  if (!b.pendingConfirmation) return null;
  if (b.pendingConfirmation.kind === "face_id") return <FaceIdModal />;
  if (b.pendingConfirmation.kind === "otp") return <OtpModal />;
  return null;
}
