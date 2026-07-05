import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { AccountsCard } from "./AccountsCard";
import { CardsCarousel } from "./CardsCarousel";
import { BeneficiariesRow } from "./BeneficiariesRow";
import { TransactionsList } from "./TransactionsList";
import { SideAside } from "./SideAside";

export function Dashboard() {
  return (
    <div className="flex h-screen flex-col overflow-hidden text-alinma-navy">
      <Header />
      <div dir="rtl" className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          <AccountsCard />
          <CardsCarousel />
          <BeneficiariesRow />
          <TransactionsList />
        </main>
        <SideAside />
      </div>
    </div>
  );
}
