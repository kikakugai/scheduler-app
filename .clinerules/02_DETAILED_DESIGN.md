# スケジューラーアプリケーション詳細設計書

## 概要

本文書は、基本設計書に基づくスケジューラーアプリケーションの詳細な実装仕様を定義します。Slack 認証と Firestore を使用したサーバーレスアーキテクチャの具体的な実装方法、API 仕様、データフロー、エラーハンドリング等を詳述します。

## 1. 認証システム詳細設計

### 1.1 Slack OAuth 2.0 実装

#### 設定情報

```typescript
const slackConfig = {
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  redirectUri: `${process.env.APP_URL}/auth/slack/callback`,
  scopes: ["identity.basic", "identity.email", "identity.avatar"],
}
```

#### 認証フロー実装

```typescript
// 1. Slackログイン開始
const initiateSlackAuth = () => {
  const authUrl =
    `https://slack.com/oauth/v2/authorize?` +
    `client_id=${slackConfig.clientId}&` +
    `scope=${slackConfig.scopes.join(",")}&` +
    `redirect_uri=${encodeURIComponent(slackConfig.redirectUri)}`

  window.location.href = authUrl
}

// 2. コールバック処理
const handleSlackCallback = async (code: string) => {
  const response = await fetch("https://slack.com/api/oauth.v2.access", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: slackConfig.clientId,
      client_secret: slackConfig.clientSecret,
      code,
      redirect_uri: slackConfig.redirectUri,
    }),
  })

  const { access_token } = await response.json()
  return getUserInfo(access_token)
}

// 3. ユーザー情報取得
const getUserInfo = async (token: string) => {
  const response = await fetch("https://slack.com/api/users.identity", {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.json()
}
```

#### 認証状態管理

```typescript
const useSlackAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuthState = async () => {
      const savedUser = localStorage.getItem("slackUser")
      if (savedUser) {
        const userData = JSON.parse(savedUser)
        // Firestoreでユーザー情報同期
        await syncUserToFirestore(userData)
        setUser(userData)
      }
      setLoading(false)
    }

    checkAuthState()
  }, [])

  const login = async (code: string) => {
    const userData = await handleSlackCallback(code)
    localStorage.setItem("slackUser", JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem("slackUser")
    setUser(null)
  }

  return { user, loading, login, logout }
}
```

## 2. Firestore 連携詳細設計

### 2.1 Firebase 設定

#### 初期化設定

```typescript
import { initializeApp } from "firebase/app"
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore"
import { getAuth, connectAuthEmulator } from "firebase/auth"

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)

// 開発環境ではエミュレーターを使用
if (process.env.NODE_ENV === "development") {
  connectFirestoreEmulator(db, "localhost", 8080)
  connectAuthEmulator(auth, "http://localhost:9099")
}
```

### 2.2 データ操作詳細実装

#### ユーザー管理

```typescript
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"

export const userService = {
  // ユーザー作成・更新
  async upsertUser(slackUserData: any): Promise<User> {
    const userRef = doc(db, "users", slackUserData.user.id)
    const userDoc = await getDoc(userRef)

    const userData: User = {
      id: slackUserData.user.id,
      slackId: slackUserData.user.id,
      name: slackUserData.user.name,
      email: slackUserData.user.email,
      avatar: slackUserData.user.image_24,
      teamId: slackUserData.team.id,
      isAdmin: false, // デフォルトは一般ユーザー
      createdAt: userDoc.exists()
        ? userDoc.data().createdAt
        : serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    await setDoc(userRef, userData, { merge: true })
    return userData
  },

  // ユーザー取得
  async getUser(userId: string): Promise<User | null> {
    const userDoc = await getDoc(doc(db, "users", userId))
    return userDoc.exists() ? (userDoc.data() as User) : null
  },

  // 管理者権限設定
  async setAdminRole(userId: string, isAdmin: boolean): Promise<void> {
    await updateDoc(doc(db, "users", userId), {
      isAdmin,
      updatedAt: serverTimestamp(),
    })
  },
}
```

#### スケジュール枠管理

```typescript
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  deleteDoc,
  writeBatch,
  runTransaction,
} from "firebase/firestore"

