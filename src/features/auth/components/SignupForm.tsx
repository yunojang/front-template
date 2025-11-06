import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, UserPlus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'

import { routes } from '../../../shared/config/routes'
import { useAuthStore, type UserRole } from '../../../shared/store/useAuthStore'
import { Button } from '../../../shared/ui/Button'
import { Checkbox } from '../../../shared/ui/Checkbox'
import { Input } from '../../../shared/ui/Input'
import { Label } from '../../../shared/ui/Label'
import { useSignupMutation } from '../hooks/useAuthMutations'

import { RoleToggle } from './RoleToggle'

const signupSchema = z
  .object({
    email: z.string().email({ message: '올바른 이메일 형식을 입력하세요.' }),
    password: z.string().min(8, { message: '비밀번호는 8자 이상이어야 합니다.' }),
    confirmPassword: z.string(),
    userName: z.string().min(2).max(32, { message: '사용자이름은 2~32자 범위로 입력하세요.' }),
    roles: z.array(z.enum(['distributor', 'editor'])).nonempty(),
    agreeTerms: z.literal(true, { errorMap: () => ({ message: '약관 동의가 필요합니다.' }) }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: '비밀번호가 일치하지 않습니다.',
  })

type SignupFormValues = z.infer<typeof signupSchema>

export function SignupForm() {
  const requestedRoles = useAuthStore((state) => state.requestedRoles)
  const setRequestedRoles = useAuthStore((state) => state.setRequestedRoles)
  const signupMutation = useSignupMutation()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      userName: '',
      roles: requestedRoles,
      agreeTerms: false,
    },
  })

  const roles = watch('roles')

  const handleRoleChange = (value: UserRole[]) => {
    setValue('roles', value as SignupFormValues['roles'], {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const onSubmit = handleSubmit((data) => {
    setRequestedRoles(data.roles as UserRole[])
    signupMutation.mutate(data)
  })

  return (
    <form
      onSubmit={(event) => {
        void onSubmit(event)
      }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <Label htmlFor="userName">사용자이름</Label>
        <Input id="userName" placeholder="2~32자" {...register('userName')} />
        {errors.userName ? <p className="text-danger text-sm">{errors.userName.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">이메일</Label>
        <Input id="email" type="email" {...register('email')} placeholder="name@example.com" />
        {errors.email ? <p className="text-danger text-sm">{errors.email.message}</p> : null}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="password">비밀번호</Label>
          <Input id="password" type="password" {...register('password')} placeholder="8자 이상" />
          {errors.password ? (
            <p className="text-danger text-sm">{errors.password.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">비밀번호 확인</Label>
          <Input id="confirmPassword" type="password" {...register('confirmPassword')} />
          {errors.confirmPassword ? (
            <p className="text-danger text-sm">{errors.confirmPassword.message}</p>
          ) : null}
        </div>
      </div>
      <div className="space-y-3">
        <Label>역할 선택</Label>
        <RoleToggle value={roles} onChange={handleRoleChange} />
        {errors.roles ? <p className="text-danger text-sm">{errors.roles.message}</p> : null}
      </div>
      <div className="border-surface-4 bg-surface-2 flex items-start gap-3 rounded-2xl border p-4">
        <Checkbox
          id="agreeTerms"
          checked={watch('agreeTerms')}
          onCheckedChange={(checked) =>
            setValue('agreeTerms', Boolean(checked), { shouldDirty: true, shouldValidate: true })
          }
        />
        <Label htmlFor="agreeTerms" className="text-muted text-sm leading-relaxed">
          [필수] 서비스 이용약관 및 개인정보 처리방침에 동의합니다.
        </Label>
      </div>
      {errors.agreeTerms ? (
        <p className="text-danger text-sm">{errors.agreeTerms.message}</p>
      ) : null}
      <div className="grid gap-3">
        <Button type="submit" disabled={signupMutation.isPending} className="w-full">
          {signupMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              가입 처리 중…
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              회원가입 완료
            </>
          )}
        </Button>
        <Button asChild variant="secondary" className="w-full">
          <a href="#google-signup">Google로 계속</a>
        </Button>
      </div>
      <p className="text-muted text-sm">
        이미 계정이 있나요?{' '}
        <Link to={routes.login} className="text-primary font-medium hover:underline">
          로그인하기
        </Link>
      </p>
    </form>
  )
}
