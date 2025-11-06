import { UploadCloud } from 'lucide-react'

import { trackEvent } from '../../shared/lib/analytics'
import { useUiStore } from '../../shared/store/useUiStore'
import { Button } from '../../shared/ui/Button'
import { Card, CardDescription, CardHeader, CardTitle } from '../../shared/ui/Card'

export function UploadCard() {
  const openProjectCreation = useUiStore((state) => state.openProjectCreation)

  return (
    <Card className="border-surface-4 bg-surface-1/70 border border-dashed p-8 text-center">
      <CardHeader>
        <CardTitle>프로젝트 생성</CardTitle>
        <CardDescription>
          원본 영상을 업로드하고 타겟 언어, 번역 사전, 번역가를 순차적으로 설정합니다.
        </CardDescription>
      </CardHeader>
      <Button
        variant="secondary"
        className="mx-auto mt-4 w-48"
        onClick={() => {
          trackEvent('open_create_modal')
          openProjectCreation('upload')
        }}
      >
        <UploadCloud className="h-4 w-4" />
        파일 업로드
      </Button>
    </Card>
  )
}