export const scheduleService = {
  // スケジュール枠作成
  async createScheduleFrame(
    frameData: Omit<ScheduleFrame, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    const docRef = await addDoc(collection(db, "scheduleFrames"), {
      ...frameData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return docRef.id
  },

  // 複数日程一括作成
  async createMultipleDates(
    frameId: string,
    dates: Omit<ScheduleDate, "id" | "createdAt">[]
  ): Promise<void> {
    const batch = writeBatch(db)

    dates.forEach((dateData) => {
      const dateRef = doc(collection(db, "scheduleFrames", frameId, "dates"))
      batch.set(dateRef, {
        ...dateData,
        createdAt: serverTimestamp(),
      })
    })

    await batch.commit()
  },

  // チーム内スケジュール枠取得
  async getScheduleFrames(teamId: string): Promise<ScheduleFrame[]> {
    const q = query(
      collection(db, "scheduleFrames"),
      where("teamId", "==", teamId),
      where("status", "==", "active"),
      orderBy("createdAt", "desc")
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as ScheduleFrame)
    )
  },

  // 利用可能日程取得
  async getAvailableDates(frameId: string): Promise<ScheduleDate[]> {
    const q = query(
      collection(db, "scheduleFrames", frameId, "dates"),
      where("isBooked", "==", false),
      where("date", ">=", Timestamp.now()),
      orderBy("date", "asc")
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as ScheduleDate)
    )
  },
}
```

#### 予約管理（トランザクション処理）

```typescript
export const appointmentService = {
  // 予約作成（重複チェック付き）
  async createAppointment(
    appointmentData: Omit<Appointment, "id" | "createdAt" | "updatedAt">
  ): Promise<Appointment> {
    return runTransaction(db, async (transaction) => {
      // 1. 対象日程の現在状況を確認
      const dateRef = doc(
        db,
        "scheduleFrames",
        appointmentData.scheduleFrameId,
        "dates",
        appointmentData.scheduleDateId
      )
      const dateDoc = await transaction.get(dateRef)

      if (!dateDoc.exists()) {
        throw new Error("指定された日程が存在しません")
      }

      const dateData = dateDoc.data() as ScheduleDate
      if (dateData.isBooked) {
        throw new Error("この時間枠は既に予約済みです")
      }

      // 2. 予約データ作成
      const appointmentRef = doc(collection(db, "appointments"))
      const appointmentWithMeta = {
        ...appointmentData,
        id: appointmentRef.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      // 3. 原子操作で予約作成と日程更新
      transaction.set(appointmentRef, appointmentWithMeta)
      transaction.update(dateRef, {
        isBooked: true,
        bookedBy: appointmentData.userId,
        bookedAt: serverTimestamp(),
      })

      return appointmentWithMeta as Appointment
    })
  },

  // ユーザーの予約一覧取得
  async getUserAppointments(userId: string): Promise<{
    upcoming: Appointment[]
    past: Appointment[]
  }> {
    const q = query(
      collection(db, "appointments"),
      where("userId", "==", userId),
      where("status", "==", "confirmed"),
      orderBy("date", "desc")
    )

    const snapshot = await getDocs(q)
    const appointments = snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Appointment)
    )

    const now = Timestamp.now()
    const upcoming = appointments.filter((apt) => apt.date >= now)
    const past = appointments.filter((apt) => apt.date < now)

    return { upcoming, past }
  },

  // 予約キャンセル
  async cancelAppointment(appointmentId: string): Promise<void> {
    return runTransaction(db, async (transaction) => {
      const appointmentRef = doc(db, "appointments", appointmentId)
      const appointmentDoc = await transaction.get(appointmentRef)

      if (!appointmentDoc.exists()) {
        throw new Error("予約が見つかりません")
      }

      const appointment = appointmentDoc.data() as Appointment

      // 予約をキャンセル状態に更新
      transaction.update(appointmentRef, {
        status: "cancelled",
        updatedAt: serverTimestamp(),
      })

      // 対応する日程を利用可能に戻す
      const dateRef = doc(
        db,
        "scheduleFrames",
        appointment.scheduleFrameId,
        "dates",
        appointment.scheduleDateId
      )
      transaction.update(dateRef, {
        isBooked: false,
        bookedBy: null,
        bookedAt: null,
      })
    })
  },
}
```

### 2.3 リアルタイムデータ監視

#### リアルタイムリスナー実装

```typescript
import { onSnapshot, query, where, orderBy } from "firebase/firestore"

