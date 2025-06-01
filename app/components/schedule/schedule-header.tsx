import { Button } from "~/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { LogOut, User, Settings } from "lucide-react"
import { NavLink, useNavigate } from "react-router"

interface ScheduleHeaderProps {
  user: {
    id: string
    name: string
    email: string
  }
}

export function ScheduleHeader({ user }: ScheduleHeaderProps) {
  const navigate = useNavigate()

  const handleLogout = () => {
    // 実際の実装ではログアウト処理
    navigate("/login")
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b px-4 md:px-6 select-none">
      <div className="flex-1 flex items-center">
        <NavLink to="/" className="font-semibold text-lg">
          日程調整システム
        </NavLink>
      </div>
    </header>
  )
}
