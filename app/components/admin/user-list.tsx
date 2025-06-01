import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import type { User } from "~/lib/types";

interface UserListProps {
  users: User[];
}

export function UserList({ users }: UserListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ユーザー一覧</CardTitle>
        <CardDescription>
          システムに登録されているユーザーの一覧です
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.length > 0 ? (
            users.map((user) => (
              <div
                key={user.id}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-4"
              >
                <div className="space-y-1">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {user.email}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {user.isAdmin && <Badge>管理者</Badge>}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              ユーザーが見つかりませんでした
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
