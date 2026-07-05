"use client";

import { useEffect, useRef, useState } from "react";
import { useBushra } from "@/hooks/useBushra";

const LEN = 6;

export function OtpModal() {
  const b = useBushra();
  const [digits, setDigits] = useState<string[]>(Array(LEN).fill(""));
  const [timer, setTimer] = useState(59);
  const [shake, setShake] = useState(false);
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const maskedPhone = b.pendingConfirmation?.context?.otpMaskedPhone ?? "••30";

  useEffect(() => {
    refs.current[0]?.focus();
    const iv = setInterval(() => setTimer((t) => (t <= 1 ? 0 : t - 1)), 1000);
    return () => clearInterval(iv);
  }, []);

  const setDigit = (i: number, v: string) => {
    const clean = v.replace(/\D/g, "").slice(0, 1);
    setDigits((prev) => {
      const next = [...prev];
      next[i] = clean;
      return next;
    });
    if (clean && i < LEN - 1) refs.current[i + 1]?.focus();
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      setDigit(i - 1, "");
      refs.current[i - 1]?.focus();
    }
  };

  const submit = () => {
    const otp = digits.join("");
    if (otp.length < LEN) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    b.submitOtp(otp);
  };

  return (
    <div
      dir="rtl"
      className="animate-slide-up fixed inset-0 z-[2001] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.7)" }}
    >
      <div className="w-[340px] rounded-3xl bg-white p-6 shadow-panel">
        <div className="mb-4 text-center">
          <div className="mb-1.5 text-[26px]">📱</div>
          <div className="mb-1 text-[13px] font-bold text-alinma-navy">أدخل رمز التحقق</div>
          <div className="text-[11px] text-alinma-warm">
            رمز مكون من 6 أرقام • الجوال المنتهي بـ {maskedPhone}
          </div>
        </div>

        <div dir="ltr" className="mb-3.5 flex justify-center gap-1.5">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              className={`h-[46px] w-[38px] rounded-[10px] border-2 text-center text-xl font-bold text-alinma-navy outline-none focus:border-alinma-navy ${
                shake ? "animate-otp-shake border-alinma-red" : "border-black/12"
              }`}
            />
          ))}
        </div>

        <div className="mb-3 flex items-center justify-between">
          <button className="cursor-pointer border-0 bg-transparent text-xs text-alinma-navy underline">
            إعادة الإرسال
          </button>
          <span className="text-[11px] text-alinma-warm">{timer} ثانية</span>
        </div>

        <button
          onClick={submit}
          className="w-full cursor-pointer rounded-[9px] border-0 bg-alinma-navy px-3 py-2.5 text-[13px] font-semibold text-white hover:bg-alinma-navy-2"
        >
          تأكيد التحويل
        </button>
        <button
          onClick={b.cancelConfirmation}
          className="mt-1 w-full cursor-pointer border-0 bg-transparent p-2 text-xs text-alinma-warm hover:text-alinma-navy"
        >
          إلغاء
        </button>
      </div>
    </div>
  );
}
