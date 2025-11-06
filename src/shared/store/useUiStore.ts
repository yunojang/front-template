import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

type ToastPayload = {
  id: string
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  autoDismiss?: number
}

type ProjectCreationStep = 'upload' | 'settings-a' | 'settings-b'

type UiState = {
  activeToast: ToastPayload | null
  showToast: (toast: ToastPayload) => void
  dismissToast: (id: string) => void
  projectCreation: {
    open: boolean
    step: ProjectCreationStep
  }
  openProjectCreation: (step?: ProjectCreationStep) => void
  closeProjectCreation: () => void
  setProjectCreationStep: (step: ProjectCreationStep) => void
}

export const useUiStore = create<UiState>()(
  devtools((set) => ({
    activeToast: null,
    showToast: (toast) =>
      set(
        {
          activeToast: toast,
        },
        false,
        { type: 'ui/showToast' },
      ),
    dismissToast: (id) =>
      set(
        (state) => ({
          activeToast: state.activeToast?.id === id ? null : state.activeToast,
        }),
        false,
        { type: 'ui/dismissToast' },
      ),
    projectCreation: {
      open: false,
      step: 'upload',
    },
    openProjectCreation: (step = 'upload') =>
      set(
        {
          projectCreation: {
            open: true,
            step,
          },
        },
        false,
        { type: 'ui/openProjectCreation' },
      ),
    closeProjectCreation: () =>
      set(
        {
          projectCreation: {
            open: false,
            step: 'upload',
          },
        },
        false,
        { type: 'ui/closeProjectCreation' },
      ),
    setProjectCreationStep: (step) =>
      set(
        (state) => ({
          projectCreation: {
            ...state.projectCreation,
            step,
          },
        }),
        false,
        { type: 'ui/setProjectCreationStep', payload: step },
      ),
  })),
)

export type { ProjectCreationStep, ToastPayload }
