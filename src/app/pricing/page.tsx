'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { api } from '@/lib/api';

interface PricingPlan {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly?: number | null;
  features?: string[];
  ctaText?: string | null;
  isFeatured?: boolean | null;
}

export default function PricingPage() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      const response = await api.get<{ items: PricingPlan[] }>('/api/pricing');
      if (response.error) {
        setError(response.error);
      } else {
        setPlans(response.data?.items || []);
      }
      setLoading(false);
    };

    load();
  }, []);

  return (
    <div className="px-6 py-12">
      <section className="mx-auto max-w-6xl text-center space-y-4">
        <h1 className="text-4xl font-bold">Flexible pricing for every stage</h1>
        <p className="text-secondary">Choose a plan that scales with your SaaS growth.</p>
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted p-1">
          <button
            type="button"
            onClick={() => setBilling('monthly')}
            className={`px-4 py-2 text-sm font-medium rounded-full ${
              billing === 'monthly' ? 'bg-white text-foreground shadow' : 'text-secondary'
            }`}
            aria-pressed={billing === 'monthly'}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBilling('yearly')}
            className={`px-4 py-2 text-sm font-medium rounded-full ${
              billing === 'yearly' ? 'bg-white text-foreground shadow' : 'text-secondary'
            }`}
            aria-pressed={billing === 'yearly'}
          >
            Yearly
          </button>
        </div>
      </section>

      <section className="mx-auto mt-10 max-w-6xl">
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
        ) : plans.length === 0 ? (
          <Card>
            <CardContent>
              <p className="text-secondary">No pricing plans available yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => {
              const price = billing === 'monthly' ? plan.priceMonthly : plan.priceYearly || plan.priceMonthly * 10;
              return (
                <Card key={plan.id} className={plan.isFeatured ? 'border-primary shadow-lg' : ''}>
                  <CardHeader className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{plan.name}</h3>
                      {plan.isFeatured && <Badge>Popular</Badge>}
                    </div>
                    <p className="text-3xl font-bold">${price}{billing === 'monthly' ? '/mo' : '/yr'}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2 text-sm text-secondary">
                      {(plan.features || []).map((feature, index) => (
                        <li key={`${plan.id}-${index}`} className="flex items-center gap-2">• {feature}</li>
                      ))}
                    </ul>
                    <Button fullWidth>{plan.ctaText || 'Start now'}</Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section className="mx-auto mt-16 max-w-4xl space-y-4">
        <h2 className="text-2xl font-semibold text-center">FAQ</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { q: 'Can I cancel anytime?', a: 'Yes, plans are flexible and can be canceled at any time.' },
            { q: 'Do you offer annual discounts?', a: 'Yearly billing includes a discount compared to monthly.' },
            { q: 'Is support included?', a: 'All plans include email support and onboarding resources.' },
            { q: 'Can I upgrade later?', a: 'Upgrade or downgrade your plan whenever your needs change.' }
          ].map((faq) => (
            <Card key={faq.q}>
              <CardContent>
                <h3 className="font-semibold">{faq.q}</h3>
                <p className="text-sm text-secondary mt-2">{faq.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
