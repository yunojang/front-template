import { useEffect, useMemo, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarIcon, UploadCloud, UserCheck } from 'lucide-react'
import { Controller, useForm, type UseFormReturn } from 'react-hook-form'
import { z } from 'zod'

import { trackEvent } from '../../../shared/lib/analytics'
import { useUiStore } from '../../../shared/store/useUiStore'
import { Button } from '../../../shared/ui/Button'
import { Checkbox } from '../../../shared/ui/Checkbox'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../../../shared/ui/Dialog'
import { Input } from '../../../shared/ui/Input'
import { Label } from '../../../shared/ui/Label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../shared/ui/Select'

type ProjectDraft = {
  fileName?: string
  fileSize?: number
  sourceLanguage: string
  targetLanguages: string[]
  speakerCount: number
  glossaryId?: string
  editorId?: string
  startDate?: string
  dueDate?: string
}

const languages = ['한국어', '영어', '일본어', '스페인어', '프랑스어']
const translators = [
  { id: 'translator-amy', name: 'Amy Kim', expertise: 'Korean ↔ English' },
  { id: 'translator-hiro', name: 'Hiro Tanaka', expertise: 'Japanese ↔ Korean' },
  { id: 'translator-luis', name: 'Luis Martinez', expertise: 'English ↔ Spanish' },
]

const glossaryOptions = [
  { id: 'glossary-ai', name: 'AI Suite Glossary' },
  { id: 'glossary-edu', name: 'Education Terms' },
]

const settingsSchema = z.object({
  sourceLanguage: z.string().min(1),
  detectAutomatically: z.boolean().default(true),
  targetLanguages: z.array(z.string()).min(1, { message: '타겟 언어를 최소 1개 선택하세요.' }),
  speakerCount: z.coerce.number().min(1).max(10),
  glossaryId: z.string().optional(),
})

const assignSchema = z
  .object({
    editorId: z.string().min(1, { message: '담당자를 선택하세요.' }),
    startDate: z.string().min(1),
    dueDate: z.string().min(1),
  })
  .refine((data) => data.dueDate >= data.startDate, {
    message: '마감일은 시작일 이후여야 합니다.',
    path: ['dueDate'],
  })

type SettingsFormValues = z.infer<typeof settingsSchema>
type AssignFormValues = z.infer<typeof assignSchema>

