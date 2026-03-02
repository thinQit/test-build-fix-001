import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

const PricingCreateSchema = z.object({
  name: z.string().min(1),
  priceMonthly: z.number(),
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

export async function GET(_request: NextRequest) {
  try {
    const items = await db.pricingPlan.findMany({ orderBy: { isFeatured: 'desc' } });
    return NextResponse.json({
      success: true,
      data: {
        items: items.map(serializePlan)
      }
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch pricing plans' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = PricingCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });
    }

    const pricing = await db.pricingPlan.create({
      data: {
        name: parsed.data.name,
        priceMonthly: parsed.data.priceMonthly,
        priceYearly: parsed.data.priceYearly,
        features: parsed.data.features ? JSON.stringify(parsed.data.features) : null,
        ctaText: parsed.data.ctaText,
        isFeatured: parsed.data.isFeatured ?? false
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: pricing.id,
        createdAt: pricing.createdAt.toISOString()
      }
    }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to create pricing plan' }, { status: 500 });
  }
}
