import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import type { ScheduleFrame } from "~/lib/types";
import { NavLink } from "react-router";

interface ScheduleFrameListProps {
  scheduleFrames: ScheduleFrame[];
}

export function ScheduleFrameList({ scheduleFrames }: ScheduleFrameListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>スケジュール枠一覧</CardTitle>
        <CardDescription>作成されたスケジュール枠の一覧です</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {scheduleFrames.length > 0 ? (
            scheduleFrames.map((frame) => {
              const availableDates = frame.dates.filter(
                (date) => !date.isBooked
              ).length;
              const totalDates = frame.dates.length;

              return (
                <div
                  key={frame.id}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-4"
                >
                  <div className="space-y-1">
                    <div className="font-medium">{frame.title}</div>
                    <div className="text-sm text-muted-foreground">
                      作成日: {new Date(frame.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <Badge variant="outline">
                      {availableDates}/{totalDates} 空き
                    </Badge>
                    <NavLink to={`/admin/schedules/${frame.id}`}>
                      <Button size="sm">詳細を表示</Button>
                    </NavLink>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              スケジュール枠がありません
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