// スケジュール枠リアルタイム監視
export const useScheduleFrames = (teamId: string) => {
  const [frames, setFrames] = useState<ScheduleFrame[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!teamId) return

    const q = query(
      collection(db, "scheduleFrames"),
      where("teamId", "==", teamId),
      where("status", "==", "active"),
      orderBy("createdAt", "desc")
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const framesData = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as ScheduleFrame)
        )
        setFrames(framesData)
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error("スケジュール枠の監視エラー:", err)
        setError("データの取得に失敗しました")
        setLoading(false)
      }
    )

    return unsubscribe
  }, [teamId])

  return { frames, loading, error }
}

// 利用可能日程リアルタイム監視
export const useAvailableDates = (frameId: string) => {
  const [dates, setDates] = useState<ScheduleDate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!frameId) return

    const q = query(
      collection(db, "scheduleFrames", frameId, "dates"),
      where("isBooked", "==", false),
      where("date", ">=", Timestamp.now()),
      orderBy("date", "asc")
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const datesData = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as ScheduleDate)
      )
      setDates(datesData)
      setLoading(false)
    })

    return unsubscribe
  }, [frameId])

  return { dates, loading }
}
```

## 3. Firestore セキュリティルール詳細

### 3.1 完全なセキュリティルール

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 認証済みユーザーのみアクセス可能
    function isAuthenticated() {
      return request.auth != null;
    }

    // ユーザーID一致チェック
    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    // 同一チームメンバーチェック
    function isSameTeam(teamId) {
      return request.auth.token.teamId == teamId;
    }

    // 管理者権限チェック
    function isAdmin() {
      return request.auth.token.isAdmin == true;
    }

    // ユーザーコレクション
    match /users/{userId} {
      allow read: if isAuthenticated() && (
        isOwner(userId) ||
        isSameTeam(resource.data.teamId)
      );
      allow write: if isAuthenticated() && isOwner(userId);
    }

    // スケジュール枠コレクション
    match /scheduleFrames/{frameId} {
      allow read: if isAuthenticated() && isSameTeam(resource.data.teamId);
      allow create: if isAuthenticated() &&
        isSameTeam(request.resource.data.teamId) &&
        request.resource.data.createdBy == request.auth.uid;
      allow update: if isAuthenticated() &&
        isSameTeam(resource.data.teamId) &&
        (resource.data.createdBy == request.auth.uid || isAdmin());
      allow delete: if isAuthenticated() &&
        isSameTeam(resource.data.teamId) &&
        (resource.data.createdBy == request.auth.uid || isAdmin());

      // スケジュール日程サブコレクション
      match /dates/{dateId} {
        allow read: if isAuthenticated() &&
          isSameTeam(get(/databases/$(database)/documents/scheduleFrames/$(frameId)).data.teamId);
        allow write: if isAuthenticated() &&
          isSameTeam(get(/databases/$(database)/documents/scheduleFrames/$(frameId)).data.teamId);
      }
    }

    // 予約コレクション
    match /appointments/{appointmentId} {
      allow read: if isAuthenticated() && (
        isOwner(resource.data.userId) ||
        isAdmin()
      );
      allow create: if isAuthenticated() &&
        request.resource.data.userId == request.auth.uid;
      allow update: if isAuthenticated() && (
        isOwner(resource.data.userId) ||
        isAdmin()
      );
      allow delete: if isAuthenticated() && (
        isOwner(resource.data.userId) ||
        isAdmin()
      );
    }
  }
}
```

