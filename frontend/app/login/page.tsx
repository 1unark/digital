// app/login/page.tsx
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