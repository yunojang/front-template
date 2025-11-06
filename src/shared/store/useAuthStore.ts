import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

type UserRole = 'distributor' | 'editor'

type AuthState = {
  isAuthenticated: boolean
  roles: UserRole[]
  requestedRoles: UserRole[]
  userName?: string
  setRequestedRoles: (roles: UserRole[]) => void
  authenticate: (payload: { userName: string; roles: UserRole[] }) => void
  signOut: () => void
}

export const useAuthStore = create<AuthState>()(
  devtools((set) => ({
    isAuthenticated: false,
    roles: [],
    requestedRoles: ['distributor'],
    userName: undefined,
    setRequestedRoles: (roles) =>
      set(
        {
          requestedRoles: roles,
        },
        false,
        { type: 'auth/setRequestedRoles', payload: roles },
      ),
    authenticate: ({ userName, roles }) =>
      set(
        {
          isAuthenticated: true,
          userName,
          roles,
        },
        false,
        { type: 'auth/authenticate', payload: roles },
      ),
    signOut: () =>
      set(
        {
          isAuthenticated: false,
          roles: [],
          userName: undefined,
        },
        false,
        { type: 'auth/signOut' },
      ),
  })),
)

export type { UserRole }
