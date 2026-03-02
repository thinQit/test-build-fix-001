'use client';

import { useEffect, useState } from 'react';
import Card, { CardContent } from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import { api } from '@/lib/api';

interface Testimonial {
  id: string;
  author: string;
  role?: string | null;
  company?: string | null;
  quote: string;
  avatarUrl?: string | null;
  createdAt?: string | null;
}

export default function TestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      const response = await api.get<{ items: Testimonial[] }>('/api/testimonials?limit=12');
      if (response.error) {
        setError(response.error);
      } else {
        setItems(response.data?.items || []);
      }
      setLoading(false);
    };

    load();
  }, []);

  return (
    <div className="px-6 py-12">
      <section className="mx-auto max-w-5xl text-center space-y-4">
        <h1 className="text-4xl font-bold">Testimonials</h1>
        <p className="text-secondary">Real stories from teams using our SaaS blueprint.</p>
      </section>

      <section className="mx-auto mt-10 max-w-5xl">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Spinner className="h-8 w-8" />
          </div>
        ) : error ? (
          <Card>
            <CardContent>
              <p className="text-error">{error}</p>
            </CardContent>
          </Card>
        ) : items.length === 0 ? (
          <Card>
            <CardContent>
              <p className="text-secondary">No testimonials available yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {items.map((testimonial) => (
              <Card key={testimonial.id}>
                <CardContent className="space-y-4">
                  <p className="text-sm text-secondary">“{testimonial.quote}”</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-primary font-semibold">
                      {testimonial.author.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{testimonial.author}</p>
                      <p className="text-xs text-secondary">
                        {testimonial.role || 'Customer'}{testimonial.company ? `, ${testimonial.company}` : ''}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-secondary">
                    {testimonial.createdAt ? new Date(testimonial.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
