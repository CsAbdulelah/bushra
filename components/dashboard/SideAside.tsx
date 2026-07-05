export function SideAside() {
  return (
    <aside className="flex w-[270px] shrink-0 flex-col gap-3.5 overflow-y-auto p-4">
      <div className="flex justify-center gap-5 py-2.5">
        <StatIcon label="إشعارات" badge="99+">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#15233a" strokeWidth="1.8">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </StatIcon>
        <StatIcon label="فواتير" badge="3">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#15233a" strokeWidth="1.8">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14,2 14,8 20,8" />
          </svg>
        </StatIcon>
        <StatIcon label="مخالفات" badge="1">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#15233a" strokeWidth="1.8">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </StatIcon>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <QuickTile label="نما" />
        <QuickTile label="طلب بطاقة" />
        <QuickTile label="الإنماء إكسرس" small />
        <QuickTile label="ويسترن يونيون" small />
      </div>

      <div className="rounded-xl bg-white p-4 shadow-card">
        <div className="mb-1.5 text-right text-base font-bold">أكثر</div>
        <div className="mb-2.5 text-right text-xs leading-relaxed text-alinma-warm">
          اجمع نقاط أكثر مع عملياتك المصرفية بكل سهولة
        </div>
        <div className="mb-3 text-right text-xl font-extrabold underline">216,418 نقطة</div>
        <button className="flex w-full items-center justify-center gap-1.5 rounded-lg border-[1.5px] border-alinma-navy bg-transparent p-2.5 text-[13px] font-semibold text-alinma-navy hover:bg-alinma-sand">
          استبدل نقاطك <span>›</span>
        </button>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-card">
        <div className="mb-3 text-right text-[15px] font-bold">ملخص الإنفاق — يونيو</div>
        <div className="flex flex-col gap-2.5">
          {[
            { amount: "540 ر.س", pct: 45, cat: "مطاعم", color: "#15233a" },
            { amount: "1,200 ر.س", pct: 76, cat: "تسوق", color: "#7d6e63" },
            { amount: "186 ر.س", pct: 16, cat: "فواتير", color: "#c8a02a" },
            { amount: "300 ر.س", pct: 25, cat: "تحويلات", color: "#3d7a4a" },
          ].map((row) => (
            <div key={row.cat} className="flex items-center gap-2">
              <span className="min-w-[70px] text-left text-xs font-semibold">{row.amount}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded bg-[#f0e8e0]">
                <div className="h-full rounded" style={{ width: `${row.pct}%`, background: row.color }} />
              </div>
              <span className="min-w-[46px] text-right text-[11px] text-alinma-warm">{row.cat}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function StatIcon({ label, badge, children }: { label: string; badge: string; children: React.ReactNode }) {
  return (
    <div className="flex cursor-pointer flex-col items-center gap-1">
      <div className="relative">
        {children}
        <span className="absolute -right-2 -top-1.5 min-w-[18px] rounded-[9px] bg-alinma-red px-1 py-px text-center text-[8px] font-bold text-white">
          {badge}
        </span>
      </div>
      <span className="text-[11px]">{label}</span>
    </div>
  );
}

function QuickTile({ label, small = false }: { label: string; small?: boolean }) {
  return (
    <div className="flex cursor-pointer flex-col items-center gap-2 rounded-xl bg-white p-4 shadow-card hover:bg-[#f8f0ea]">
      <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-alinma-sand">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#15233a" strokeWidth="2">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      </div>
      <span className={`text-center font-semibold ${small ? "text-[11px]" : "text-[13px]"}`}>{label}</span>
    </div>
  );
}
