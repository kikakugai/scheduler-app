import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import type { ScheduleFrame, Appointment } from "~/lib/types";

interface ScheduleFrameDetailProps {
  scheduleFrame: ScheduleFrame;
  appointments: Appointment[];
}

export function ScheduleFrameDetail({
  scheduleFrame,
  appointments,
}: ScheduleFrameDetailProps) {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>スケジュール枠詳細</CardTitle>
          <CardDescription>スケジュール枠の詳細情報</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium">タイトル</h3>
                <p>{scheduleFrame.title}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">作成日</h3>
                <p>{new Date(scheduleFrame.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">日程オプション</h3>
              <div className="grid gap-2">
                {scheduleFrame.dates.map((date) => {
                  const dateObj = new Date(date.date);
                  return (
                    <div
                      key={date.id}
                      className="flex justify-between items-center border p-3 rounded-md"
                    >
                      <div>
                        {dateObj.toLocaleDateString()}{" "}
                        {dateObj.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <Badge variant={date.isBooked ? "default" : "outline"}>
                        {date.isBooked ? "予約済み" : "空き"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>予約状況</CardTitle>
          <CardDescription>このスケジュール枠の予約状況</CardDescription>
        </CardHeader>
        <CardContent>
          {appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-4"
                >
                  <div className="space-y-1">
                    <div className="font-medium">{appointment.userName}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(appointment.date).toLocaleDateString()}{" "}
                      {new Date(appointment.date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <Badge>確定済み</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              予約はまだありません
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
