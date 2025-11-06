import { Check, RefreshCcw, Save, Undo2 } from 'lucide-react'

import { trackEvent } from '../../../shared/lib/analytics'
import { useUiStore } from '../../../shared/store/useUiStore'
import { Button } from '../../../shared/ui/Button'

export function EditorToolbar() {
  const showToast = useUiStore((state) => state.showToast)

  return (
    <div className="border-surface-3 bg-surface-1 flex flex-wrap items-center justify-between gap-3 rounded-3xl border px-6 py-4 shadow-soft">
      <div>
        <p className="text-foreground text-sm font-semibold">번역 편집 툴바</p>
        <p className="text-muted text-xs">
          번역 반영 시 파형이 즉시 갱신되고, 저장 성공 시 배급사에게 알림 메일이 전송됩니다 (모의).
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            trackEvent('track_speed_change', { from: 1, to: 1.1 })
            useUiStore.getState().showToast({
              id: 'preview',
              title: '임시 합성 미리보기',
              description: '현재 번역을 기준으로 샘플 오디오를 재생합니다.',
              autoDismiss: 3000,
            })
          }}
        >
          <RefreshCcw className="h-4 w-4" />
          번역 반영
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            trackEvent('track_split')
            showToast({
              id: 'split',
              title: '분할 모드',
              description: '분할·병합 도구를 사용하여 싱크를 조정하세요.',
              autoDismiss: 3000,
            })
          }}
        >
          <Undo2 className="h-4 w-4" />
          병합/분할
        </Button>
        <Button
          size="sm"
          onClick={() => {
            trackEvent('edit_save')
            showToast({
              id: 'save',
              title: '저장 완료',
              description: '배급사에게 알림 메일을 전송했습니다 (모의).',
              autoDismiss: 3000,
            })
            trackEvent('edit_save_success')
          }}
        >
          <Save className="h-4 w-4" />
          저장
        </Button>
        <Button variant="outline" size="sm">
          <Check className="h-4 w-4" />
          완료 처리
        </Button>
      </div>
    </div>
  )
}
