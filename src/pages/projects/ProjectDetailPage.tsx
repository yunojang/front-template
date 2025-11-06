import { useMemo, useState } from 'react'

import { Download, ExternalLink, Play } from 'lucide-react'
import { useParams, Link } from 'react-router-dom'

import { useProject } from '../../features/projects/hooks/useProjects'
import { routes } from '../../shared/config/routes'
import { trackEvent } from '../../shared/lib/analytics'
import { cn } from '../../shared/lib/utils'
import { useAuthStore } from '../../shared/store/useAuthStore'
import { Badge } from '../../shared/ui/Badge'
import { Button } from '../../shared/ui/Button'
import { Spinner } from '../../shared/ui/Spinner'
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from '../../shared/ui/Tabs'

export default function ProjectDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const { data: project, isLoading } = useProject(id)
  const roles = useAuthStore((state) => state.roles)
  const [language, setLanguage] = useState<string>()
  const [version, setVersion] = useState<'original' | 'translated'>('translated')

  const assetsByLanguage = useMemo(() => {
    if (!project) return {}
    return project.assets.reduce<Record<string, typeof project.assets>>((acc, asset) => {
      acc[asset.language] = acc[asset.language] ? [...acc[asset.language], asset] : [asset]
      return acc
    }, {})
  }, [project])

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-3 px-6 py-16 text-center">
        <p className="text-foreground text-lg font-semibold">프로젝트를 찾을 수 없습니다.</p>
        <p className="text-muted text-sm">목록으로 돌아가 다시 시도하세요.</p>
        <Button asChild>
          <Link to={routes.projects}>프로젝트 목록으로</Link>
        </Button>
      </div>
    )
  }

  const activeLanguage = language ?? project.targetLanguages[0] ?? project.sourceLanguage
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-muted text-xs font-semibold uppercase tracking-wider">프로젝트 상세</p>
          <h1 className="text-foreground mt-1 text-3xl font-semibold">{project.title}</h1>
          <p className="text-muted mt-2 text-sm">
            {project.sourceLanguage} → {project.targetLanguages.join(', ')} | 화자{' '}
            {project.speakerCount}명
          </p>
          <p className="text-muted text-xs">
            생성일 {new Date(project.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {roles.includes('editor') ? (
            <Button
              asChild
              onClick={() => trackEvent('enter_editor_click', { projectId: project.id })}
            >
              <Link to={routes.editor(project.id)}>편집하기</Link>
            </Button>
          ) : null}
          <Button
            variant="secondary"
            onClick={() => trackEvent('asset_download', { lang: activeLanguage, type: 'video' })}
          >
            <Download className="h-4 w-4" />
            자산 다운로드
          </Button>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="border-surface-3 bg-surface-1 space-y-6 rounded-3xl border p-6 shadow-soft">
          <TabsRoot value={activeLanguage} onValueChange={(value) => setLanguage(value)}>
            <TabsList>
              {project.targetLanguages.map((lang) => (
                <TabsTrigger key={lang} value={lang}>
                  {lang}
                </TabsTrigger>
              ))}
            </TabsList>
            {project.targetLanguages.map((lang) => (
              <TabsContent key={lang} value={lang}>
                <LanguagePreview
                  language={lang}
                  assets={assetsByLanguage[lang] ?? []}
                  version={version}
                  onVersionChange={setVersion}
                />
              </TabsContent>
            ))}
          </TabsRoot>
        </div>
        <aside className="border-surface-3 bg-surface-2 space-y-4 rounded-3xl border p-6">
          <h2 className="text-foreground text-lg font-semibold">요약</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Badge
              tone={
                project.status === 'done'
                  ? 'done'
                  : project.status === 'review'
                    ? 'review'
                    : project.status === 'editing'
                      ? 'editing'
                      : 'processing'
              }
            >
              상태: {project.status}
            </Badge>
            <Badge tone="review">진행률 {project.progress}%</Badge>
          </div>
          <div className="text-muted space-y-3 text-sm">
            <p>담당 번역가: {project.assignedEditor ?? '미정'}</p>
            <p>마감일: {new Date(project.dueDate).toLocaleDateString()}</p>
            <p>번역 사전: {project.glossaryName ?? '선택하지 않음'}</p>
          </div>
          <div className="bg-surface-1 text-muted space-y-3 rounded-2xl p-4 text-sm">
            <p className="text-foreground font-semibold">원어/타겟 언어</p>
            <p>
              {project.sourceLanguage} → {project.targetLanguages.join(', ')}
            </p>
            <p className="text-xs">
              언어 탭 전환 시 플레이어가 해당 더빙 영상으로 즉시 전환됩니다.
            </p>
          </div>
        </aside>
      </section>
    </div>
  )
}

