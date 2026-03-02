'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';

interface Lead {
  id: string;
  name: string;
  email: string;
  company?: string | null;
  message: string;
  status?: string | null;
  createdAt?: string | null;
}

interface Testimonial {
  id: string;
  author: string;
  role?: string | null;
  company?: string | null;
  quote: string;
  approved?: boolean | null;
  avatarUrl?: string | null;
  createdAt?: string | null;
}

interface PricingPlan {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly?: number | null;
  features?: string[];
  ctaText?: string | null;
  isFeatured?: boolean | null;
}

export default function AdminDashboardPage() {
  const { isAuthenticated, loading: authLoading, logout } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'leads' | 'testimonials' | 'pricing'>('leads');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [openTestimonialModal, setOpenTestimonialModal] = useState(false);
  const [openPricingModal, setOpenPricingModal] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState({ author: '', role: '', company: '', quote: '' });
  const [newPlan, setNewPlan] = useState({ name: '', priceMonthly: '', priceYearly: '', features: '' });

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchLeads = async () => {
    setLoading(true);
    setError('');
    const res = await fetch(`/api/leads?page=${page}&pageSize=5`, {
      headers: { Authorization: token ? `Bearer ${token}` : '' }
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Failed to load leads.');
      setLeads([]);
    } else {
      const data: { items: Lead[]; total: number } = await res.json();
      setLeads(data.items || []);
      setTotal(data.total || 0);
    }
    setLoading(false);
  };

  const fetchTestimonials = async () => {
    setLoading(true);
    setError('');
    const res = await fetch('/api/testimonials', {
      headers: { Authorization: token ? `Bearer ${token}` : '' }
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Failed to load testimonials.');
      setTestimonials([]);
    } else {
      const data: { items: Testimonial[] } = await res.json();
      setTestimonials(data.items || []);
    }
    setLoading(false);
  };

  const fetchPricing = async () => {
    setLoading(true);
    setError('');
    const res = await fetch('/api/pricing', {
      headers: { Authorization: token ? `Bearer ${token}` : '' }
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Failed to load pricing.');
      setPlans([]);
    } else {
      const data: { items: PricingPlan[] } = await res.json();
      setPlans(data.items || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    if (activeTab === 'leads') fetchLeads();
    if (activeTab === 'testimonials') fetchTestimonials();
    if (activeTab === 'pricing') fetchPricing();
  }, [activeTab, page, isAuthenticated]);

  const handleCreateTestimonial = async () => {
    const res = await fetch('/api/testimonials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify({
        author: newTestimonial.author,
        role: newTestimonial.role || undefined,
        company: newTestimonial.company || undefined,
        quote: newTestimonial.quote,
        approved: true
      })
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast(data.error || 'Failed to create testimonial.', 'error');
      return;
    }

    toast('Testimonial created.', 'success');
    setOpenTestimonialModal(false);
    setNewTestimonial({ author: '', role: '', company: '', quote: '' });
    fetchTestimonials();
  };

  const handleCreatePlan = async () => {
    const features = newPlan.features
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    const res = await fetch('/api/pricing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify({
        name: newPlan.name,
        priceMonthly: Number(newPlan.priceMonthly),
        priceYearly: newPlan.priceYearly ? Number(newPlan.priceYearly) : undefined,
        features,
        isFeatured: false
      })
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast(data.error || 'Failed to create plan.', 'error');
      return;
    }

    toast('Pricing plan created.', 'success');
    setOpenPricingModal(false);
    setNewPlan({ name: '', priceMonthly: '', priceYearly: '', features: '' });
    fetchPricing();
  };

  const handleDeleteTestimonial = async (id: string) => {
    const res = await fetch(`/api/testimonials/${id}`, {
      method: 'DELETE',
      headers: { Authorization: token ? `Bearer ${token}` : '' }
    });
    if (!res.ok) {
      toast('Failed to delete testimonial.', 'error');
      return;
    }
    toast('Testimonial removed.', 'success');
    fetchTestimonials();
  };

  const handleDeletePlan = async (id: string) => {
    const res = await fetch(`/api/pricing/${id}`, {
      method: 'DELETE',
      headers: { Authorization: token ? `Bearer ${token}` : '' }
    });
    if (!res.ok) {
      toast('Failed to delete plan.', 'error');
      return;
    }
    toast('Pricing plan removed.', 'success');
    fetchPricing();
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="px-6 py-12">
        <Card className="mx-auto max-w-lg">
          <CardContent className="space-y-3 text-center">
            <h1 className="text-2xl font-semibold">Admin access required</h1>
            <p className="text-secondary">Please sign in to access the dashboard.</p>
            <Button asChild>
              <a href="/admin/login">Go to login</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-6 py-12">
      <section className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Admin dashboard</h1>
            <p className="text-secondary">Manage leads, testimonials, and pricing.</p>
          </div>
          <Button variant="outline" onClick={logout}>Log out</Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {['leads', 'testimonials', 'pricing'].map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? 'primary' : 'outline'}
              onClick={() => setActiveTab(tab as typeof activeTab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          ))}
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
        ) : activeTab === 'leads' ? (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Leads</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              {leads.length === 0 ? (
                <p className="text-secondary">No leads found.</p>
              ) : (
                leads.map((lead) => (
                  <div key={lead.id} className="border border-border rounded-lg p-4 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold">{lead.name}</p>
                        <p className="text-sm text-secondary">{lead.email}</p>
                        {lead.company && <p className="text-xs text-secondary">{lead.company}</p>}
                      </div>
                      <Badge variant="secondary">{lead.status || 'new'}</Badge>
                    </div>
                    <p className="text-sm text-secondary">{lead.message}</p>
                    <p className="text-xs text-secondary">
                      {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                ))
              )}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                >
                  Previous
                </Button>
                <span className="text-sm text-secondary">Page {page} • {total} leads</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : activeTab === 'testimonials' ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-xl font-semibold">Testimonials</h2>
              <Button size="sm" onClick={() => setOpenTestimonialModal(true)}>Add</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {testimonials.length === 0 ? (
                <p className="text-secondary">No testimonials yet.</p>
              ) : (
                testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="border border-border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{testimonial.author}</p>
                        <p className="text-xs text-secondary">
                          {testimonial.role || 'Customer'}{testimonial.company ? `, ${testimonial.company}` : ''}
                        </p>
                      </div>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteTestimonial(testimonial.id)}>
                        Delete
                      </Button>
                    </div>
                    <p className="text-sm text-secondary">“{testimonial.quote}”</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-xl font-semibold">Pricing plans</h2>
              <Button size="sm" onClick={() => setOpenPricingModal(true)}>Add</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {plans.length === 0 ? (
                <p className="text-secondary">No pricing plans yet.</p>
              ) : (
                plans.map((plan) => (
                  <div key={plan.id} className="border border-border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{plan.name}</p>
                      <Button size="sm" variant="destructive" onClick={() => handleDeletePlan(plan.id)}>
                        Delete
                      </Button>
                    </div>
                    <p className="text-sm text-secondary">${plan.priceMonthly}/mo</p>
                    <div className="flex flex-wrap gap-2 text-xs text-secondary">
                      {(plan.features || []).map((feature, index) => (
                        <span key={`${plan.id}-${index}`}>• {feature}</span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}
      </section>

      <Modal open={openTestimonialModal} onClose={() => setOpenTestimonialModal(false)} title="Add testimonial">
        <div className="space-y-3">
          <Input
            label="Author"
            value={newTestimonial.author}
            onChange={(event) => setNewTestimonial((prev) => ({ ...prev, author: event.target.value }))}
          />
          <Input
            label="Role"
            value={newTestimonial.role}
            onChange={(event) => setNewTestimonial((prev) => ({ ...prev, role: event.target.value }))}
          />
          <Input
            label="Company"
            value={newTestimonial.company}
            onChange={(event) => setNewTestimonial((prev) => ({ ...prev, company: event.target.value }))}
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-foreground">Quote</label>
            <textarea
              className="w-full rounded-md border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              rows={4}
              value={newTestimonial.quote}
              onChange={(event) => setNewTestimonial((prev) => ({ ...prev, quote: event.target.value }))}
            />
          </div>
          <Button fullWidth onClick={handleCreateTestimonial}>Create testimonial</Button>
        </div>
      </Modal>

      <Modal open={openPricingModal} onClose={() => setOpenPricingModal(false)} title="Add pricing plan">
        <div className="space-y-3">
          <Input
            label="Plan name"
            value={newPlan.name}
            onChange={(event) => setNewPlan((prev) => ({ ...prev, name: event.target.value }))}
          />
          <Input
            label="Monthly price"
            type="number"
            value={newPlan.priceMonthly}
            onChange={(event) => setNewPlan((prev) => ({ ...prev, priceMonthly: event.target.value }))}
          />
          <Input
            label="Yearly price"
            type="number"
            value={newPlan.priceYearly}
            onChange={(event) => setNewPlan((prev) => ({ ...prev, priceYearly: event.target.value }))}
          />
          <Input
            label="Features (comma separated)"
            value={newPlan.features}
            onChange={(event) => setNewPlan((prev) => ({ ...prev, features: event.target.value }))}
          />
          <Button fullWidth onClick={handleCreatePlan}>Create plan</Button>
        </div>
      </Modal>
    </div>
  );
}
