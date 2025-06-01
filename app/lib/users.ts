import type { User } from "./types";

// モックユーザーデータ（auth.tsと共有）
const users: User[] = [
  {
    id: "1",
    name: "管理者",
    email: "admin@example.com",
    password: "password",
    isAdmin: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "一般ユーザー",
    email: "user@example.com",
    password: "password",
    isAdmin: false,
    createdAt: new Date().toISOString(),
  },
];

// 全ユーザーを取得
export async function getAllUsers() {
  // パスワードを除外
  return users.map(({ password, ...user }) => user);
}

// 特定のユーザーを取得
export async function getUser(userId: string) {
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return null;
  }

  // パスワードを除外
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
