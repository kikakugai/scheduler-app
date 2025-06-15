import { LogOut } from "lucide-react"
import { Button } from "../ui/button"

interface AdminHeaderProps {
  heading?: string
  text?: string
  children?: React.ReactNode
}

export function AdminHeader({ heading, text, children }: AdminHeaderProps) {
  return (
    <div className="space-y-4">
      <nav className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">管理者ダッシュボード</h1>
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
  )
}
