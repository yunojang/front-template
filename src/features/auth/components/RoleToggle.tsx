import { useMemo } from 'react'

import { useAuthStore, type UserRole } from '../../../shared/store/useAuthStore'
import { ToggleGroup, ToggleGroupItem } from '../../../shared/ui/ToggleGroup'

type RoleToggleProps = {
  value?: UserRole[]
  onChange?: (roles: UserRole[]) => void
}

const options: Array<{ value: UserRole; label: string }> = [
  { value: 'distributor', label: '배급사' },
  { value: 'editor', label: '번역가' },
]

export function RoleToggle({ value, onChange }: RoleToggleProps) {
  const requestedRoles = useAuthStore((state) => state.requestedRoles)
  const selected = value ?? requestedRoles
  const sorted = useMemo(() => [...new Set(selected)], [selected])

  return (
    <ToggleGroup
      type="multiple"
      value={sorted}
      onValueChange={(val) => {
        if (val.length === 0) {
          return
        }
        onChange?.(val as UserRole[])
      }}
      className="w-full justify-between"
    >
      {options.map((option) => (
        <ToggleGroupItem key={option.value} value={option.value}>
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
