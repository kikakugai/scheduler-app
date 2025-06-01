import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Users, Calendar, CalendarCheck } from "lucide-react";

interface AdminDashboardCardsProps {
  userCount: number;
  scheduleFrameCount: number;
  upcomingAppointmentCount: number;
}

export function AdminDashboardCards({
  userCount,
  scheduleFrameCount,
  upcomingAppointmentCount,
}: AdminDashboardCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">ユーザー数</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{userCount}</div>
          <p className="text-xs text-muted-foreground">登録ユーザー総数</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">スケジュール枠</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{scheduleFrameCount}</div>
          <p className="text-xs text-muted-foreground">
            作成されたスケジュール枠の総数
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">今後の予約</CardTitle>
          <CalendarCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{upcomingAppointmentCount}</div>
          <p className="text-xs text-muted-foreground">確定済みの予約数</p>
        </CardContent>
      </Card>
    </div>
  );
}
