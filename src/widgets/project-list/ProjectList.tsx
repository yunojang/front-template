import { Link } from 'react-router-dom'

import type { ProjectSummary } from '../../entities/project/types'
import { routes } from '../../shared/config/routes'
import { formatPercent } from '../../shared/lib/utils'
import { Badge } from '../../shared/ui/Badge'
import { Progress } from '../../shared/ui/Progress'

type ProjectListProps = {
  projects: ProjectSummary[]
}

const statusToneMap: Record<
  ProjectSummary['status'],
  'processing' | 'editing' | 'review' | 'done'
> = {
  processing: 'processing',
  editing: 'editing',
  review: 'review',
  done: 'done',
}

export function ProjectList({ projects }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="border-surface-4 bg-surface-2 rounded-3xl border border-dashed p-10 text-center">
        <p className="text-muted text-sm">등록된 프로젝트가 없습니다. 지금 바로 생성해보세요.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <Link
          key={project.id}
          to={routes.projectDetail(project.id)}
          className="border-surface-3 bg-surface-1/90 hover:border-primary/60 block rounded-3xl border p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-xl"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-foreground text-lg font-semibold">{project.title}</h3>
              <p className="text-muted mt-1 text-sm">
                {project.sourceLanguage} → {project.targetLanguages.join(', ')}
              </p>
              <p className="text-muted mt-1 text-xs">
                마감일 {new Date(project.dueDate).toLocaleDateString()} • 할당 번역가:{' '}
                {project.assignedEditor ?? '미정'}
              </p>
            </div>
            <Badge tone={statusToneMap[project.status]}>
              진행 상태: {project.status.toUpperCase()}
            </Badge>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-[1fr,auto] md:items-center">
            <Progress value={project.progress} label="더빙 진행률" />
            <span className="text-muted text-sm font-semibold">
              {formatPercent(project.progress)}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
