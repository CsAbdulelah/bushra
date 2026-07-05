"use client";

import { useBushra } from "@/hooks/useBushra";
import { FaceIdModal } from "./FaceIdModal";
import { OtpModal } from "./OtpModal";

/**
 * Routes to the right confirmation modal.
 *
 * - Real-agent path: `pendingConfirmation` set by a `requires_confirmation`
 *   event. Modal → session.confirm → agent resumes.
 * - Local-mock path: `localFaceId` set by TransferConfirmCard. Modal →
 *   runs the callback (which sends a follow-up chat message).
 */
export function ConfirmationHost() {
  const b = useBushra();
  if (b.localFaceId) return <FaceIdModal />;
  if (!b.pendingConfirmation) return null;
  if (b.pendingConfirmation.kind === "face_id") return <FaceIdModal />;
  if (b.pendingConfirmation.kind === "otp") return <OtpModal />;
  return null;
}
