import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

const TestimonialCreateSchema = z.object({
  author: z.string().min(1),
  role: z.string().optional(),
  company: z.string().optional(),
  quote: z.string().min(1),
  avatarUrl: z.string().url().optional(),
  approved: z.boolean().optional()
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

export async function GET(request: NextRequest) {
  try {
    const limitParam = request.nextUrl.searchParams.get('limit');
    const limit = limitParam ? Number(limitParam) : 10;
    const items = await db.testimonial.findMany({
      where: { approved: true },
      orderBy: { createdAt: 'desc' },
      take: Number.isFinite(limit) ? limit : 10
    });

    return NextResponse.json({
      success: true,
      data: {
        items: items.map((item) => ({
          ...item,
          createdAt: item.createdAt.toISOString()
        }))
      }
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch testimonials' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = TestimonialCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });
    }

    const testimonial = await db.testimonial.create({
      data: {
        author: parsed.data.author,
        role: parsed.data.role,
        company: parsed.data.company,
        quote: parsed.data.quote,
        avatarUrl: parsed.data.avatarUrl,
        approved: parsed.data.approved ?? false
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: testimonial.id,
        createdAt: testimonial.createdAt.toISOString()
      }
    }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to create testimonial' }, { status: 500 });
  }
}
