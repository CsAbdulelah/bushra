import { Dashboard } from "@/components/dashboard/Dashboard";
import { BushraProvider } from "@/components/bushra/BushraProvider";
import { BushraOverlay } from "@/components/bushra/BushraOverlay";

export default function Home() {
  return (
    <BushraProvider>
      <Dashboard />
      <BushraOverlay />
    </BushraProvider>
  );
}
