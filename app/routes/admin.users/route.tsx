import { AdminShell } from "~/components/admin/admin-shell";
import { UserList } from "~/components/admin/user-list";
import type { Route } from "./+types/route";

export default function Route() {
  const dummyUsers = [
    {
      id: "1",
      name: "管理者",
      email: "admin@example.com",
      password: "",
      isAdmin: true,
      createdAt: "",
    },
  ];

  return (
    <AdminShell>
      <UserList users={dummyUsers} />
    </AdminShell>
  );
}
