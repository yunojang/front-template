import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, LogIn, Mail } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'

import { routes } from '../../../shared/config/routes'
import { trackEvent } from '../../../shared/lib/analytics'
import { useAuthStore, type UserRole } from '../../../shared/store/useAuthStore'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { Label } from '../../../shared/ui/Label'
import { useLoginMutation } from '../hooks/useAuthMutations'

import { RoleToggle } from './RoleToggle'

const roleSchema = z.enum(['distributor', 'editor'])

const loginSchema = z.object({
  email: z.string().email({ message: '올바른 이메일 형식을 입력하세요.' }),
  password: z.string().min(8, { message: '비밀번호는 8자 이상이어야 합니다.' }),
  roles: z.array(roleSchema).nonempty({ message: '최소 1개 이상의 역할을 선택하세요.' }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const requestedRoles = useAuthStore((state) => state.requestedRoles)
  const setRequestedRoles = useAuthStore((state) => state.setRequestedRoles)
  const loginMutation = useLoginMutation()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      roles: requestedRoles,
    },
  })

  const roles = watch('roles')

  const handleRoleChange = (value: UserRole[]) => {
    setValue('roles', value, { shouldDirty: true, shouldValidate: true })
  }

  const onSubmit = handleSubmit((data) => {
    setRequestedRoles(data.roles as UserRole[])
    loginMutation.mutate(data)
  })

  return (
    <form
      onSubmit={(event) => {
        void onSubmit(event)
      }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <Label htmlFor="email">이메일</Label>
        <Input id="email" type="email" placeholder="name@example.com" {...register('email')} />
        {errors.email ? <p className="text-danger text-sm">{errors.email.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">비밀번호</Label>
        <Input id="password" type="password" placeholder="8자 이상" {...register('password')} />
        {errors.password ? <p className="text-danger text-sm">{errors.password.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label>역할 토글</Label>
        <RoleToggle value={roles} onChange={handleRoleChange} />
        {errors.roles ? <p className="text-danger text-sm">{errors.roles.message}</p> : null}
      </div>
      <div className="grid gap-3">
        <Button type="submit" disabled={loginMutation.isPending} className="w-full">
          {loginMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              로그인 중…
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              로그인
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => {
            trackEvent('login_google_click', { roles })
          }}
        >
          <Mail className="h-4 w-4" />
          Google로 계속
        </Button>
      </div>
      <div className="text-muted flex flex-wrap items-center justify-between gap-3 text-sm">
        <Link to={routes.signup} className="text-primary font-medium hover:underline">
          회원가입으로 이동
        </Link>
        <button
          type="button"
          className="text-muted hover:text-primary text-sm"
          onClick={() => trackEvent('login_forgot_password_click')}
        >
          비밀번호 찾기
        </button>
      </div>
    </form>
  )
}
