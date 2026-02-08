// app/login/page.tsx
export const runtime = 'edge';
import { LoginForm } from '@/components/auth/LoginForm';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function AuthPage() {
  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen flex items-center justify-center bg-surface-secondary">
        <LoginForm />
      </div>
    </AuthGuard>
  );
}