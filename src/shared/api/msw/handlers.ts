import { HttpResponse, http } from 'msw'

import { sampleGlossaries } from '../../../entities/glossary/types'
import { sampleProjects } from '../../../entities/project/types'
import { sampleSegments } from '../../../entities/segment/types'
import { sampleVoices } from '../../../entities/voice-sample/types'

export const handlers = [
  http.get('/api/projects', () => {
    const items = sampleProjects.map((project) => ({
      id: project.id,
      title: project.title,
      sourceLanguage: project.sourceLanguage,
      targetLanguages: project.targetLanguages,
      status: project.status,
      progress: project.progress,
      dueDate: project.dueDate,
      assignedEditor: project.assignedEditor,
      createdAt: project.createdAt,
    }))

    return HttpResponse.json({ items })
  }),

  http.get('/api/projects/:id', ({ params }) => {
    const project = sampleProjects.find((item) => item.id === params.id)
    if (!project) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    }
    return HttpResponse.json(project)
  }),

  http.get('/api/editor/:id', ({ params }) => {
    const project = sampleProjects.find((item) => item.id === params.id)
    if (!project) {
      return HttpResponse.json({ message: 'Editor state not found' }, { status: 404 })
    }

    return HttpResponse.json({
      projectId: project.id,
      targetLanguages: project.targetLanguages,
      segments: sampleSegments,
      voices: sampleVoices,
      glossaries: sampleGlossaries,
      playback: {
        duration: project.assets.at(0)?.duration ?? 0,
        activeLanguage: project.targetLanguages[0],
        playbackRate: 1,
      },
    })
  }),
]
