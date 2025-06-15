import { useState } from "react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { Calendar, Clock } from "lucide-react"
import { ScheduleHeader } from "./schedule-header"
import { NavLink } from "react-router"

interface User {
  id: string
  name: string
  email: string
}

interface ScheduleDashboardProps {
  user: User
}

// サンプルデータ
const SAMPLE_PENDING_SCHEDULES = [
  {
    id: "pending-1",
    title: "プロジェクトミーティング",
    description: "新規プロジェクトの計画について話し合います",
    dates: [
      { id: "date-1", date: new Date(2025, 4, 25, 10, 0), available: true },
      { id: "date-2", date: new Date(2025, 4, 25, 14, 0), available: true },
      { id: "date-3", date: new Date(2025, 4, 26, 11, 0), available: true },
    ],
    createdAt: new Date(2025, 4, 15),
  },
  {
    id: "d7626d4f-8bf1-4fc3-bd46-fe3e720e16a1",
    title: "目標面談設定",
    description: "新製品の機能と価格について説明します",
    dates: [
      { id: "date-4", date: new Date(2025, 4, 27, 13, 0), available: true },
      { id: "date-5", date: new Date(2025, 4, 28, 15, 0), available: true },
      { id: "date-6", date: new Date(2025, 4, 29, 10, 0), available: false },
    ],
    createdAt: new Date(2025, 4, 16),
  },
]

const SAMPLE_UPCOMING_SCHEDULES = [
  {
    id: "upcoming-1",
    title: "定期ミーティング",
    description: "週次の進捗確認を行います",
    date: new Date(2025, 4, 22, 10, 0),
    createdAt: new Date(2025, 4, 10),
  },
  {
    id: "upcoming-2",
    title: "技術相談",
    description: "システム統合に関する技術的な課題について議論します",
    date: new Date(2025, 4, 24, 14, 0),
    createdAt: new Date(2025, 4, 12),
  },
]

const SAMPLE_PAST_SCHEDULES = [
  {
    id: "past-1",
    title: "キックオフミーティング",
    description: "プロジェクトの開始にあたり、目標と計画を共有します",
    date: new Date(2025, 3, 15, 11, 0),
    createdAt: new Date(2025, 3, 5),
  },
  {
    id: "past-2",
    title: "フォローアップミーティング",
    description: "前回の会議で決定した事項の進捗を確認します",
    date: new Date(2025, 4, 1, 13, 0),
    createdAt: new Date(2025, 3, 20),
  },
]

export function ScheduleDashboard({ user }: ScheduleDashboardProps) {
  const [activeTab, setActiveTab] = useState("pending")

  return (
    <div className="flex flex-col min-h-screen">
      <ScheduleHeader user={user} />

      <div className="container mx-auto px-4 py-6 flex-1">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">ようこそ、{user.name}さん</h1>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="pending">
              日程調整依頼
              {SAMPLE_PENDING_SCHEDULES.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {SAMPLE_PENDING_SCHEDULES.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="upcoming">予定されている日程</TabsTrigger>
            <TabsTrigger value="past">過去の日程</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {SAMPLE_PENDING_SCHEDULES.length > 0 ? (
              SAMPLE_PENDING_SCHEDULES.map((schedule) => (
                <Card key={schedule.id} className="select-none">
                  <CardHeader>
                    <CardTitle>{schedule.title}</CardTitle>
                    <CardDescription>{schedule.description}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <NavLink to={`/schedule/${schedule.id}`} className="w-full">
                      <Button className="w-full">日程を選択する</Button>
                    </NavLink>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <p className="text-muted-foreground">
                    現在、日程調整依頼はありません
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            {SAMPLE_UPCOMING_SCHEDULES.length > 0 ? (
              SAMPLE_UPCOMING_SCHEDULES.map((schedule) => (
                <Card key={schedule.id}>
                  <CardHeader>
                    <CardTitle>{schedule.title}</CardTitle>
                    <CardDescription>{schedule.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {format(schedule.date, "yyyy年MM月dd日(E)", {
                            locale: ja,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(schedule.date, "HH:mm", { locale: ja })}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <p className="text-muted-foreground">
                    予定されている日程はありません
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {SAMPLE_PAST_SCHEDULES.length > 0 ? (
              SAMPLE_PAST_SCHEDULES.map((schedule) => (
                <Card key={schedule.id} className="bg-muted/20">
                  <CardHeader>
                    <CardTitle>{schedule.title}</CardTitle>
                    <CardDescription>{schedule.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {format(schedule.date, "yyyy年MM月dd日(E)", {
                            locale: ja,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(schedule.date, "HH:mm", { locale: ja })}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <p className="text-muted-foreground">
                    過去の日程はありません
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
