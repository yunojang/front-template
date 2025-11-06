import { useQuery } from '@tanstack/react-query'

import type { ProjectDetail, ProjectSummary } from '../../../entities/project/types'
import { apiGet } from '../../../shared/api/client'
import { queryKeys } from '../../../shared/config/queryKeys'

type ProjectsResponse = {
  items: ProjectSummary[]
}

export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects.all,
    queryFn: () => apiGet<ProjectsResponse>('projects'),
    select: (data) => data.items,
    placeholderData: (previous) => previous,
  })
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projects.detail(projectId),
    queryFn: () => apiGet<ProjectDetail>(`projects/${projectId}`),
    enabled: Boolean(projectId),
  })
}
