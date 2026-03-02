import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { hashPassword, signToken } from '@/lib/auth';

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RegisterSchema.safeParse(body);
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

    const token = signToken({ sub: user.id, role: user.role, email: user.email });

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
        token
      }
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Registration failed' }, { status: 500 });
  }
}
