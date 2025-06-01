import { ScheduleDashboard } from "~/components/schedule/schedule-dashboard"
import type { Route } from "./+types/route"

export default function Route() {
  const user = {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "admin",
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-5xl">
        <main className="px-4 py-6 sm:px-6 md:px-8 md:py-8">
          <ScheduleDashboard user={user} />
        </main>
      </div>
    </div>
  )
}
