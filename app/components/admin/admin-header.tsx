import { LayoutDashboard, LogOut, Users } from "lucide-react";
import { NavLink } from "react-router";
import { Button } from "../ui/button";

interface AdminHeaderProps {
  heading?: string;
  text?: string;
  children?: React.ReactNode;
}

export function AdminHeader({ heading, text, children }: AdminHeaderProps) {
  return (
    <div className="space-y-4">
      <nav className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <NavLink
            to="/admin"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            <LayoutDashboard className="h-4 w-4" />
            ダッシュボード
          </NavLink>

          <NavLink
            to="/admin/users"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            <Users className="h-4 w-4" />
            ユーザー管理
          </NavLink>
        </div>

        <Button variant="outline" size="sm" className="gap-2">
          <LogOut className="h-4 w-4" />
          ログアウト
        </Button>
      </nav>

      {heading && (
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-wide">{heading}</h1>
            {text && <p className="text-muted-foreground">{text}</p>}
          </div>
          {children}
        </div>
      )}
    </div>
  );
}
