import { BookOpen, FolderKanban, UploadCloud } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import { routes } from '../../shared/config/routes'
import { cn } from '../../shared/lib/utils'

const navItems = [
  {
    icon: FolderKanban,
    label: '프로젝트',
    to: routes.workspace,
  },
  {
    icon: UploadCloud,
    label: '보이스 샘플',
    to: `${routes.workspace}?section=voices`,
  },
  {
    icon: BookOpen,
    label: '용어 사전',
    to: `${routes.workspace}?section=glossary`,
  },
]

export function WorkspaceSideNav() {
  const location = useLocation()

  return (
    <nav className="flex flex-col gap-2">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive =
          location.pathname === routes.workspace &&
          location.search.includes(item.to.split('?')[1] ?? '')
        return (
          <Link
            key={item.label}
            to={item.to}
            className={cn(
              'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
              isActive
                ? 'bg-primary text-primary-foreground shadow-primary/40 shadow'
                : 'text-muted hover:bg-surface-3 hover:text-foreground',
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
