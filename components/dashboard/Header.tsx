export function Header() {
  return (
    <header dir="ltr" className="flex h-16 shrink-0 items-center gap-3.5 border-b border-black/[0.07] bg-white px-5 z-10">
      <div className="flex shrink-0 items-center gap-2.5">
        <div className="flex h-[46px] w-[46px] items-center justify-center rounded-[9px] bg-alinma-navy text-[22px] font-extrabold text-white">ا</div>
        <div>
          <div dir="rtl" className="text-[17px] font-extrabold leading-none text-alinma-navy">الإنماء</div>
          <div className="text-[10px] font-semibold tracking-[1.5px] text-alinma-navy">alinma</div>
        </div>
      </div>

      <div className="mx-5 flex max-w-[480px] flex-1 items-center gap-2 rounded-3xl bg-alinma-sand px-4 py-[9px]">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7d6e63" strokeWidth="2.5">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="بحث"
          dir="rtl"
          className="flex-1 border-0 bg-transparent text-sm text-alinma-warm outline-none"
        />
      </div>

      <div className="ml-auto flex shrink-0 cursor-pointer items-center gap-1.5 rounded-[20px] bg-alinma-sand px-3.5 py-2">
        <span dir="rtl" className="text-[13px]">مرحباً، عبدالله الكسيبيري</span>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#15233a" strokeWidth="2.5">
          <polyline points="6,9 12,15 18,9" />
        </svg>
      </div>

      <div className="flex shrink-0 cursor-pointer items-center gap-1 text-[13px] font-medium">
        English
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#15233a" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      </div>

      <button className="flex shrink-0 items-center gap-1.5 rounded-lg border-[1.5px] border-alinma-navy bg-transparent px-3.5 py-2 text-[13px] text-alinma-navy">
        خروج
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#15233a" strokeWidth="2.5">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16,17 21,12 16,7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>
    </header>
  );
}
