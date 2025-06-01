import type { Appointment } from "./types";
import { getUser } from "./users";
import { getScheduleFrame, updateScheduleDateBookingStatus } from "./schedules";

// モック予約データ
const appointments: Appointment[] = [
  {
    id: "1",
    userId: "2",
    userName: "一般ユーザー",
    scheduleId: "1",
    scheduleTitle: "定期ミーティング",
    date: new Date(Date.now() + 86400000 * 2).toISOString(), // 2日後
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    userId: "2",
    userName: "一般ユーザー",
    scheduleId: "2",
    scheduleTitle: "プロジェクト計画会議",
    date: new Date(Date.now() - 86400000 * 3).toISOString(), // 3日前
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
];

// 予約リクエストを取得
export async function getIncomingRequests(userId: string) {
  // 実際のアプリケーションでは、未確定の予約リクエストを返す
  // モックデータでは空の配列を返す
  return [];
}

// 今後の予約を取得
export async function getUpcomingAppointments(userId?: string) {
  const now = new Date();

  if (userId) {
    return appointments
      .filter(
        (appointment) =>
          appointment.userId === userId && new Date(appointment.date) > now
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  return appointments
    .filter((appointment) => new Date(appointment.date) > now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// 過去の予約を取得
export async function getPastAppointments(userId?: string) {
  const now = new Date();

  if (userId) {
    return appointments
      .filter(
        (appointment) =>
          appointment.userId === userId && new Date(appointment.date) <= now
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  return appointments
    .filter((appointment) => new Date(appointment.date) <= now)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// 予約を確定
export async function confirmAppointment({
  scheduleId,
  userId,
  date,
}: {
  scheduleId: string;
  userId: string;
  date: string;
}) {
  const user = await getUser(userId);
  const scheduleFrame = await getScheduleFrame(scheduleId);

  if (!user || !scheduleFrame) {
    throw new Error("Invalid user or schedule");
  }

  // 日程が既に予約されていないか確認
  const scheduleDate = scheduleFrame.dates.find((d) => d.date === date);

  if (!scheduleDate || scheduleDate.isBooked) {
    throw new Error("Date is not available");
  }

  // 日程を予約済みに更新
  await updateScheduleDateBookingStatus(scheduleId, date, true);

  // 新しい予約を作成
  const newAppointment: Appointment = {
    id: self.crypto.randomUUID(),
    userId,
    userName: user.name,
    scheduleId,
    scheduleTitle: scheduleFrame.title,
    date,
    createdAt: new Date().toISOString(),
  };

  appointments.push(newAppointment);

  return newAppointment;
}
