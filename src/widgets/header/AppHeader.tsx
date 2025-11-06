import { Menu } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'

import { env } from '../../shared/config/env'
import { routes } from '../../shared/config/routes'
import { Button } from '../../shared/ui/Button'

const navItems = [
  { to: routes.home, label: '홈' },
  { to: routes.workspace, label: '워크스페이스' },
  { to: routes.projects, label: '프로젝트' },
]

export function AppHeader() {
  const appName = env.appName

  return (
    <header className="border-surface-3 bg-surface-1/90 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link to={routes.home} className="flex items-center gap-3">
          <span className="bg-primary text-primary-foreground shadow-primary/40 inline-flex h-11 w-11 items-center justify-center rounded-2xl shadow-lg">
            <Menu className="h-6 w-6" />
          </span>
          <div className="flex flex-col">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">
              Front Wireframe
            </span>
            <span className="text-foreground text-base font-medium">{appName}</span>
          </div>
        </Link>
        <nav className="hidden items-center gap-4 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-sm font-medium transition ${isActive ? 'text-primary' : 'text-muted hover:text-foreground'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link to={routes.login}>로그인</Link>
          </Button>
          <Button asChild size="sm">
            <Link to={routes.signup}>회원가입</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
