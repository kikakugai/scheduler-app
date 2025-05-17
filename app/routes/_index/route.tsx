import { ScheduleDashboard } from "~/components/schedule/schedule-dashboard";
import type { Route } from "./+types/route";

export default function Route() {
  const user = {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "admin",
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <ScheduleDashboard user={user}></ScheduleDashboard>
    </main>
  );
}
