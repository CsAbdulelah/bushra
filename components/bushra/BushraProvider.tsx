"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { BushraSession } from "@/lib/bushra/session";
import { AudioChunkPlayer } from "@/lib/bushra/audio-player";
import { speakReply } from "@/lib/bushra/tts";
import type { BushraEvent, FlowId } from "@/lib/bushra/events";

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  time: string;
};

export type FlowContext = Record<string, unknown> | undefined;

export type ConfirmationPrompt = {
  promptId: string;
  kind: "face_id" | "otp";
  context?: { amount?: number; recipient?: string; otpMaskedPhone?: string };
};

export type BushraState = {
  session: BushraSession;

  // Chat
  chatOpen: boolean;
  messages: ChatMessage[];
  inputText: string;
  isStreaming: boolean;
  activeFlow: FlowId | null;
  flowContext: FlowContext;

  // Voice
  voiceOpen: boolean;
  voicePhase: "idle" | "listening" | "processing";
  voiceText: string;

  // Confirmation
  pendingConfirmation: ConfirmationPrompt | null;
  /**
   * Client-driven Face ID request (used by the mock so no cross-request
   * agent state is needed). Real agents keep using `requires_confirmation`
   * events; both paths render the same modal.
   */
  localFaceId: { onOk: () => void } | null;

  // Proactive nudge
  proactiveVisible: boolean;

  // Actions
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  resetChat: () => void;
  setInputText: (v: string) => void;
  send: (text: string) => void;

  openVoice: () => void;
  stopVoice: () => void;
  setVoicePhase: (p: BushraState["voicePhase"]) => void;
  setVoiceText: (t: string) => void;

  dismissProactive: () => void;

  confirmFaceId: () => void;
  submitOtp: (otp: string) => void;
  cancelConfirmation: () => void;
  requestLocalFaceId: (onOk: () => void) => void;
};

export const BushraContext = createContext<BushraState | null>(null);

function nowLabel(): string {
  return new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
}

function makeMessage(role: ChatRole, text: string): ChatMessage {
  return { id: crypto.randomUUID(), role, text, time: nowLabel() };
}

