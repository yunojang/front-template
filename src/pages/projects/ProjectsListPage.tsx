import { useMemo, useState } from 'react'

import { Search, SlidersHorizontal } from 'lucide-react'

import { useProjects } from '../../features/projects/hooks/useProjects'
import { Button } from '../../shared/ui/Button'
import { Input } from '../../shared/ui/Input'
import { Spinner } from '../../shared/ui/Spinner'
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from '../../shared/ui/Tabs'
import { ProjectList } from '../../widgets/project-list/ProjectList'

const tabs = [
  { value: 'assigned', label: '할당됨' },
  { value: 'done', label: '완료' },
]

export default function ProjectsListPage() {
  const { data: projects = [], isLoading } = useProjects()
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<'recent' | 'dueDate' | 'progress'>('recent')
  const [activeTab, setActiveTab] = useState('assigned')

  const filteredProjects = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const list = projects.filter((project) =>
      normalized.length === 0
        ? true
        : [project.title, project.sourceLanguage, ...project.targetLanguages]
            .join(' ')
            .toLowerCase()
            .includes(normalized),
    )

    const sorted = list.slice().sort((a, b) => {
      if (sortKey === 'progress') {
        return b.progress - a.progress
      }
      if (sortKey === 'dueDate') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      }
      const createdAtA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const createdAtB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return createdAtB - createdAtA
    })

    if (activeTab === 'done') {
      return sorted.filter((project) => project.status === 'done')
    }

    return sorted.filter((project) => project.status !== 'done')
  }, [projects, query, sortKey, activeTab])

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
      <header className="space-y-4">
        <h1 className="text-foreground text-3xl font-semibold">프로젝트 목록</h1>
        <p className="text-muted text-sm">
          생성된 프로젝트 목록과 더빙 진행 상황을 조회합니다. 검색과 정렬은 현 상태를 유지하며 상세
          페이지로 이동합니다.
        </p>
        <div className="grid gap-3 md:grid-cols-[1fr,200px] md:items-center">
          <div className="relative">
            <Search className="text-muted pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="프로젝트 검색"
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={sortKey === 'recent' ? 'secondary' : 'outline'}
              onClick={() => setSortKey('recent')}
            >
              최신순
            </Button>
            <Button
              type="button"
              variant={sortKey === 'dueDate' ? 'secondary' : 'outline'}
              onClick={() => setSortKey('dueDate')}
            >
              마감 임박
            </Button>
            <Button
              type="button"
              variant={sortKey === 'progress' ? 'secondary' : 'outline'}
              onClick={() => setSortKey('progress')}
            >
              진행률
            </Button>
            <span className="bg-surface-2 text-muted ml-auto hidden items-center gap-2 rounded-full px-3 py-1 text-xs md:inline-flex">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              정렬 기준: {sortKey}
            </span>
          </div>
        </div>
      </header>

      <TabsRoot value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="border-surface-3 bg-surface-1 flex items-center justify-center rounded-3xl border py-10">
              <Spinner />
              <span className="text-muted ml-3 text-sm">목록을 불러오는 중…</span>
            </div>
          ) : (
            <ProjectList projects={filteredProjects} />
          )}
        </TabsContent>
      </TabsRoot>
    </div>
  )
}