## 4. エラーハンドリング詳細設計

### 4.1 エラー分類と処理

#### カスタムエラークラス

```typescript
export class AppError extends Error {
  constructor(public code: string, message: string, public details?: any) {
    super(message)
    this.name = "AppError"
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super("VALIDATION_ERROR", message, { field })
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "認証が必要です") {
    super("AUTHENTICATION_ERROR", message)
  }
}

export class BusinessLogicError extends AppError {
  constructor(code: string, message: string, details?: any) {
    super(code, message, details)
  }
}
```

#### グローバルエラーハンドラー

```typescript
import { toast } from "sonner"

export const handleError = (error: unknown): void => {
  console.error("Error occurred:", error)

  if (error instanceof AppError) {
    switch (error.code) {
      case "VALIDATION_ERROR":
        toast.error(`入力エラー: ${error.message}`)
        break
      case "AUTHENTICATION_ERROR":
        toast.error(error.message)
        // 認証画面へリダイレクト
        window.location.href = "/login"
        break
      case "SLOT_ALREADY_BOOKED":
        toast.error(error.message, {
          description: "他の利用可能な時間枠をお選びください",
        })
        break
      default:
        toast.error(error.message)
    }
  } else if (error instanceof Error) {
    toast.error("予期しないエラーが発生しました", {
      description: error.message,
    })
  } else {
    toast.error("システムエラーが発生しました")
  }
}

// Firestore専用エラーハンドラー
export const handleFirestoreError = (error: any): never => {
  switch (error.code) {
    case "permission-denied":
      throw new AuthenticationError("アクセス権限がありません")
    case "not-found":
      throw new BusinessLogicError("NOT_FOUND", "データが見つかりません")
    case "already-exists":
      throw new BusinessLogicError("ALREADY_EXISTS", "データが既に存在します")
    case "failed-precondition":
      throw new BusinessLogicError(
        "CONCURRENT_UPDATE",
        "他のユーザーによって更新されました"
      )
    default:
      throw new AppError(
        "FIRESTORE_ERROR",
        "データベースエラーが発生しました",
        error
      )
  }
}
```

### 4.2 フォームバリデーション詳細

#### Zod スキーマ定義

```typescript
import { z } from "zod"

// スケジュール枠作成スキーマ
export const scheduleFrameSchema = z
  .object({
    title: z
      .string()
      .min(1, "タイトルは必須です")
      .max(100, "タイトルは100文字以内で入力してください"),
    description: z
      .string()
      .min(1, "説明は必須です")
      .max(500, "説明は500文字以内で入力してください"),
    startDate: z
      .date({
        required_error: "開始日を選択してください",
        invalid_type_error: "有効な日付を選択してください",
      })
      .min(new Date(), "開始日は今日以降を選択してください"),
    endDate: z.date({
      required_error: "終了日を選択してください",
      invalid_type_error: "有効な日付を選択してください",
    }),
    timeInterval: z
      .number()
      .int("整数を選択してください")
      .positive("正の値を選択してください")
      .refine(
        (val) => [30, 60].includes(val),
        "30分または60分を選択してください"
      ),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "終了日は開始日以降を選択してください",
    path: ["endDate"],
  })
  .refine(
    (data) => {
      const maxDate = new Date()
      maxDate.setMonth(maxDate.getMonth() + 6)
      return data.endDate <= maxDate
    },
    {
      message: "終了日は6ヶ月以内を選択してください",
      path: ["endDate"],
    }
  )

// 予約作成スキーマ
export const appointmentSchema = z.object({
  scheduleDateId: z.string().min(1, "日程を選択してください"),
  notes: z.string().max(200, "メモは200文字以内で入力してください").optional(),
})
```

#### リアルタイムバリデーション実装

