// components/LoginForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';

type AuthMode = 'login' | 'register';

export function LoginForm() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();
  const router = useRouter();

  const isLogin = mode === 'login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login(username, password);
      } else {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        
        if (password.length < 8) {
          setError('Password must be at least 8 characters');
          setLoading(false);
          return;
        }

        await register(username, email, password);
      }
      
      router.push('/feed');
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail 
        || err.response?.data?.username?.[0]
        || err.response?.data?.email?.[0]
        || err.response?.data?.password?.[0]
        || (isLogin ? 'Login failed' : 'Registration failed');
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(isLogin ? 'register' : 'login');
    setError('');
    setUsername('');
    setEmail('');
    setConfirmPassword('');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-surface-elevated backdrop-blur-xl p-6 rounded border border-border-default">
        <h2 className="text-2xl font-medium mb-6 text-text-primary">
          {isLogin ? 'Welcome back' : 'Create account'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-2.5 bg-danger-bg text-danger-text text-sm border border-danger-border rounded-sm">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-xs font-medium mb-1.5 text-text-secondary uppercase tracking-wide">
              {isLogin ? 'Username or Email' : 'Username'}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-border-default rounded-sm focus:outline-none focus:border-focus-ring transition-all bg-surface-secondary text-text-primary"
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-medium mb-1.5 text-text-secondary uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-border-default rounded-sm focus:outline-none focus:border-focus-ring transition-all bg-surface-secondary text-text-primary"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium mb-1.5 text-text-secondary uppercase tracking-wide">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-border-default rounded-sm focus:outline-none focus:border-focus-ring transition-all bg-surface-secondary text-text-primary"
              required
              minLength={isLogin ? undefined : 8}
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-medium mb-1.5 text-text-secondary uppercase tracking-wide">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-border-default rounded-sm focus:outline-none focus:border-focus-ring transition-all bg-surface-secondary text-text-primary"
                required
                minLength={8}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-action-primary text-surface-primary hover:bg-action-primary-hover disabled:bg-state-disabled font-medium transition-all mt-6 rounded-sm"
          >
            {loading 
              ? (isLogin ? 'Logging in...' : 'Creating account...') 
              : (isLogin ? 'Login' : 'Sign Up')
            }
          </button>

          <div className="text-center pt-5 border-t border-border-default mt-5">
            <p className="text-sm text-text-secondary">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={toggleMode}
                className="text-text-primary hover:underline font-medium"
              >
                {isLogin ? 'Sign up' : 'Login'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}