export function BushraProvider({ children }: { children: ReactNode }) {
  const sessionRef = useRef<BushraSession | null>(null);
  if (!sessionRef.current) sessionRef.current = new BushraSession();
  const session = sessionRef.current;

  const playerRef = useRef<AudioChunkPlayer | null>(null);
  if (!playerRef.current) playerRef.current = new AudioChunkPlayer();

  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeFlow, setActiveFlow] = useState<FlowId | null>(null);
  const [flowContext, setFlowContext] = useState<FlowContext>(undefined);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [voicePhase, setVoicePhase] = useState<BushraState["voicePhase"]>("idle");
  const [voiceText, setVoiceText] = useState("");
  const [pendingConfirmation, setPendingConfirmation] = useState<ConfirmationPrompt | null>(null);
  const [localFaceId, setLocalFaceId] = useState<{ onOk: () => void } | null>(null);
  const [proactiveVisible, setProactiveVisible] = useState(false);

  // Nudge appears after 5s, mirroring the prototype.
  useEffect(() => {
    const t = setTimeout(() => setProactiveVisible(true), 5000);
    return () => clearTimeout(t);
  }, []);

  // Flow cards dispatched by the Realtime voice pipeline (which runs
  // outside the BushraSession event bus).
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as
        | { flowId: FlowId | null; flowContext?: Record<string, unknown> }
        | undefined;
      if (!detail) return;
      setActiveFlow(detail.flowId);
      setFlowContext(detail.flowContext);
    };
    window.addEventListener("bushra:flow", handler);
    return () => window.removeEventListener("bushra:flow", handler);
  }, []);

  // Wire session events to state.
  useEffect(() => {
    // Accumulator so message_end can hand the whole assistant reply to TTS.
    const buffers = new Map<string, string>();

    const off = session.on((evt: BushraEvent) => {
      switch (evt.type) {
        case "message_start":
          setIsStreaming(true);
          buffers.set(evt.messageId, "");
          setMessages((prev) => [...prev, { id: evt.messageId, role: "assistant", text: "", time: nowLabel() }]);
          break;
        case "token":
          setMessages((prev) => {
            if (prev.length === 0) return prev;
            const last = prev[prev.length - 1];
            if (last.role !== "assistant") return prev;
            buffers.set(last.id, (buffers.get(last.id) ?? "") + evt.text);
            return [...prev.slice(0, -1), { ...last, text: last.text + evt.text }];
          });
          break;
        case "message_end": {
          setIsStreaming(false);
          const full = buffers.get(evt.messageId);
          buffers.delete(evt.messageId);
          if (full && full.trim()) void speakReply(full);
          break;
        }
        case "flow":
          setActiveFlow(evt.flow);
          setFlowContext(evt.context);
          break;
        case "audio_chunk":
          playerRef.current?.enqueue(evt.data, evt.mime, evt.sampleRate).catch(() => {});
          break;
        case "requires_confirmation":
          setPendingConfirmation({ promptId: evt.promptId, kind: evt.kind, context: evt.context });
          break;
        case "done":
          setIsStreaming(false);
          break;
        case "error":
          setIsStreaming(false);
          setMessages((prev) => [
            ...prev,
            makeMessage("assistant", `⚠️ ${evt.message}`),
          ]);
          break;
      }
    });
    return off;
  }, [session]);

  const openChat = useCallback(() => {
    setChatOpen(true);
    setProactiveVisible(false);
    setMessages((prev) => {
      if (prev.length > 0) return prev;
      return [
        makeMessage(
          "assistant",
          "مرحباً عبدالله! 👋\nأنا بشرى، مساعدتك الذكية في بنك الإنماء.\nيمكنني مساعدتك في التحويلات، الفواتير، البطاقات، والمنتجات المصرفية.\nبماذا أستطيع مساعدتك اليوم؟",
        ),
      ];
    });
  }, []);

  const closeChat = useCallback(() => setChatOpen(false), []);
  const toggleChat = useCallback(() => setChatOpen((v) => !v), []);
  const dismissProactive = useCallback(() => setProactiveVisible(false), []);

  const resetChat = useCallback(() => {
    session.cancel();
    setMessages([]);
    setActiveFlow(null);
    setFlowContext(undefined);
    setIsStreaming(false);
    setInputText("");
    setPendingConfirmation(null);
    setChatOpen(true);
    // Seed the greeting again.
    setTimeout(() => {
      setMessages([
        makeMessage(
          "assistant",
          "مرحباً عبدالله! 👋\nأنا بشرى، مساعدتك الذكية في بنك الإنماء.\nبماذا أستطيع مساعدتك اليوم؟",
        ),
      ]);
    }, 100);
  }, [session]);

  const send = useCallback(
    (text: string) => {
      const clean = text.trim();
      if (!clean || isStreaming) return;
      setMessages((prev) => [...prev, makeMessage("user", clean)]);
      setInputText("");
      setActiveFlow(null);
      setIsStreaming(true);
      session.send(clean).catch(() => setIsStreaming(false));
    },
    [isStreaming, session],
  );

  const openVoice = useCallback(() => {
    setVoiceOpen(true);
    setVoicePhase("listening");
    setVoiceText("جاري الاستماع…");
  }, []);

  const stopVoice = useCallback(() => {
    setVoiceOpen(false);
    setVoicePhase("idle");
    setVoiceText("");
  }, []);

  const confirmFaceId = useCallback(() => {
    // Local-mock path: run the callback and clear state.
    if (localFaceId) {
      const { onOk } = localFaceId;
      setLocalFaceId(null);
      onOk();
      return;
    }
    // Real-agent path: POST /confirmations so the agent resumes.
    if (!pendingConfirmation) return;
    session.confirm({ promptId: pendingConfirmation.promptId, ok: true });
    setPendingConfirmation(null);
  }, [localFaceId, pendingConfirmation, session]);

  const requestLocalFaceId = useCallback((onOk: () => void) => {
    setLocalFaceId({ onOk });
  }, []);

  const submitOtp = useCallback(
    (otp: string) => {
      if (!pendingConfirmation) return;
      session.confirm({ promptId: pendingConfirmation.promptId, ok: true, otp });
      setPendingConfirmation(null);
    },
    [pendingConfirmation, session],
  );

  const cancelConfirmation = useCallback(() => {
    if (localFaceId) {
      setLocalFaceId(null);
      setActiveFlow(null);
      return;
    }
    if (!pendingConfirmation) return;
    session.confirm({
      promptId: pendingConfirmation.promptId,
      ok: false,
      reason: "user_cancelled",
    });
    setPendingConfirmation(null);
    setActiveFlow(null);
  }, [localFaceId, pendingConfirmation, session]);

  const value = useMemo<BushraState>(
    () => ({
      session,
      chatOpen,
      messages,
      inputText,
      isStreaming,
      activeFlow,
      flowContext,
      voiceOpen,
      voicePhase,
      voiceText,
      pendingConfirmation,
      localFaceId,
      proactiveVisible,
      openChat,
      closeChat,
      toggleChat,
      resetChat,
      setInputText,
      send,
      openVoice,
      stopVoice,
      setVoicePhase,
      setVoiceText,
      dismissProactive,
      confirmFaceId,
      requestLocalFaceId,
      submitOtp,
      cancelConfirmation,
    }),
    [
      session,
      chatOpen,
      messages,
      inputText,
      isStreaming,
      activeFlow,
      flowContext,
      voiceOpen,
      voicePhase,
      voiceText,
      pendingConfirmation,
      localFaceId,
      proactiveVisible,
      openChat,
      closeChat,
      toggleChat,
      resetChat,
      send,
      openVoice,
      stopVoice,
      dismissProactive,
      confirmFaceId,
      requestLocalFaceId,
      submitOtp,
      cancelConfirmation,
    ],
  );

  return <BushraContext.Provider value={value}>{children}</BushraContext.Provider>;
}
