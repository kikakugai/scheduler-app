import { AdminHeader } from "~/components/admin/admin-header";
import { AdminShell } from "~/components/admin/admin-shell";
// import { AdminDashboardCards } from "~/components/admin/admin-dashboard-cards";
import { AdminAppointmentList } from "~/components/admin/admin-appointment-list";
// import { getAllUsers } from "~/lib/users";
// import { getAllScheduleFrames } from "~/lib/schedules";
import {
  getPastAppointments,
  getUpcomingAppointments,
} from "~/lib/appointments";
import { Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import { AppointmentSlots } from "~/components/admin/appointment-slots";

export default function AdminDashboardPage() {
  // const upcomingAppointments = await getUpcomingAppointments();
  // const pastAppointments = await getPastAppointments();

  // console.log(upcomingAppointments, pastAppointments);
  // const users = await getAllUsers();
  // const scheduleFrames = await getAllScheduleFrames();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <AdminShell>
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <AppointmentSlots />
      </div>

      <div className="grid gap-8 grid-cols-2">
        <AdminAppointmentList
          title="今後の予約"
          appointments={[]}
          emptyMessage="今後の予約はありません"
        />
        <AdminAppointmentList
          title="過去の予約"
          appointments={[]}
          emptyMessage="過去の予約はありません"
        />
      </div>
    </AdminShell>
  );
}