```typescript
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

export const useScheduleFrameForm = () => {
  const form = useForm<z.infer<typeof scheduleFrameSchema>>({
    resolver: zodResolver(scheduleFrameSchema),
    mode: "onChange", // リアルタイムバリデーション
    defaultValues: {
      title: "",
      description: "",
      timeInterval: 30,
    },
  })

  const onSubmit = async (data: z.infer<typeof scheduleFrameSchema>) => {
    try {
      // 平日の日程を計算
      const weekdays = calculateWeekdays(data.startDate, data.endDate)
      const timeSlots = generateTimeSlots(data.timeInterval)

      // スケジュール枠作成
      const frameId = await scheduleService.createScheduleFrame({
        title: data.title,
        description: data.description,
        createdBy: user.id,
        teamId: user.teamId,
        status: "active",
      })

      // 日程一括作成
      const dates = generateScheduleDates(weekdays, timeSlots, frameId)
      await scheduleService.createMultipleDates(frameId, dates)

      toast.success("予約枠が作成されました", {
        description: `${dates.length}個の時間枠が追加されました`,
      })

      form.reset()
    } catch (error) {
      handleError(error)
    }
  }

  return { form, onSubmit }
}
```

## 5. パフォーマンス最適化詳細

### 5.1 Firestore クエリ最適化

#### 複合インデックス設計

```javascript
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "scheduleFrames",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "teamId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "dates",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isBooked", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "appointments",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    }
  ]
}
```

#### クエリ制限とページネーション

```typescript
import { limit, startAfter, QueryDocumentSnapshot } from "firebase/firestore"

export const usePaginatedAppointments = (userId: string, pageSize = 20) => {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)

  const loadAppointments = async (isFirstLoad = false) => {
    if (loading || (!hasMore && !isFirstLoad)) return

    setLoading(true)
    try {
      let q = query(
        collection(db, "appointments"),
        where("userId", "==", userId),
        where("status", "==", "confirmed"),
        orderBy("date", "desc"),
        limit(pageSize)
      )

      if (!isFirstLoad && lastDoc) {
        q = query(q, startAfter(lastDoc))
      }

      const snapshot = await getDocs(q)
      const newAppointments = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Appointment)
      )

      if (isFirstLoad) {
        setAppointments(newAppointments)
      } else {
        setAppointments((prev) => [...prev, ...newAppointments])
      }

      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null)
      setHasMore(snapshot.docs.length === pageSize)
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }

  return { appointments, loadAppointments, loading, hasMore }
}
```

### 5.2 React 最適化

#### メモ化とキャッシュ

```typescript
import { memo, useMemo, useCallback } from "react"

// コンポーネントメモ化
export const ScheduleFrameCard = memo<{
  frame: ScheduleFrame
  onEdit: (frame: ScheduleFrame) => void
  onDelete: (frameId: string) => void
}>(({ frame, onEdit, onDelete }) => {
  const handleEdit = useCallback(() => {
    onEdit(frame)
  }, [frame, onEdit])

  const handleDelete = useCallback(() => {
    onDelete(frame.id)
  }, [frame.id, onDelete])

  const formattedDate = useMemo(() => {
    return format(frame.createdAt.toDate(), "yyyy年MM月dd日", { locale: ja })
  }, [frame.createdAt])

  return (
    <Card className="p-4">
      <h3>{frame.title}</h3>
      <p>{frame.description}</p>
      <p className="text-sm text-muted-foreground">{formattedDate}</p>
      <div className="flex gap-2 mt-4">
        <Button onClick={handleEdit} variant="outline">
          編集
        </Button>
        <Button onClick={handleDelete} variant="destructive">
          削除
        </Button>
      </div>
    </Card>
  )
})
```

#### 仮想スクロール実装

