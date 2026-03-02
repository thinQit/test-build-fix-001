import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getTokenFromHeader, hashPassword, verifyToken } from '@/lib/auth';

const AdminUserCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.string().optional()
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
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const users = await db.adminUser.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({
      success: true,
      data: {
        items: users.map((user) => ({
          id: user.id,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt.toISOString()
        }))
      }
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch admin users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = AdminUserCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });
    }

    const existing = await db.adminUser.findUnique({ where: { email: parsed.data.email } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const user = await db.adminUser.create({
      data: {
        email: parsed.data.email,
        passwordHash,
        role: parsed.data.role || 'admin'
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt.toISOString()
      }
    }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to create admin user' }, { status: 500 });
  }
}
