import { LoginForm } from '../../features/auth/components/LoginForm'
import { Card, CardDescription, CardHeader, CardTitle } from '../../shared/ui/Card'

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center gap-8 px-6 py-16">
      <div className="max-w-md text-center">
        <h1 className="text-foreground text-3xl font-semibold">로그인</h1>
        <p className="text-muted mt-3 text-sm">
          {/* 역할 토글을 통해 배급사·편집자 권한을 합쳐 로그인할 수 있습니다. Google SSO도 지원합니다. */}
        </p>
      </div>
      <Card className="border-surface-4 bg-surface-1 w-full max-w-lg border p-8 shadow-soft">
        <CardHeader>
          <CardTitle>로그인</CardTitle>
          {/* <CardDescription>Role 토글 값이 세션 병합 로직에 반영됩니다.</CardDescription> */}
        </CardHeader>
        <LoginForm />
      </Card>
    </div>
  )
}
