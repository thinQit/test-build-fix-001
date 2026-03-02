'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
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

interface Testimonial {
  id: string;
  author: string;
  role?: string | null;
  company?: string | null;
  quote: string;
  avatarUrl?: string | null;
}

interface SiteContent {
  heroTitle?: string | null;
  heroSubtitle?: string | null;
  heroCtaText?: string | null;
  heroImageUrl?: string | null;
}

export default function HomePage() {
  const [pricing, setPricing] = useState<PricingPlan[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      const [pricingRes, testimonialRes, contentRes] = await Promise.all([
        api.get<{ items: PricingPlan[] }>('/api/pricing'),
        api.get<{ items: Testimonial[] }>('/api/testimonials?limit=3'),
        api.get<SiteContent>('/api/site-content')
      ]);

      if (pricingRes.error || testimonialRes.error || contentRes.error) {
        setError(pricingRes.error || testimonialRes.error || contentRes.error || 'Failed to load content.');
      } else {
        setPricing(pricingRes.data?.items || []);
        setTestimonials(testimonialRes.data?.items || []);
        setSiteContent(contentRes.data || null);
      }
      setLoading(false);
    };

    load();
  }, []);

  return (
    <div className="px-6 py-12">
      <section className="mx-auto max-w-6xl grid gap-8 lg:grid-cols-2 items-center">
        <div className="space-y-6">
          <p className="text-sm font-semibold text-primary">Modern SaaS Platform</p>
          <h1 className="text-4xl font-bold text-foreground md:text-5xl">
            {siteContent?.heroTitle || 'Launch your SaaS with confidence'}
          </h1>
          <p className="text-lg text-secondary">
            {siteContent?.heroSubtitle ||
              'A clean blue-and-white experience with pricing, testimonials, and a conversion-ready contact flow.'}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild>
              <Link href="/pricing">{siteContent?.heroCtaText || 'View Pricing'}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/contact">Talk to Sales</Link>
            </Button>
          </div>
          <div className="flex items-center gap-6 text-sm text-secondary">
            <span>✅ WCAG-ready UI</span>
            <span>✅ Secure admin controls</span>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-muted p-8">
          <div className="aspect-video w-full rounded-xl bg-gradient-to-br from-primary/20 to-transparent flex items-center justify-center">
            <span className="text-primary font-semibold">{siteContent?.heroImageUrl ? 'Image Ready' : 'Hero Illustration'}</span>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Pricing highlights</h2>
          <Link href="/pricing" className="text-sm font-medium text-primary">See all plans →</Link>
        </div>
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
        ) : pricing.length === 0 ? (
          <Card>
            <CardContent>
              <p className="text-secondary">No pricing plans available yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {pricing.slice(0, 3).map((plan) => (
              <Card key={plan.id} className={plan.isFeatured ? 'border-primary shadow-lg' : ''}>
                <CardHeader>
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <p className="text-3xl font-bold text-foreground">${plan.priceMonthly}/mo</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm text-secondary">
                    {(plan.features || []).slice(0, 3).map((feature, index) => (
                      <li key={`${plan.id}-${index}`} className="flex items-center gap-2">• {feature}</li>
                    ))}
                  </ul>
                  <Button fullWidth>{plan.ctaText || 'Get started'}</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto mt-16 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">What customers say</h2>
          <Link href="/testimonials" className="text-sm font-medium text-primary">Read more →</Link>
        </div>
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
        ) : testimonials.length === 0 ? (
          <Card>
            <CardContent>
              <p className="text-secondary">No testimonials available yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id}>
                <CardContent className="space-y-3">
                  <p className="text-sm text-secondary">“{testimonial.quote}”</p>
                  <div className="text-sm font-semibold">{testimonial.author}</div>
                  <div className="text-xs text-secondary">
                    {testimonial.role || 'Customer'}{testimonial.company ? `, ${testimonial.company}` : ''}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto mt-16 max-w-6xl">
        <Card className="bg-primary text-white">
          <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-2xl font-semibold">Ready to capture more leads?</h3>
              <p className="text-sm text-white/80">Let’s build your conversion-ready SaaS site.</p>
            </div>
            <Button variant="secondary" asChild>
              <Link href="/contact">Contact the team</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