type LanguagePreviewProps = {
  language: string
  assets: Array<{
    id: string
    type: 'video' | 'subtitle'
    url: string
    duration: number
    codec: string
    resolution: string
    sizeMb: number
  }>
  version: 'original' | 'translated'
  onVersionChange: (version: 'original' | 'translated') => void
}

function LanguagePreview({ language, assets, version, onVersionChange }: LanguagePreviewProps) {
  const selectedAsset = assets.find((asset) => asset.type === 'video')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-foreground text-lg font-semibold">{language} 미리보기</h3>
        <div className="flex items-center gap-2">
          <Button
            variant={version === 'original' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onVersionChange('original')}
          >
            원본
          </Button>
          <Button
            variant={version === 'translated' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onVersionChange('translated')}
          >
            번역
          </Button>
        </div>
      </div>
      <div className="border-surface-3 bg-surface-1 relative overflow-hidden rounded-3xl border">
        <div className="bg-surface-2 text-muted flex h-64 flex-col items-center justify-center gap-3">
          <Play className="h-8 w-8" />
          <p className="text-sm">더빙 영상 미리보기 (모의)</p>
        </div>
        {selectedAsset ? (
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
            <span>{selectedAsset.codec}</span>
            <span>{selectedAsset.resolution}</span>
            <span>{selectedAsset.duration}s</span>
          </div>
        ) : null}
      </div>
      <div className="space-y-2">
        <p className="text-foreground text-sm font-semibold">결과물</p>
        <div className="space-y-2">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className={cn(
                'border-surface-4 bg-surface-1 text-muted flex items-center justify-between rounded-2xl border px-4 py-3 text-sm',
              )}
            >
              <div>
                <p className="text-foreground font-medium">
                  {asset.type === 'video' ? '더빙 영상' : '자막'} • {language}
                </p>
                <p className="text-muted text-xs">
                  {asset.codec} • {asset.resolution} • {asset.sizeMb}MB
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  trackEvent('asset_download', {
                    lang: language,
                    type: asset.type,
                    assetId: asset.id,
                  })
                }
              >
                <Download className="h-4 w-4" />
                다운로드
              </Button>
            </div>
          ))}
        </div>
        {assets.length === 0 ? (
          <div className="border-surface-4 bg-surface-2 text-muted rounded-2xl border border-dashed px-4 py-6 text-center text-sm">
            아직 산출물이 없습니다. 파이프라인 진행을 기다려주세요.
          </div>
        ) : null}
      </div>
      <div className="border-surface-4 bg-surface-1 text-muted rounded-2xl border px-4 py-3 text-xs">
        <div className="text-primary flex items-center gap-2">
          <ExternalLink className="h-4 w-4" />
          언어 탭 전환 시 플레이어가 해당 더빙 영상으로 즉시 전환됩니다.
        </div>
        <p className="mt-2">
          편집자는 더빙 스튜디오로 이동하여 세그먼트, 파형, 화자 레인을 실시간으로 조정할 수
          있습니다.
        </p>
      </div>
    </div>
  )
}
