import { useEffect } from 'react'

import * as ToastPrimitive from '@radix-ui/react-toast'

import { cn } from '../lib/utils'
import { useUiStore } from '../store/useUiStore'

import { Button } from './Button'

type AppToasterProps = {
  appName: string
}

export function AppToaster({ appName }: AppToasterProps) {
  const { toast, dismissToast } = useUiStore((state) => ({
    toast: state.activeToast,
    dismissToast: state.dismissToast,
  }))

  useEffect(() => {
    if (toast?.autoDismiss) {
      const timer = window.setTimeout(() => dismissToast(toast.id), toast.autoDismiss)
      return () => window.clearTimeout(timer)
    }
    return undefined
  }, [toast, dismissToast])

  return (
    <ToastPrimitive.Provider swipeDirection="right">
      <ToastPrimitive.Viewport className="fixed bottom-4 right-4 z-[60] flex w-full max-w-xs flex-col gap-3" />
      <ToastPrimitive.Root
        className={cn(
          'data-[state=closed]:animate-slide-out data-[state=open]:animate-slide-in',
          'border-surface-4 bg-surface-2 rounded-2xl border p-4 shadow-xl shadow-black/10',
        )}
        open={Boolean(toast)}
        onOpenChange={(open) => {
          if (!open && toast) {
            dismissToast(toast.id)
          }
        }}
      >
        <ToastPrimitive.Title className="text-foreground text-sm font-semibold">
          {toast?.title ?? appName}
        </ToastPrimitive.Title>
        {toast?.description ? (
          <ToastPrimitive.Description className="text-muted mt-1 text-sm">
            {toast.description}
          </ToastPrimitive.Description>
        ) : null}
        <div className="mt-3 flex items-center gap-2">
          {toast?.actionLabel ? (
            <ToastPrimitive.Action asChild altText={toast.actionLabel}>
              <Button size="sm" onClick={toast.onAction}>
                {toast.actionLabel}
              </Button>
            </ToastPrimitive.Action>
          ) : null}
          <ToastPrimitive.Close asChild>
            <Button variant="ghost" size="sm">
              Close
            </Button>
          </ToastPrimitive.Close>
        </div>
      </ToastPrimitive.Root>
    </ToastPrimitive.Provider>
  )
}
