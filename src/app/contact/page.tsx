'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { api } from '@/lib/api';
import { useToast } from '@/providers/ToastProvider';

export default function ContactPage() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess(false);

    if (!form.name || !form.email || !form.message) {
      setError('Please fill out all required fields.');
      return;
    }

    setLoading(true);
    const response = await api.post<{ id: string; status: string; createdAt: string }>('/api/leads', {
      name: form.name,
      email: form.email,
      company: form.company || undefined,
      message: form.message,
      source: 'contact-page'
    });
    setLoading(false);

    if (response.error) {
      setError(response.error);
      toast('Failed to send message. Please try again.', 'error');
      return;
    }

    setSuccess(true);
    setForm({ name: '', email: '', company: '', message: '' });
    toast('Thanks! We received your message.', 'success');
  };

  return (
    <div className="px-6 py-12">
      <section className="mx-auto max-w-4xl text-center space-y-4">
        <h1 className="text-4xl font-bold">Contact our team</h1>
        <p className="text-secondary">Share your goals and we’ll reach out within 24 hours.</p>
      </section>

      <section className="mx-auto mt-10 max-w-3xl">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Start a conversation</h2>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                label="Name"
                value={form.name}
                onChange={(event) => handleChange('name', event.target.value)}
                placeholder="Jane Doe"
                required
              />
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(event) => handleChange('email', event.target.value)}
                placeholder="jane@company.com"
                required
              />
              <Input
                label="Company (optional)"
                value={form.company}
                onChange={(event) => handleChange('company', event.target.value)}
                placeholder="Company name"
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-foreground">Message</label>
                <textarea
                  className="w-full rounded-md border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={5}
                  value={form.message}
                  onChange={(event) => handleChange('message', event.target.value)}
                  placeholder="Tell us about your project..."
                  required
                />
              </div>
              {error && <p className="text-sm text-error">{error}</p>}
              {success && <p className="text-sm text-success">Your message has been sent.</p>}
              <Button type="submit" loading={loading} fullWidth>
                Send message
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-secondary">
          Prefer to schedule a call?{' '}
          <a className="text-primary font-medium" href="https://cal.com" target="_blank" rel="noreferrer">
            Book a time
          </a>
        </div>
      </section>
    </div>
  );
}
