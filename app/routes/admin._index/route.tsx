import { useState } from "react"
import { AdminShell } from "~/components/admin/admin-shell"
import { AdminAppointmentList } from "~/components/admin/admin-appointment-list"
import { AppointmentSlots } from "~/components/admin/appointment-slots"
import { UserList } from "~/components/admin/user-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Badge } from "~/components/ui/badge"
import {
  getPastAppointments,
  getUpcomingAppointments,
} from "~/lib/appointments"
import type { Appointment, User, ScheduleFrame } from "~/lib/types"

// サンプルデータ生成関数
const generateSampleSlots = () => {
  const now = new Date()
  const startDate = new Date(now)
  startDate.setDate(now.getDate() + 3)

  return [
    {
      id: "1",
      title: "定期ミーティング",
      dates: [
        {
          id: "date-1",
          date: new Date(startDate.setHours(10, 0, 0, 0)),
          reserved: false,
          userName: "",
        },
        {
          id: "date-2",
          date: new Date(startDate.setHours(14, 0, 0, 0)),
          reserved: false,
          userName: "",
        },
      ],
      status: "active",
      createdAt: now,
    },
    {
      id: "2",
      title: "プロジェクト相談",
      dates: [
        {
          id: "date-3",
          date: new Date(new Date(startDate).setDate(startDate.getDate() + 1)),
          reserved: true,
          userName: "山田太郎",
        },
        {
          id: "date-4",
          date: new Date(new Date(startDate).setDate(startDate.getDate() + 2)),
          reserved: false,
          userName: "",
        },
      ],
      status: "active",
      createdAt: now,
    },
    {
      id: "3",
      title: "商品説明会",
      dates: [
        {
          id: "date-5",
          date: new Date(new Date(startDate).setDate(startDate.getDate() + 3)),
          reserved: true,
          userName: "佐藤花子",
        },
        {
          id: "date-6",
          date: new Date(new Date(startDate).setDate(startDate.getDate() + 4)),
          reserved: false,
          userName: "",
        },
        {
          id: "date-7",
          date: new Date(new Date(startDate).setDate(startDate.getDate() + 5)),
          reserved: false,
          userName: "",
        },
      ],
      status: "active",
      createdAt: now,
    },
  ]
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("slots")
  const [scheduleSlots, setScheduleSlots] = useState(generateSampleSlots())

  // サンプルデータ - 実際の実装ではAPIから取得
  const users: User[] = [
    {
      id: "1",
      name: "管理者",
      email: "admin@example.com",
      password: "",
      isAdmin: true,
      createdAt: "",
    },
    {
      id: "2",
      name: "山田太郎",
      email: "yamada@example.com",
      password: "",
      isAdmin: false,
      createdAt: "",
    },
    {
      id: "3",
      name: "佐藤花子",
      email: "sato@example.com",
      password: "",
      isAdmin: false,
      createdAt: "",
    },
  ]

  // 予約枠から予約済みのアポイントメントを生成
  const generateAppointmentsFromSlots = (slots: any[]): Appointment[] => {
    const appointments: Appointment[] = []

    slots.forEach((slot) => {
      slot.dates.forEach((date: any) => {
        if (date.reserved && date.userName) {
          appointments.push({
            id: `${slot.id}-${date.id}`,
            userId: date.userName === "山田太郎" ? "2" : "3", // サンプル用のマッピング
            userName: date.userName,
            scheduleId: slot.id,
            scheduleTitle: slot.title,
            date: date.date.toISOString(),
            createdAt: slot.createdAt.toISOString(),
          })
        }
      })
    })

    return appointments
  }

  const upcomingAppointments = generateAppointmentsFromSlots(scheduleSlots)
  const pastAppointments: Appointment[] = [] // 過去の予約は別途管理

  // 新規予約枠の数をカウント（予約が入っていない枠の数）
  const newSlotsCount = scheduleSlots.filter((slot) =>
    slot.dates.some((date: any) => !date.reserved)
  ).length

  // 予約枠を追加する関数
  const handleAddSlot = (newSlot: any) => {
    setScheduleSlots((prev) => [...prev, newSlot])
  }

  // 予約枠を削除する関数
  const handleDeleteSlot = (slotId: string) => {
    setScheduleSlots((prev) => prev.filter((slot) => slot.id !== slotId))
  }

  // 予約枠を更新する関数
  const handleUpdateSlot = (updatedSlot: any) => {
    setScheduleSlots((prev) =>
      prev.map((slot) => (slot.id === updatedSlot.id ? updatedSlot : slot))
    )
  }

  return (
    <AdminShell>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="slots">
            新規予約枠
            {newSlotsCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {newSlotsCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="upcoming">今後の予約</TabsTrigger>
          <TabsTrigger value="past">過去の予約</TabsTrigger>
          <TabsTrigger value="users">ユーザー管理</TabsTrigger>
        </TabsList>

        <TabsContent value="slots" className="space-y-4">
          <AppointmentSlots
            slots={scheduleSlots}
            onAddSlot={handleAddSlot}
            onDeleteSlot={handleDeleteSlot}
            onUpdateSlot={handleUpdateSlot}
          />
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <AdminAppointmentList
            title="今後の予約"
            appointments={upcomingAppointments}
            emptyMessage="今後の予約はありません"
          />
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          <AdminAppointmentList
            title="過去の予約"
            appointments={pastAppointments}
            emptyMessage="過去の予約はありません"
          />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <UserList users={users} />
        </TabsContent>
      </Tabs>
    </AdminShell>
  )
}
