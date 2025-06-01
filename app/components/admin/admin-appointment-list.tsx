import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import type { Appointment } from "~/lib/types";

interface AdminAppointmentListProps {
  title: string;
  appointments: Appointment[];
  emptyMessage: string;
}

export function AdminAppointmentList({
  title,
  appointments,
  emptyMessage,
}: AdminAppointmentListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {appointments.length > 0
            ? `${appointments.length}件の予約があります`
            : emptyMessage}
        </CardDescription>
      </CardHeader>
      {appointments.length > 0 ? (
        <CardContent>
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-4"
              >
                <div className="space-y-1">
                  <div className="font-medium">{appointment.scheduleTitle}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(appointment.date).toLocaleDateString()}{" "}
                    {new Date(appointment.date).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <div className="text-sm">{appointment.userName}</div>
                  <Badge variant="outline" className="bg-green-50">
                    確定済み
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      ) : null}
    </Card>
  );
}
