import { FICTIONAL_PARTNERSHIPS_NOTICE } from '@mobility/shared';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mobility Platform',
  description: 'Plateforme de mobilité internationale (projet pédagogique : partenariats fictifs)',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        {children}
        <footer className="mx-auto max-w-2xl px-4 py-6">
          <p>{FICTIONAL_PARTNERSHIPS_NOTICE}</p>
        </footer>
      </body>
    </html>
  );
}
