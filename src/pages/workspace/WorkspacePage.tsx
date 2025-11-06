import { useEffect } from 'react'

import { useSearchParams } from 'react-router-dom'

import { useProjects } from '../../features/projects/hooks/useProjects'
import { ProjectCreationModal } from '../../features/projects/modals/ProjectCreationModal'
import { useUiStore } from '../../shared/store/useUiStore'
import { Spinner } from '../../shared/ui/Spinner'
import { ProjectList } from '../../widgets/project-list/ProjectList'
import { WorkspaceSideNav } from '../../widgets/sidenav/WorkspaceSideNav'
import { UploadCard } from '../../widgets/upload-card/UploadCard'

const stepMap = {
  upload: 'upload',
  settings: 'settings-a',
  assign: 'settings-b',
} as const

export default function WorkspacePage() {
  const { data: projects = [], isLoading } = useProjects()
  const [searchParams, setSearchParams] = useSearchParams()
  const uiState = useUiStore((state) => ({
    open: state.projectCreation.open,
    step: state.projectCreation.step,
    openModal: state.openProjectCreation,
    setStep: state.setProjectCreationStep,
    close: state.closeProjectCreation,
  }))

  const stepParam = searchParams.get('create')
  const derivedStep = stepParam ? stepMap[stepParam as keyof typeof stepMap] : null

  useEffect(() => {
    if (derivedStep) {
      uiState.openModal(derivedStep)
    }
  }, [derivedStep, uiState])

  useEffect(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (!uiState.open) {
        next.delete('create')
      } else {
        const currentKey = Object.entries(stepMap).find(([, value]) => value === uiState.step)?.[0]
        if (currentKey) {
          next.set('create', currentKey)
        }
      }
      return next
    })
  }, [uiState.open, uiState.step, setSearchParams])

  useEffect(() => {
    if (!stepParam) {
      uiState.close()
    }
  }, [stepParam, uiState])

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[280px,1fr]">
      <aside>
        <WorkspaceSideNav />
      </aside>
      <section className="space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-foreground text-3xl font-semibold">배급사 워크스페이스</h1>
          <p className="text-muted text-sm">
            업로드, 언어 설정, 번역가 지정까지 한 화면에서 진행하고, 보이스 샘플과 용어 사전을
            사용자 단위로 관리합니다.
          </p>
        </div>
        <UploadCard />
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-foreground text-xl font-semibold">최근 프로젝트</h2>
            <span className="text-muted text-xs">자동 더빙 진행률이 표시됩니다.</span>
          </div>
          {isLoading ? (
            <div className="border-surface-3 bg-surface-1 flex items-center justify-center rounded-3xl border py-10">
              <Spinner />
              <span className="text-muted ml-3 text-sm">프로젝트 불러오는 중…</span>
            </div>
          ) : (
            <ProjectList projects={projects} />
          )}
        </div>
      </section>
      <ProjectCreationModal />
    </div>
  )
}