```typescript
import { FixedSizeList as List } from "react-window"

export const VirtualizedAppointmentList: React.FC<{
  appointments: Appointment[]
}> = ({ appointments }) => {
  const Row = ({ index, style }: { index: number; style: any }) => (
    <div style={style}>
      <AppointmentCard appointment={appointments[index]} />
    </div>
  )

  return (
    <List
      height={600}
      itemCount={appointments.length}
      itemSize={120}
      overscanCount={5}
    >
      {Row}
    </List>
  )
}
```

## 6. テスト実装詳細

### 6.1 Firebase Emulator 使用テスト

#### セットアップ

```typescript
// jest.setup.ts
import { initializeTestEnvironment } from "@firebase/rules-unit-testing"

export const testEnv = initializeTestEnvironment({
  projectId: "test-project",
  firestore: {
    rules: require("./firestore.rules"),
    host: "localhost",
    port: 8080,
  },
})

beforeEach(async () => {
  await testEnv.clearFirestore()
})

afterAll(async () => {
  await testEnv.cleanup()
})
```

#### Firestore テスト例

```typescript
import { assertSucceeds, assertFails } from "@firebase/rules-unit-testing"

describe("Firestore Security Rules", () => {
  test("ユーザーは自分のデータのみ読み取り可能", async () => {
    const alice = testEnv.authenticatedContext("alice", {
      teamId: "team1",
    })
    const bob = testEnv.authenticatedContext("bob", {
      teamId: "team1",
    })

    // Aliceが自分のデータを読み取り
    await assertSucceeds(alice.firestore().doc("users/alice").get())

    // AliceがBobのデータを読み取り（失敗すべき）
    await assertFails(alice.firestore().doc("users/bob").get())
  })

  test("同一チームのスケジュール枠は読み取り可能", async () => {
    const alice = testEnv.authenticatedContext("alice", {
      teamId: "team1",
    })

    // チーム内のスケジュール枠を作成
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().doc("scheduleFrames/frame1").set({
        title: "テスト枠",
        teamId: "team1",
        createdBy: "bob",
      })
    })

    // Aliceが同じチームのスケジュール枠を読み取り
    await assertSucceeds(alice.firestore().doc("scheduleFrames/frame1").get())
  })
})
```

### 6.2 React Component Tests

#### カスタムフック テスト

```typescript
import { renderHook, waitFor } from "@testing-library/react"
import { useScheduleFrames } from "../hooks/useScheduleFrames"

describe("useScheduleFrames", () => {
  test("チームIDに基づいてスケジュール枠を取得", async () => {
    const { result } = renderHook(() => useScheduleFrames("team1"))

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.frames).toHaveLength(2)
    expect(result.current.error).toBeNull()
  })
})
```

#### E2E テスト例

```typescript
import { test, expect } from "@playwright/test"

test("管理者による予約枠作成フロー", async ({ page }) => {
  // ログイン
  await page.goto("/login")
  await page.click('[data-testid="slack-login-button"]')

  // 管理者ダッシュボードに移動
  await page.goto("/admin")

  // 新規予約枠作成
  await page.click('[data-testid="create-schedule-button"]')
  await page.fill('[data-testid="title-input"]', "テスト会議")
  await page.fill('[data-testid="description-input"]', "テスト用の会議です")

  // 日程設定
  const startDate = new Date()
  startDate.setDate(startDate.getDate() + 7)
  await page.fill(
    '[data-testid="start-date-input"]',
    startDate.toISOString().split("T")[0]
  )

  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 14)
  await page.fill(
    '[data-testid="end-date-input"]',
    endDate.toISOString().split("T")[0]
  )

  // 時間間隔選択
  await page.click('[data-testid="time-interval-30"]')

  // 作成実行
  await page.click('[data-testid="create-button"]')

  // 成功メッセージ確認
  await expect(page.locator('[data-testid="success-toast"]')).toBeVisible()

  // 作成された枠が一覧に表示されることを確認
  await expect(
    page.locator('[data-testid="schedule-frame-card"]')
  ).toContainText("テスト会議")
})
```

この詳細設計書に基づいて、堅牢でスケーラブルなスケジューラーアプリケーションの実装を進めることができます。
