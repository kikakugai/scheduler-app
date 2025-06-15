// ユーザー
export interface User {
  id: string
  name: string
  email: string
  password: string
  isAdmin: boolean
  createdAt: string
}

// スケジュール枠の日程
export interface ScheduleDate {
  id: string
  date: string
  isBooked: boolean
  scheduleFrameId: string
}

// スケジュール枠
export interface ScheduleFrame {
  id: string
  title: string
  dates: ScheduleDate[]
  createdAt: string
}

// 予約
export interface Appointment {
  id: string
  userId: string
  userName: string
  scheduleId: string
  scheduleTitle: string
  date: string
  createdAt: string
}
