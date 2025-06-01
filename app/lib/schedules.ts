import type { ScheduleFrame, Appointment } from "./types";
import { getUpcomingAppointments, getPastAppointments } from "./appointments";

// モックスケジュール枠データ
const scheduleFrames: ScheduleFrame[] = [
  {
    id: "1",
    title: "定期ミーティング",
    dates: [
      {
        id: "1-1",
        date: new Date(Date.now() + 86400000 * 2).toISOString(), // 2日後
        isBooked: true,
        scheduleFrameId: "1",
      },
      {
        id: "1-2",
        date: new Date(Date.now() + 86400000 * 3).toISOString(), // 3日後
        isBooked: false,
        scheduleFrameId: "1",
      },
      {
        id: "1-3",
        date: new Date(Date.now() + 86400000 * 4).toISOString(), // 4日後
        isBooked: false,
        scheduleFrameId: "1",
      },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "プロジェクト計画会議",
    dates: [
      {
        id: "2-1",
        date: new Date(Date.now() - 86400000 * 3).toISOString(), // 3日前
        isBooked: true,
        scheduleFrameId: "2",
      },
      {
        id: "2-2",
        date: new Date(Date.now() + 86400000 * 7).toISOString(), // 7日後
        isBooked: false,
        scheduleFrameId: "2",
      },
    ],
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
];

// 全スケジュール枠を取得
export async function getAllScheduleFrames() {
  return scheduleFrames;
}

// 特定のスケジュール枠を取得
export async function getScheduleFrame(scheduleId: string) {
  return scheduleFrames.find((frame) => frame.id === scheduleId) || null;
}

// スケジュール枠の予約状況を取得
export async function getScheduleAppointments(
  scheduleId: string
): Promise<Appointment[]> {
  const upcomingAppointments = await getUpcomingAppointments();
  const pastAppointments = await getPastAppointments();

  return [...upcomingAppointments, ...pastAppointments].filter(
    (appointment) => appointment.scheduleId === scheduleId
  );
}

// スケジュール枠の日程の予約状況を更新
export async function updateScheduleDateBookingStatus(
  scheduleId: string,
  date: string,
  isBooked: boolean
) {
  const scheduleFrameIndex = scheduleFrames.findIndex(
    (frame) => frame.id === scheduleId
  );

  if (scheduleFrameIndex === -1) {
    throw new Error("Schedule frame not found");
  }

  const dateIndex = scheduleFrames[scheduleFrameIndex].dates.findIndex(
    (d) => d.date === date
  );

  if (dateIndex === -1) {
    throw new Error("Date not found");
  }

  scheduleFrames[scheduleFrameIndex].dates[dateIndex].isBooked = isBooked;

  return scheduleFrames[scheduleFrameIndex];
}

// 新しいスケジュール枠を作成
export async function createScheduleFrame({
  title,
  dates,
}: {
  title: string;
  dates: string[];
}) {
  const id = self.crypto.randomUUID();

  const newScheduleFrame: ScheduleFrame = {
    id,
    title,
    dates: dates.map((date, index) => ({
      id: `${id}-${index + 1}`,
      date,
      isBooked: false,
      scheduleFrameId: id,
    })),
    createdAt: new Date().toISOString(),
  };

  scheduleFrames.push(newScheduleFrame);

  return newScheduleFrame;
}
