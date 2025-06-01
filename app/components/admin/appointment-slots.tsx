import { useState } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  CalendarIcon,
  Clock,
  Plus,
  Edit,
  Trash2,
  Search,
  Users,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { cn } from "~/lib/utils";
import { toast } from "sonner";

// サンプルデータ
// 現在の日付から3日後から1週間分のサンプルデータを生成
const generateSampleSlots = () => {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(now.getDate() + 3);

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
  ];
};

const SAMPLE_SLOTS = generateSampleSlots();

// 時間のオプション
const TIME_OPTIONS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
];

// ユーザーのサンプルデータ
const SAMPLE_USERS = [
  { id: "1", name: "山田太郎", email: "yamada@example.com" },
  { id: "2", name: "佐藤花子", email: "sato@example.com" },
  { id: "3", name: "鈴木一郎", email: "suzuki@example.com" },
  { id: "4", name: "田中美咲", email: "tanaka@example.com" },
  { id: "5", name: "伊藤健太", email: "ito@example.com" },
];

export function AppointmentSlots() {
  const [slots, setSlots] = useState(SAMPLE_SLOTS);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  // 新規予約枠作成フォーム
  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      dates: [{ date: new Date(), startTime: "10:00", endTime: "11:00" }],
    },
  });

  // 日付を追加
  const addDate = () => {
    const currentDates = form.getValues("dates") || [];
    form.setValue("dates", [
      ...currentDates,
      { date: new Date(), startTime: "10:00", endTime: "11:00" },
    ]);
  };

  // 日付を削除
  const removeDate = (index: number) => {
    const currentDates = form.getValues("dates");
    form.setValue(
      "dates",
      currentDates.filter((_, i) => i !== index)
    );
  };

  // 予約枠作成
  const onSubmit = (data: any) => {
    // 日付と時間を組み合わせて日時オブジェクトを作成
    const dates = data.dates.map((dateItem: any, index: number) => {
      const [startHour, startMinute] = dateItem.startTime
        .split(":")
        .map(Number);
      const [endHour, endMinute] = dateItem.endTime
        .split(":")
        .map(Number);

      // 開始時間と終了時間の妥当性チェック
      if (endHour < startHour || (endHour === startHour && endMinute <= startMinute)) {
        throw new Error(`候補${index + 1}の終了時間は開始時間より後である必要があります`);
      }

      const date = new Date(dateItem.date);
      date.setHours(startHour, startMinute, 0, 0);

      // 過去の日時をチェック
      if (date < new Date()) {
        throw new Error(`候補${index + 1}は過去の日時です`);
      }

      return {
        id: `new-date-${index}`,
        date,
        endTime: new Date(date).setHours(endHour, endMinute, 0, 0),
        reserved: false,
        userName: "",
      };
    });

    const newSlot = {
      id: (slots.length + 1).toString(),
      title: data.title,
      description: data.description,
      dates,
      status: "active",
      createdAt: new Date(),
    };

    setSlots([...slots, newSlot]);
    setIsDialogOpen(false);
    form.reset();
    toast("予約枠作成中...");
    // toast({
    //   title: "予約枠作成完了",
    //   description: "新しい予約枠が作成されました",
    // });
  };

  // 予約枠削除
  const handleDelete = (id: string) => {
    setSlots(slots.filter((slot) => slot.id !== id));
    toast("予約枠削除中...");
    // toast({
    //   title: "予約枠削除",
    //   description: "予約枠が削除されました",
    // });
  };

  // 予約枠詳細表示
  const handleViewDetail = (slot: any) => {
    setSelectedSlot(slot);
    setIsDetailOpen(true);
  };

  // ユーザー招待
  const handleInviteUsers = () => {
    if (selectedUsers.length === 0) {
      toast("招待するユーザーを選択してください");
      // toast({
      //   title: "エラー",
      //   description: "招待するユーザーを選択してください",
      //   variant: "destructive",
      // });
      return;
    }

    // 実際の実装ではAPIリクエストでユーザー招待
    toast("ユーザー招待中...");
    // toast({
    //   title: "ユーザー招待完了",
    //   description: `${selectedUsers.length}人のユーザーに招待を送信しました`,
    // });

    setSelectedUsers([]);
    setIsInviteDialogOpen(false);
  };

  // ユーザー選択の切り替え
  const toggleUserSelection = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  // 検索フィルタリング
  const filteredSlots = slots.filter((slot) =>
    slot.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                新規予約枠作成
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>新規予約枠の作成</DialogTitle>
                <DialogDescription>
                  新しいアポイントメントの予約枠を作成します。
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>タイトル</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="例: 定期ミーティング"
                            {...field}
                          />
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
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>説明</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="例: プロジェクトの進捗確認を行います"
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

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <FormLabel>候補日時</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addDate}
                      >
                        <Plus className="mr-2 h-3 w-3" />
                        日時を追加
                      </Button>
                    </div>

                    {form.watch("dates")?.map((date: any, index: number) => (
                      <div
                        key={index}
                        className="flex flex-col gap-4 p-4 border rounded-md"
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-medium">
                            候補 {index + 1}
                          </h4>
                          {index > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDate(index)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">削除</span>
                            </Button>
                          )}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <FormField
                            control={form.control}
                            name={`dates.${index}.date`}
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>日付</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant={"outline"}
                                        className={cn(
                                          "w-full pl-3 text-left font-normal",
                                          !field.value &&
                                            "text-muted-foreground"
                                        )}
                                      >
                                        {field.value ? (
                                          format(
                                            field.value,
                                            "yyyy年MM月dd日(E)",
                                            { locale: ja }
                                          )
                                        ) : (
                                          <span>日付を選択</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                  >
                                    <Calendar
                                      mode="single"
                                      selected={field.value}
                                      onSelect={field.onChange}
                                      initialFocus
                                      locale={ja}
                                      disabled={(date) => date < new Date() || date > new Date(new Date().setMonth(new Date().getMonth() + 3))}
                                      fromDate={new Date()}
                                      toDate={new Date(new Date().setMonth(new Date().getMonth() + 3))}
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-2 gap-2">
                            <FormField
                              control={form.control}
                              name={`dates.${index}.startTime`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>開始時間</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="開始時間を選択" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {TIME_OPTIONS.map((time) => (
                                        <SelectItem key={time} value={time}>
                                          {time}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`dates.${index}.endTime`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>終了時間</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="終了時間を選択" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {TIME_OPTIONS.map((time) => (
                                        <SelectItem key={time} value={time}>
                                          {time}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <DialogFooter>
                    <Button type="submit">作成</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSlots.map((slot) => (
            <Card key={slot.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{slot.title}</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleViewDetail(slot)}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">編集</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(slot.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">削除</span>
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {slot.dates.length}個の候補日時
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    作成日:{" "}
                    {format(slot.createdAt, "yyyy年MM月dd日", { locale: ja })}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {slot.dates.slice(0, 3).map((date, index) => (
                      <Badge
                        key={date.id}
                        variant={date.reserved ? "secondary" : "outline"}
                      >
                        {format(date.date, "MM/dd HH:mm", { locale: ja })}
                      </Badge>
                    ))}
                    {slot.dates.length > 3 && (
                      <Badge variant="outline">+{slot.dates.length - 3}</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSlots.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <div className="text-muted-foreground">予約枠が見つかりません</div>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              新規予約枠作成
            </Button>
          </div>
        )}

        {/* 予約枠詳細ダイアログ */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>予約枠詳細</DialogTitle>
            </DialogHeader>
            {selectedSlot && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedSlot.title}
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    {selectedSlot.description || "説明なし"}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-semibold">候補日時一覧</h4>
                    <Dialog
                      open={isInviteDialogOpen}
                      onOpenChange={setIsInviteDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Users className="mr-2 h-4 w-4" />
                          ユーザー招待
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>ユーザー招待</DialogTitle>
                          <DialogDescription>
                            この予約枠に招待するユーザーを選択してください
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="search"
                              placeholder="ユーザーを検索..."
                              className="pl-8"
                            />
                          </div>
                          <div className="border rounded-md divide-y max-h-[300px] overflow-y-auto">
                            {SAMPLE_USERS.map((user) => (
                              <div
                                key={user.id}
                                className="flex items-center space-x-2 p-3"
                              >
                                <Checkbox
                                  id={`user-${user.id}`}
                                  checked={selectedUsers.includes(user.id)}
                                  onCheckedChange={() =>
                                    toggleUserSelection(user.id)
                                  }
                                />
                                <label
                                  htmlFor={`user-${user.id}`}
                                  className="flex-1 flex items-center gap-2 text-sm cursor-pointer"
                                >
                                  <div className="font-medium">{user.name}</div>
                                  <div className="text-muted-foreground">
                                    {user.email}
                                  </div>
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleInviteUsers}>
                            招待を送信 ({selectedUsers.length}人)
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="border rounded-md divide-y">
                    {selectedSlot.dates.map((date: any) => (
                      <div key={date.id} className="p-3">
                        <div className="flex justify-between items-center">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {format(date.date, "yyyy年MM月dd日(E)", {
                                  locale: ja,
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {format(date.date, "HH:mm", { locale: ja })}
                              </span>
                            </div>
                          </div>
                          <Badge
                            variant={date.reserved ? "secondary" : "outline"}
                          >
                            {date.reserved ? "予約済み" : "空き"}
                          </Badge>
                        </div>
                        {date.reserved && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            予約者: {date.userName}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                閉じる
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
