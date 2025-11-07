import { useEffect, useMemo, useState } from 'react'

import { trackEvent } from '@/shared/lib/analytics'
import { useUiStore } from '@/shared/store/useUiStore'
import { Dialog, DialogContent } from '@/shared/ui/Dialog'

import {
  AutoDubbingSettingsStep,
  type AutoDubbingSettingsValues,
} from './steps/AutoDubbingSettingsStep'
import { SourceSelectionStep } from './steps/SourceSelectionStep'
import type { ProjectCreationDraft, SourceSelectionResult } from './types'

const createInitialDraft = (): ProjectCreationDraft => ({
  sourceType: 'file',
  title: '',
  detectAutomatically: true,
  sourceLanguage: '한국어',
  targetLanguages: [],
  speakerCount: 2,
})

export function ProjectCreationModal() {
  const { projectCreation, closeProjectCreation, setProjectCreationStep, showToast } = useUiStore(
    (state) => ({
      projectCreation: state.projectCreation,
      closeProjectCreation: state.closeProjectCreation,
      setProjectCreationStep: state.setProjectCreationStep,
      showToast: state.showToast,
    }),
  )

  const [draft, setDraft] = useState<ProjectCreationDraft>(() => createInitialDraft())

  const isSourceStep = projectCreation.step === 'source'
  const isDetailsStep = projectCreation.step === 'details'

  useEffect(() => {
    if (!projectCreation.open) {
      setDraft(createInitialDraft())
    }
  }, [projectCreation.open])

  const recentUploadSummary = useMemo(() => {
    if (!draft.fileName) return null
    const sizeMb = draft.fileSize ? (draft.fileSize / (1024 * 1024)).toFixed(1) : '0'
    return `${draft.fileName} • ${sizeMb}MB`
  }, [draft.fileName, draft.fileSize])

  const handleSourceSubmit = (values: SourceSelectionResult) => {
    setDraft((prev) => ({
      ...prev,
      sourceType: values.mode,
      youtubeUrl: values.mode === 'youtube' ? values.youtubeUrl : undefined,
      fileName: values.mode === 'file' ? (values.file?.name ?? prev.fileName) : undefined,
      fileSize: values.mode === 'file' ? (values.file?.size ?? prev.fileSize) : undefined,
    }))

    trackEvent('proj_source_ready', { mode: values.mode })
    setProjectCreationStep('details')
  }

  const handleDetailsSubmit = (values: AutoDubbingSettingsValues) => {
    setDraft((prev) => ({
      ...prev,
      title: values.title,
      detectAutomatically: values.detectAutomatically,
      sourceLanguage: values.sourceLanguage,
      targetLanguages: values.targetLanguages,
      speakerCount: values.speakerCount,
    }))

    showToast({
      id: 'project-created',
      title: '에피소드 생성 완료',
      description: 'AI 더빙 생성을 시작합니다.',
      autoDismiss: 4000,
    })
    trackEvent('proj_creation_complete', { title: values.title, targets: values.targetLanguages })
    closeProjectCreation()
  }

  return (
    <Dialog
      open={projectCreation.open}
      onOpenChange={(open) => {
        if (!open) closeProjectCreation()
      }}
    >
      <DialogContent>
        {isSourceStep ? (
          <SourceSelectionStep
            initialMode={draft.sourceType}
            initialYoutubeUrl={draft.youtubeUrl}
            previousUploadSummary={recentUploadSummary}
            onSubmit={handleSourceSubmit}
            onCancel={closeProjectCreation}
          />
        ) : null}
        {isDetailsStep ? (
          <AutoDubbingSettingsStep
            initialValues={{
              title: draft.title,
              detectAutomatically: draft.detectAutomatically,
              sourceLanguage: draft.sourceLanguage || '한국어',
              targetLanguages: draft.targetLanguages,
              speakerCount: draft.speakerCount,
            }}
            draft={draft}
            onBack={() => setProjectCreationStep('source')}
            onSubmit={handleDetailsSubmit}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
