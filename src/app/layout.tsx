import './globals.css';
import { AuthProvider } from '@/providers/AuthProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import Navigation from '@/components/layout/Navigation';

export const metadata = {
  title: 'Modern SaaS Marketing',
  description: 'Clean blue-and-white SaaS landing with pricing, testimonials, and contact.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ToastProvider>
            <Navigation />
            <main className="min-h-screen bg-background text-foreground">{children}</main>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
