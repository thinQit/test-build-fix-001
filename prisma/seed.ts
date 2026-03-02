import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10);

  const admin = await prisma.adminUser.create({
    data: {
      email: 'admin@saasblue.com',
      passwordHash,
      role: 'admin'
    }
  });

  await prisma.siteContent.create({
    data: {
      heroTitle: 'Launch your SaaS in days, not weeks',
      heroSubtitle: 'Modern blue-and-white marketing kit with pricing, testimonials, and lead capture.',
      heroCtaText: 'Get Started',
      heroImageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d',
      colorPrimary: '#3b82f6'
    }
  });

  await prisma.pricingPlan.create({
    data: {
      name: 'Starter',
      priceMonthly: 29,
      priceYearly: 290,
      features: JSON.stringify(['Basic analytics', 'Email support', 'Up to 3 team members']),
      ctaText: 'Start Free Trial',
      isFeatured: false
    }
  });

  await prisma.pricingPlan.create({
    data: {
      name: 'Growth',
      priceMonthly: 79,
      priceYearly: 790,
      features: JSON.stringify(['Advanced analytics', 'Priority support', 'Unlimited team members']),
      ctaText: 'Choose Growth',
      isFeatured: true
    }
  });

  await prisma.pricingPlan.create({
    data: {
      name: 'Enterprise',
      priceMonthly: 199,
      priceYearly: 1990,
      features: JSON.stringify(['Dedicated CSM', 'Custom integrations', 'SLA support']),
      ctaText: 'Talk to Sales',
      isFeatured: false
    }
  });

  await prisma.testimonial.create({
    data: {
      author: 'Jamie Rivera',
      role: 'VP Marketing',
      company: 'Cloudly',
      quote: 'We doubled conversions within a week of launching the new landing experience.',
      avatarUrl: 'https://i.pravatar.cc/150?img=12',
      approved: true
    }
  });

  await prisma.testimonial.create({
    data: {
      author: 'Priya Patel',
      role: 'Founder',
      company: 'Launchpad',
      quote: 'The admin dashboard makes updating pricing and testimonials effortless.',
      avatarUrl: 'https://i.pravatar.cc/150?img=32',
      approved: true
    }
  });

  await prisma.lead.create({
    data: {
      name: 'Taylor Brooks',
      email: 'taylor@example.com',
      company: 'Nimbus AI',
      message: 'Interested in an enterprise demo for our sales team.',
      source: 'contact-form',
      status: 'new'
    }
  });

  await prisma.lead.create({
    data: {
      name: 'Chris Yu',
      email: 'chris@example.com',
      company: 'Growthly',
      message: 'Can you share more about pricing for annual plans?',
      source: 'pricing-cta',
      status: 'contacted'
    }
  });

  console.log('Seed complete', { adminId: admin.id });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
