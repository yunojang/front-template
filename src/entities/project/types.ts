export type ProjectStatus = 'processing' | 'editing' | 'review' | 'done'

export interface ProjectSummary {
  id: string
  title: string
  sourceLanguage: string
  targetLanguages: string[]
  status: ProjectStatus
  progress: number
  dueDate: string
  assignedEditor?: string
  createdAt?: string
}

export interface ProjectAsset {
  id: string
  language: string
  type: 'video' | 'subtitle'
  url: string
  duration: number
  codec: string
  resolution: string
  sizeMb: number
}

export interface ProjectDetail extends ProjectSummary {
  description?: string
  createdAt: string
  glossaryName?: string
  speakerCount: number
  assets: ProjectAsset[]
  notes?: string
}

export const sampleProjects: ProjectDetail[] = [
  {
    id: 'proj-1001',
    title: 'AI Voice-over Launch Trailer',
    sourceLanguage: 'English',
    targetLanguages: ['Korean', 'Japanese', 'Spanish'],
    status: 'editing',
    progress: 56,
    dueDate: '2025-02-06',
    assignedEditor: 'translator-amy',
    description:
      'Marketing trailer localisation for the upcoming AI voice-over suite. Includes three regional variants and a shared glossary.',
    createdAt: '2025-01-15T10:00:00Z',
    glossaryName: 'AI Suite Glossary',
    speakerCount: 3,
    assets: [
      {
        id: 'asset-kr-video',
        language: 'Korean',
        type: 'video',
        url: '/assets/sample-video-kr.mp4',
        duration: 126,
        codec: 'H.264',
        resolution: '1920x1080',
        sizeMb: 210,
      },
      {
        id: 'asset-jp-video',
        language: 'Japanese',
        type: 'video',
        url: '/assets/sample-video-jp.mp4',
        duration: 126,
        codec: 'H.264',
        resolution: '1920x1080',
        sizeMb: 208,
      },
      {
        id: 'asset-es-video',
        language: 'Spanish',
        type: 'video',
        url: '/assets/sample-video-es.mp4',
        duration: 126,
        codec: 'H.264',
        resolution: '1920x1080',
        sizeMb: 212,
      },
    ],
    notes: 'Awaiting Korean voice alignment feedback from QA.',
  },
  {
    id: 'proj-1002',
    title: 'Educational Webinar Series',
    sourceLanguage: 'Korean',
    targetLanguages: ['English'],
    status: 'processing',
    progress: 32,
    dueDate: '2025-02-28',
    assignedEditor: 'translator-luis',
    createdAt: '2025-01-20T09:00:00Z',
    glossaryName: 'Education Terms',
    speakerCount: 2,
    assets: [
      {
        id: 'asset-en-preview',
        language: 'English',
        type: 'video',
        url: '/assets/sample-video-en.mp4',
        duration: 162,
        codec: 'H.264',
        resolution: '1920x1080',
        sizeMb: 256,
      },
    ],
  },
  {
    id: 'proj-1003',
    title: 'Creator Success Stories',
    sourceLanguage: 'Japanese',
    targetLanguages: ['English', 'Korean'],
    status: 'review',
    progress: 88,
    dueDate: '2025-01-31',
    assignedEditor: 'translator-erin',
    createdAt: '2025-01-05T14:25:00Z',
    speakerCount: 4,
    assets: [
      {
        id: 'asset-en-video',
        language: 'English',
        type: 'video',
        url: '/assets/sample-video-en.mp4',
        duration: 180,
        codec: 'H.265',
        resolution: '3840x2160',
        sizeMb: 420,
      },
      {
        id: 'asset-ko-subtitle',
        language: 'Korean',
        type: 'subtitle',
        url: '/assets/sample-subtitle-ko.srt',
        duration: 180,
        codec: 'SRT',
        resolution: '—',
        sizeMb: 0.4,
      },
    ],
  },
]
