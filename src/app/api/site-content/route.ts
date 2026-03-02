import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

const SiteContentSchema = z.object({
  heroTitle: z.string().optional(),
  heroSubtitle: z.string().optional(),
  heroCtaText: z.string().optional(),
  heroImageUrl: z.string().url().optional(),
  colorPrimary: z.string().optional()
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

export async function GET(_request: NextRequest) {
  try {
    const content = await db.siteContent.findFirst();
    return NextResponse.json({ success: true, data: content || {} });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch site content' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = SiteContentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });
    }

    const existing = await db.siteContent.findFirst();

    if (existing) {
      const updated = await db.siteContent.update({
        where: { id: existing.id },
        data: parsed.data
      });
      return NextResponse.json({ success: true, data: updated });
    }

    const created = await db.siteContent.create({ data: parsed.data });
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to update site content' }, { status: 500 });
  }
}
