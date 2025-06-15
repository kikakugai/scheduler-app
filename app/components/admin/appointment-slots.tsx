import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Button } from "~/components/ui/button"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

interface AppointmentSlotsProps {
  slots: any[]
  onAddSlot: (newSlot: any) => void
  onDeleteSlot: (slotId: string) => void
  onUpdateSlot: (updatedSlot: any) => void
}

// 平日のみを抽出する関数
const getWeekdaysInRange = (startDate: Date, endDate: Date): Date[] => {
  const weekdays: Date[] = []
  let currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay()
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      // 月曜(1)〜金曜(5)
      weekdays.push(new Date(currentDate))
    }
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return weekdays
}

// 時間枠を生成する関数
const generateTimeSlots = (intervalMinutes: number): string[] => {
  const slots: string[] = []
  let current = 18 * 60 // 18:00 (分換算)
  const end = 22 * 60 // 22:00 (分換算)

  while (current <= end) {
    const hours = Math.floor(current / 60)
    const minutes = current % 60
    slots.push(
      `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`
    )
    current += intervalMinutes
  }

  return slots
}

export function AppointmentSlots({ slots, onAddSlot }: AppointmentSlotsProps) {
  const [previewData, setPreviewData] = useState<{
    weekdayCount: number
    timeSlots: string[]
    totalSlots: number
  } | null>(null)

  // 新規予約枠作成フォーム
  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      startDate: undefined as Date | undefined,
      endDate: undefined as Date | undefined,
      timeInterval: "" as string,
    },
  })

  const watchedValues = form.watch()

  // プレビューデータの更新
  useEffect(() => {
    const { startDate, endDate, timeInterval } = watchedValues

    if (startDate && endDate && timeInterval) {
      try {
        const weekdays = getWeekdaysInRange(startDate, endDate)
        const timeSlots = generateTimeSlots(parseInt(timeInterval))

        setPreviewData({
          weekdayCount: weekdays.length,
          timeSlots,
          totalSlots: weekdays.length * timeSlots.length,
        })
      } catch (error) {
        setPreviewData(null)
      }
    } else {
      setPreviewData(null)
    }
  }, [watchedValues])

  // 予約枠作成
  const onSubmit = (data: any) => {
    try {
      const { startDate, endDate, timeInterval, title, description } = data

      // バリデーション
      if (!startDate || !endDate) {
        throw new Error("開始日と終了日を選択してください")
      }

      if (startDate > endDate) {
        throw new Error("終了日は開始日以降を選択してください")
      }

      if (startDate < new Date(new Date().setHours(0, 0, 0, 0))) {
        throw new Error("開始日は今日以降を選択してください")
      }

      if (!timeInterval) {
        throw new Error("時間間隔を選択してください")
      }

      // 平日を取得
      const weekdays = getWeekdaysInRange(startDate, endDate)

      if (weekdays.length === 0) {
        throw new Error("選択期間内に平日が含まれていません")
      }

      // 時間枠を生成
      const timeSlots = generateTimeSlots(parseInt(timeInterval))

      // 日時を組み合わせて予約枠を作成
      const dates: any[] = []
      let candidateIndex = 0

      weekdays.forEach((weekday) => {
        timeSlots.forEach((timeSlot) => {
          const [hours, minutes] = timeSlot.split(":").map(Number)
          const date = new Date(weekday)
          date.setHours(hours, minutes, 0, 0)

          dates.push({
            id: `new-date-${Date.now()}-${candidateIndex}`,
            date,
            reserved: false,
            userName: "",
          })
          candidateIndex++
        })
      })

      const newSlot = {
        id: `slot-${Date.now()}`,
        title,
        description,
        dates,
        status: "active",
        createdAt: new Date(),
      }

      onAddSlot(newSlot)
      form.reset({
        title: "",
        description: "",
        startDate: undefined,
        endDate: undefined,
        timeInterval: "",
      })
      setPreviewData(null)
      toast(
        `予約枠が作成されました！${dates.length}個の時間枠が追加されました。`
      )
    } catch (error) {
      toast((error as Error).message)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>新規予約枠の作成</CardTitle>
          <CardDescription>
            期間と時間間隔を指定して、平日の18:00-22:00の予約枠を自動生成します。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* 基本情報 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">基本情報</h3>

                <FormField
                  control={form.control}
                  name="title"
                  rules={{ required: "タイトルは必須です" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>タイトル</FormLabel>
                      <FormControl>
                        <Input placeholder="例: 定期ミーティング" {...field} />
                      </FormControl>
                      <FormDescription>
                        予約枠の目的や内容を入力してください
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  rules={{ required: "説明は必須です" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>説明</FormLabel>
                      <FormControl>
                        <textarea
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="例: プロジェクトの進捗確認を行います。各回約30分程度を予定しています。"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        予約の詳細な説明を入力してください
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* 期間設定 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">期間設定</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    rules={{ required: "開始日を選択してください" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>開始日</FormLabel>
                        <FormControl>
                          <input
                            type="date"
                            value={
                              field.value
                                ? field.value.toISOString().split("T")[0]
                                : ""
                            }
                            onChange={(e) => {
                              const selectedDate = e.target.value
                                ? new Date(e.target.value)
                                : undefined
                              field.onChange(selectedDate)
                            }}
                            onClick={(e) => {
                              // カレンダーを強制的に開くために要素をフォーカス
                              e.currentTarget.showPicker();
                            }}
                            min={new Date().toISOString().split("T")[0]}
                            max={
                              new Date(
                                new Date().setMonth(new Date().getMonth() + 6)
                              )
                                .toISOString()
                                .split("T")[0]
                            }
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 relative z-10 cursor-pointer"
                          />
                        </FormControl>
                        <FormDescription>
                          予約枠の開始日を選択してください
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    rules={{ required: "終了日を選択してください" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>終了日</FormLabel>
                        <FormControl>
                          <input
                            type="date"
                            value={
                              field.value
                                ? field.value.toISOString().split("T")[0]
                                : ""
                            }
                            onChange={(e) => {
                              const selectedDate = e.target.value
                                ? new Date(e.target.value)
                                : undefined
                              field.onChange(selectedDate)
                            }}
                            onClick={(e) => {
                              // カレンダーを強制的に開くために要素をフォーカス
                              e.currentTarget.showPicker();
                            }}
                            min={new Date().toISOString().split("T")[0]}
                            max={
                              new Date(
                                new Date().setMonth(new Date().getMonth() + 6)
                              )
                                .toISOString()
                                .split("T")[0]
                            }
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 relative z-10 cursor-pointer"
                          />
                        </FormControl>
                        <FormDescription>
                          予約枠の終了日を選択してください
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* 時間設定 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">時間設定</h3>

                <FormField
                  control={form.control}
                  name="timeInterval"
                  rules={{ required: "時間間隔を選択してください" }}
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>時間間隔</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="30min"
                              value="30"
                              checked={field.value === "30"}
                              onChange={(e) => field.onChange(e.target.value)}
                              className="h-4 w-4"
                            />
                            <Label
                              htmlFor="30min"
                              className="text-sm font-normal"
                            >
                              30分刻み（18:00, 18:30, 19:00, 19:30, 20:00,
                              20:30, 21:00, 21:30, 22:00）
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="60min"
                              value="60"
                              checked={field.value === "60"}
                              onChange={(e) => field.onChange(e.target.value)}
                              className="h-4 w-4"
                            />
                            <Label
                              htmlFor="60min"
                              className="text-sm font-normal"
                            >
                              1時間刻み（18:00, 19:00, 20:00, 21:00, 22:00）
                            </Label>
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>
                        18:00-22:00の時間枠の間隔を選択してください
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* プレビュー */}
              {previewData && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">プレビュー</h3>
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">対象平日数:</span>
                          <div className="text-lg font-bold text-blue-600">
                            {previewData.weekdayCount}日
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">
                            1日あたりの時間枠:
                          </span>
                          <div className="text-lg font-bold text-blue-600">
                            {previewData.timeSlots.length}枠
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">総予約枠数:</span>
                          <div className="text-lg font-bold text-blue-600">
                            {previewData.totalSlots}枠
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <span className="font-medium">時間枠:</span>
                        <div className="mt-1 text-sm text-gray-600">
                          {previewData.timeSlots.join(", ")}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="flex justify-center pt-6">
                <Button
                  type="submit"
                  size="lg"
                  className="min-w-[200px]"
                  disabled={!previewData}
                >
                  予約枠を作成
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
