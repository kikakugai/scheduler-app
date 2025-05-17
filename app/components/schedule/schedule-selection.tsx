import { useState } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Calendar, Clock, ArrowLeft, Check } from "lucide-react";
import { useNavigate } from "react-router";
import { ScheduleHeader } from "./schedule-header";
import { toast } from "sonner";

interface ScheduleSelectionProps {
  scheduleId: string;
}

// サンプルデータ
const SAMPLE_SCHEDULES = {
  "pending-1": {
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
  "pending-2": {
    id: "pending-2",
    title: "商品説明会",
    description: "新製品の機能と価格について説明します",
    dates: [
      { id: "date-4", date: new Date(2025, 4, 27, 13, 0), available: true },
      { id: "date-5", date: new Date(2025, 4, 28, 15, 0), available: true },
      { id: "date-6", date: new Date(2025, 4, 29, 10, 0), available: false },
    ],
    createdAt: new Date(2025, 4, 16),
  },
};

export function ScheduleSelection({ scheduleId }: ScheduleSelectionProps) {
  const navigate = useNavigate();
  const [selectedDateId, setSelectedDateId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 仮のユーザー情報（実際の実装ではセッションから取得）
  const user = {
    id: "user-1",
    name: "山田太郎",
    email: "yamada~example.com",
  };

  // 予約情報を取得（実際の実装ではAPIリクエスト）
  const schedule =
    SAMPLE_SCHEDULES[scheduleId as keyof typeof SAMPLE_SCHEDULES];

  if (!schedule) {
    return (
      <div className="flex flex-col min-h-screen">
        <ScheduleHeader user={user} />
        <div className="container mx-auto px-4 py-6 flex-1 flex items-center justify-center">
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <p className="text-muted-foreground">
                指定された日程調整が見つかりません
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                ダッシュボードに戻る
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleSelectDate = (dateId: string) => {
    setSelectedDateId(dateId);
  };

  const handleConfirm = async () => {
    if (!selectedDateId) {
      toast.error("日程を選択してください");
      // toast({
      //   title: "エラー",
      //   description: "日程を選択してください",
      //   variant: "destructive",
      // });
      return;
    }

    setLoading(true);

    try {
      // 実際の実装ではAPIリクエストで予約確定
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // toast({
      //   title: "予約完了",
      //   description: "日程が確定しました",
      // });
      toast.info("予約が完了しました。");

      // 予約完了後のリダイレクト
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      toast.error("予約に失敗しました。もう一度お試しください");
      // toast({
      //   title: "エラー",
      //   description: "予約に失敗しました。もう一度お試しください",
      //   variant: "destructive",
      // });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <ScheduleHeader user={user} />

      <div className="container mx-auto px-4 py-6 flex-1">
        <Button
          variant="outline"
          className="mb-6"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          ダッシュボードに戻る
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{schedule.title}</CardTitle>
            <CardDescription>{schedule.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">
                候補日時から1つ選択してください:
              </h3>
              <div className="grid gap-3">
                {schedule.dates.map((date) => (
                  <div
                    key={date.id}
                    className={`
                      flex justify-between items-center p-4 rounded-md border cursor-pointer
                      ${
                        !date.available
                          ? "bg-muted line-through cursor-not-allowed"
                          : "hover:border-primary"
                      }
                      ${
                        selectedDateId === date.id
                          ? "border-primary border-2"
                          : ""
                      }
                    `}
                    onClick={() => date.available && handleSelectDate(date.id)}
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {format(date.date, "yyyy年MM月dd日(E)", {
                            locale: ja,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(date.date, "HH:mm", { locale: ja })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {!date.available ? (
                        <Badge variant="outline">予約済み</Badge>
                      ) : selectedDateId === date.id ? (
                        <Check className="h-5 w-5 text-primary" />
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={handleConfirm}
              disabled={!selectedDateId || loading}
            >
              {loading ? "処理中..." : "この日程で予約を確定する"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