export function ProjectCreationModal() {
  const { projectCreation, closeProjectCreation, setProjectCreationStep } = useUiStore((state) => ({
    projectCreation: state.projectCreation,
    closeProjectCreation: state.closeProjectCreation,
    setProjectCreationStep: state.setProjectCreationStep,
  }))

  const [draft, setDraft] = useState<ProjectDraft>({
    sourceLanguage: '자동 감지',
    targetLanguages: [],
    speakerCount: 2,
  })

  const isUploadStep = projectCreation.step === 'upload'
  const isSettingsStep = projectCreation.step === 'settings-a'
  const isAssignStep = projectCreation.step === 'settings-b'

  const settingsForm = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      sourceLanguage: '자동 감지',
      detectAutomatically: true,
      targetLanguages: draft.targetLanguages,
      speakerCount: draft.speakerCount,
      glossaryId: draft.glossaryId ?? '',
    },
  })

  const assignForm = useForm<AssignFormValues>({
    resolver: zodResolver(assignSchema),
    defaultValues: {
      editorId: draft.editorId ?? '',
      startDate: draft.startDate ?? '',
      dueDate: draft.dueDate ?? '',
    },
  })

  useEffect(() => {
    if (!projectCreation.open) {
      setDraft({
        sourceLanguage: '자동 감지',
        targetLanguages: [],
        speakerCount: 2,
      })
      settingsForm.reset({
        sourceLanguage: '자동 감지',
        detectAutomatically: true,
        targetLanguages: [],
        speakerCount: 2,
        glossaryId: '',
      })
      assignForm.reset({
        editorId: '',
        startDate: '',
        dueDate: '',
      })
    }
  }, [projectCreation.open, settingsForm, assignForm])

  const handleUploadNext = (file?: File) => {
    if (!file) return
    setDraft((prev) => ({
      ...prev,
      fileName: file.name,
      fileSize: file.size,
    }))
    setProjectCreationStep('settings-a')
  }

  const handleSettingsNext = (values: SettingsFormValues) => {
    setDraft((prev) => ({
      ...prev,
      sourceLanguage: values.detectAutomatically ? '자동 감지' : values.sourceLanguage,
      targetLanguages: values.targetLanguages,
      speakerCount: values.speakerCount,
      glossaryId: values.glossaryId,
    }))
    trackEvent('proj_settings_a_next', {
      src: values.sourceLanguage,
      tgts: values.targetLanguages,
      speakers: values.speakerCount,
      glossary: values.glossaryId,
    })
    setProjectCreationStep('settings-b')
  }

  const handleCreateProject = (values: AssignFormValues) => {
    trackEvent('proj_create_submit', {
      editor: values.editorId,
      dates: {
        start: values.startDate,
        due: values.dueDate,
      },
    })
    setDraft((prev) => ({
      ...prev,
      editorId: values.editorId,
      startDate: values.startDate,
      dueDate: values.dueDate,
    }))
    useUiStore.getState().showToast({
      id: 'project-created',
      title: '프로젝트 생성 완료',
      description: '프로젝트 상세로 이동하여 파이프라인을 확인하세요.',
      autoDismiss: 4000,
    })
    closeProjectCreation()
  }

  const uploadSummary = useMemo(() => {
    if (!draft.fileName) return null
    const sizeMb = draft.fileSize ? (draft.fileSize / (1024 * 1024)).toFixed(1) : '0'
    return `${draft.fileName} • ${sizeMb}MB`
  }, [draft.fileName, draft.fileSize])

  return (
    <Dialog
      open={projectCreation.open}
      onOpenChange={(open) => (open ? null : closeProjectCreation())}
    >
      <DialogContent>
        {isUploadStep ? (
          <UploadStep
            onNext={handleUploadNext}
            onCancel={closeProjectCreation}
            summary={uploadSummary}
          />
        ) : null}
        {isSettingsStep ? (
          <SettingsStep
            form={settingsForm}
            draft={draft}
            onBack={() => setProjectCreationStep('upload')}
            onNext={handleSettingsNext}
          />
        ) : null}
        {isAssignStep ? (
          <AssignStep
            form={assignForm}
            draft={draft}
            onBack={() => setProjectCreationStep('settings-a')}
            onCreate={handleCreateProject}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

type UploadStepProps = {
  onNext: (file?: File) => void
  onCancel: () => void
  summary: string | null
}

function UploadStep({ onNext, onCancel, summary }: UploadStepProps) {
  const [file, setFile] = useState<File | undefined>()
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <DialogTitle>1단계 — 파일 업로드</DialogTitle>
      <DialogDescription>
        원본 영상을 드래그 앤 드롭하거나 클릭하여 선택하세요. 업로드 완료 전에는 다음 단계로 이동할
        수 없습니다.
      </DialogDescription>
      <label
        htmlFor="file-upload"
        className="border-surface-4 bg-surface-2 text-muted hover:border-primary/60 hover:bg-surface-3/70 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed p-10 text-center text-sm transition"
      >
        <UploadCloud className="text-primary h-8 w-8" />
        <span>여기에 파일을 놓거나 클릭하여 선택하세요.</span>
        <input
          id="file-upload"
          type="file"
          className="hidden"
          accept="video/*"
          onChange={(event) => {
            const selected = event.target.files?.[0]
            if (!selected) return
            if (selected.size > 1024 * 1024 * 1024) {
              setError('1GB 이하의 파일만 업로드 가능합니다.')
              return
            }
            setError(null)
            setFile(selected)
            trackEvent('create_upload_start', { name: selected.name })
            setTimeout(() => {
              trackEvent('create_upload_done', { name: selected.name })
            }, 500)
          }}
        />
      </label>
      {file ? (
        <div className="border-surface-4 bg-surface-1 text-muted rounded-2xl border px-4 py-3 text-sm">
          선택된 파일: <span className="text-foreground font-medium">{file.name}</span>
        </div>
      ) : null}
      {summary ? <p className="text-muted text-sm">최근 업로드: {summary}</p> : null}
      {error ? <p className="text-danger text-sm">{error}</p> : null}
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onCancel}>
          취소
        </Button>
        <Button onClick={() => onNext(file)} disabled={!file}>
          다음
        </Button>
      </div>
    </div>
  )
}

type SettingsStepProps = {
  form: UseFormReturn<SettingsFormValues>
  draft: ProjectDraft
  onBack: () => void
  onNext: (values: SettingsFormValues) => void
}

function SettingsStep({ form, draft, onBack, onNext }: SettingsStepProps) {
  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = form

  const detectAutomatically = watch('detectAutomatically')

  const submit = handleSubmit(onNext)

  return (
    <form
      onSubmit={(event) => {
        void submit(event)
      }}
      className="space-y-5"
    >
      <DialogTitle>2단계 — 언어 및 사전 설정</DialogTitle>
      <DialogDescription>
        최종 산출물은 타겟 언어로 더빙된 영상입니다. 언어별 더빙 품질을 유지할 수 있도록 화자 수와
        용어 사전을 지정하세요.
      </DialogDescription>
      <div className="space-y-2">
        <Label className="text-muted font-medium">원어(자동 인식)</Label>
        <div className="border-surface-4 bg-surface-1 flex items-center gap-3 rounded-2xl border p-4">
          <Checkbox
            checked={detectAutomatically}
            onCheckedChange={(checked) =>
              form.setValue('detectAutomatically', Boolean(checked), {
                shouldDirty: true,
              })
            }
          />
          <span className="text-muted text-sm">자동 인식 사용</span>
        </div>
        {!detectAutomatically ? (
          <Select
            value={watch('sourceLanguage')}
            onValueChange={(value) => form.setValue('sourceLanguage', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="원어를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((language) => (
                <SelectItem key={language} value={language}>
                  {language}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
      </div>
      <div className="space-y-3">
        <Label>타겟 언어 선택</Label>
        <div className="grid grid-cols-2 gap-2">
          {languages.map((language) => (
            <label
              key={language}
              className="border-surface-4 bg-surface-1 text-muted hover:border-primary/60 flex cursor-pointer items-center gap-3 rounded-2xl border px-3 py-2 text-sm"
            >
              <Controller
                control={control}
                name="targetLanguages"
                render={({ field }) => (
                  <Checkbox
                    checked={field.value?.includes(language)}
                    onCheckedChange={(checked) => {
                      const value = field.value ?? []
                      if (checked) {
                        field.onChange([...value, language])
                      } else {
                        field.onChange(value.filter((item) => item !== language))
                      }
                    }}
                  />
                )}
              />
              {language}
            </label>
          ))}
        </div>
        {errors.targetLanguages ? (
          <p className="text-danger text-sm">{errors.targetLanguages.message}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="speakerCount">화자 수</Label>
        <Input
          id="speakerCount"
          type="number"
          min={1}
          max={10}
          defaultValue={draft.speakerCount}
          {...register('speakerCount', { valueAsNumber: true })}
        />
        {errors.speakerCount ? (
          <p className="text-danger text-sm">{errors.speakerCount.message}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="glossary">번역 사전</Label>
        <Select
          value={watch('glossaryId')}
          onValueChange={(value) => form.setValue('glossaryId', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="선택(옵션)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">선택하지 않음</SelectItem>
            {glossaryOptions.map((glossary) => (
              <SelectItem key={glossary.id} value={glossary.id}>
                {glossary.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-between gap-3 pt-2">
        <Button variant="ghost" type="button" onClick={onBack}>
          이전
        </Button>
        <Button type="submit">다음</Button>
      </div>
    </form>
  )
}

type AssignStepProps = {
  form: UseFormReturn<AssignFormValues>
  draft: ProjectDraft
  onBack: () => void
  onCreate: (values: AssignFormValues) => void
}

function AssignStep({ form, draft, onBack, onCreate }: AssignStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form

  const submit = handleSubmit(onCreate)

  return (
    <form
      onSubmit={(event) => {
        void submit(event)
      }}
      className="space-y-5"
    >
      <DialogTitle>3단계 — 번역가 지정 & 일정 설정</DialogTitle>
      <DialogDescription>
        업로드 정보와 언어 설정을 바탕으로 번역가를 지정합니다. 마감일은 시작일 이후여야 하며 생성
        후 프로젝트 상세 화면으로 이동합니다.
      </DialogDescription>
      <div className="border-surface-4 bg-surface-2 text-muted space-y-2 rounded-2xl border p-4 text-sm">
        <p>업로드 파일: {draft.fileName ?? '선택 필요'}</p>
        <p>타겟 언어: {draft.targetLanguages.join(', ') || '미선택'}</p>
        <p>화자 수: {draft.speakerCount}</p>
        <p className="text-xs">
          최종 산출물: 타겟 언어 더빙 영상 • 역할에 따라 결과물 접근 권한이 달라집니다.
        </p>
      </div>
      <div className="space-y-3">
        <Label>번역가 선택</Label>
        <div className="grid gap-2">
          {translators.map((translator) => (
            <label
              key={translator.id}
              className="border-surface-4 bg-surface-1 text-muted hover:border-primary/70 flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm"
            >
              <div>
                <p className="text-foreground text-sm font-medium">{translator.name}</p>
                <p className="text-muted text-xs">{translator.expertise}</p>
              </div>
              <input
                type="radio"
                value={translator.id}
                className="h-4 w-4"
                {...register('editorId')}
              />
            </label>
          ))}
        </div>
        {errors.editorId ? <p className="text-danger text-sm">{errors.editorId.message}</p> : null}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="startDate">시작일</Label>
          <div className="border-surface-4 bg-surface-1 flex items-center gap-2 rounded-xl border px-3">
            <CalendarIcon className="text-muted h-4 w-4" />
            <input
              id="startDate"
              type="date"
              className="flex-1 bg-transparent py-3 text-sm"
              {...register('startDate')}
            />
          </div>
          {errors.startDate ? (
            <p className="text-danger text-sm">{errors.startDate.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="dueDate">마감일</Label>
          <div className="border-surface-4 bg-surface-1 flex items-center gap-2 rounded-xl border px-3">
            <CalendarIcon className="text-muted h-4 w-4" />
            <input
              id="dueDate"
              type="date"
              className="flex-1 bg-transparent py-3 text-sm"
              {...register('dueDate')}
            />
          </div>
          {errors.dueDate ? <p className="text-danger text-sm">{errors.dueDate.message}</p> : null}
        </div>
      </div>
      <div className="flex justify-between gap-3 pt-2">
        <Button variant="ghost" type="button" onClick={onBack}>
          이전
        </Button>
        <Button type="submit">
          <UserCheck className="mr-2 h-4 w-4" />
          프로젝트 생성
        </Button>
      </div>
    </form>
  )
}
