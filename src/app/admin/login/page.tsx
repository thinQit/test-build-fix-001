'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { api } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true);
    const response = await api.post<{ token: string; expiresIn: number }>('/api/admin/login', {
      email: form.email,
      password: form.password
    });
    setLoading(false);

    if (response.error || !response.data?.token) {
      setError(response.error || 'Login failed.');
      toast('Invalid credentials.', 'error');
      return;
    }

    localStorage.setItem('token', response.data.token);
    login({
      id: 'admin',
      email: form.email,
      name: 'Admin',
      role: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    toast('Welcome back!', 'success');
    router.push('/admin');
  };

  return (
    <div className="px-6 py-12">
      <section className="mx-auto max-w-md">
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-semibold">Admin login</h1>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(event) => handleChange('email', event.target.value)}
                required
              />
              <Input
                label="Password"
                type="password"
                value={form.password}
                onChange={(event) => handleChange('password', event.target.value)}
                required
              />
              {error && <p className="text-sm text-error">{error}</p>}
              <Button type="submit" fullWidth loading={loading}>
                Sign in
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
