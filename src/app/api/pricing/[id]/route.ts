import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

const PricingUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  priceMonthly: z.number().optional(),
  priceYearly: z.number().optional(),
  features: z.array(z.string()).optional(),
  ctaText: z.string().optional(),
  isFeatured: z.boolean().optional()
});

async function requireAdmin(request: NextRequest) {
  const token = getTokenFromHeader(request.headers.get('Authorization'));
  if (!token) return null;
  try {
    const payload = verifyToken(token);
    const userId = typeof payload.sub === 'string' ? payload.sub : null;
    if (!userId) return null;
    const user = await db.adminUser.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'admin') return null;
    return user;
  } catch {
    return null;
  }
}

function serializePlan(plan: { id: string; name: string; priceMonthly: number; priceYearly: number | null; features: string | null; ctaText: string | null; isFeatured: boolean; createdAt: Date }) {
  return {
    ...plan,
    features: plan.features ? (JSON.parse(plan.features) as string[]) : [],
    createdAt: plan.createdAt.toISOString()
  };
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = PricingUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });
    }

    const updated = await db.pricingPlan.update({
      where: { id: params.id },
      data: {
        ...parsed.data,
        features: parsed.data.features ? JSON.stringify(parsed.data.features) : undefined
      }
    });

    return NextResponse.json({ success: true, data: serializePlan(updated) });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to update pricing plan' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await db.pricingPlan.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete pricing plan' }, { status: 500 });
  }
}
