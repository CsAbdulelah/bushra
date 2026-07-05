type NavItem = { label: string; icon: React.ReactNode; active?: boolean };

const items: NavItem[] = [
  { label: "لوحة التحكم", icon: <Grid /> },
  { label: "الحسابات", icon: <User />, active: true },
  { label: "الحوالات", icon: <Transfer /> },
  { label: "سداد و دفع الفواتير", icon: <Card /> },
  { label: "التمويل والاكتتابات", icon: <Doc /> },
  { label: "استثمار", icon: <Chart /> },
  { label: "البطاقات", icon: <Card /> },
  { label: "الخدمات المصرفية المفتوحة", icon: <Globe /> },
  { label: "الخدمات والأدوات", icon: <Tools /> },
  { label: "المساعدة و الدعم", icon: <Phone /> },
  { label: "الملف الشخصي", icon: <User /> },
];

export function Sidebar() {
  return (
    <nav className="w-[205px] shrink-0 overflow-y-auto border-l border-black/[0.06] bg-white py-1.5">
      {items.map((it) => (
        <div
          key={it.label}
          className={`flex cursor-pointer items-center gap-2 px-3.5 py-2.5 text-[13px] font-semibold ${
            it.active ? "bg-[#f0e8e0]" : "hover:bg-alinma-sand"
          }`}
        >
          {it.icon}
          <span className="flex-1">{it.label}</span>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#7d6e63" strokeWidth="2.5">
            <polyline points="6,9 12,15 18,9" />
          </svg>
        </div>
      ))}

      {/* Accounts sub-nav (active) */}
      <div className="bg-alinma-navy px-3.5 py-2 pr-8 text-xs text-white">حساباتي</div>
      <div className="cursor-pointer px-3.5 py-2 pr-8 text-xs text-alinma-warm hover:bg-alinma-sand">حساب الأسرة</div>
      <div className="cursor-pointer px-3.5 py-2 pr-8 text-xs text-alinma-warm hover:bg-alinma-sand">العمالة المنزلية</div>
      <div className="cursor-pointer px-3.5 py-2 pr-8 text-xs leading-snug text-alinma-warm hover:bg-alinma-sand">
        الشهادات المصرفية الرقمية
      </div>

      <div className="mt-2 flex items-center gap-2 border-t border-black/[0.06] px-3.5 py-3">
        <div className="relative h-6 w-11 shrink-0 rounded-xl bg-alinma-navy">
          <div className="absolute right-[3px] top-[3px] h-[18px] w-[18px] rounded-full bg-white" />
        </div>
        <span className="text-xs text-alinma-warm">الوضع الفاتح</span>
      </div>
    </nav>
  );
}

function Grid() { return (<svg width="15" height="15" viewBox="0 0 24 24" fill="#15233a"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>); }
function User() { return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#15233a" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>); }
function Transfer() { return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#15233a" strokeWidth="2"><polyline points="17,1 21,5 17,9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7,23 3,19 7,15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>); }
function Card() { return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#15233a" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>); }
function Doc() { return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#15233a" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>); }
function Chart() { return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#15233a" strokeWidth="2"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>); }
function Globe() { return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#15233a" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>); }
function Tools() { return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#15233a" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>); }
function Phone() { return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#15233a" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 11.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3 .84h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 15z"/></svg>); }
