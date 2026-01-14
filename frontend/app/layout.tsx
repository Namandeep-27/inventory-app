import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';
import { UserRoleProvider } from '@/contexts/UserRoleContext';
import { StatsProvider } from '@/contexts/StatsContext';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'Phone Inventory System',
  description: 'Phone-based inventory and location tracking',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <UserRoleProvider>
          <StatsProvider>
            <div className="min-h-screen bg-slate-50">
              <Navigation />
              <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                {children}
              </main>
            </div>
            <Toaster
            position="top-center"
            toastOptions={{
              className: 'rounded-xl shadow-xl border border-slate-200',
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
                style: {
                  background: '#fff',
                  color: '#1e293b',
                  border: '2px solid #10b981',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
                style: {
                  background: '#fff',
                  color: '#1e293b',
                  border: '2px solid #ef4444',
                },
              },
              style: {
                background: '#fff',
                color: '#1e293b',
                fontSize: '14px',
                fontWeight: '500',
                padding: '16px',
              },
            }}
          />
          </StatsProvider>
        </UserRoleProvider>
      </body>
    </html>
  );
}
