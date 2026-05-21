
import type { Metadata } from 'next';
import { PublicLandingClient } from '@/components/public-landing-client';

export const metadata: Metadata = {
  title: 'XenonPlay - Game Center',
  description: 'Nongkrong Sultan, Harga Teman. Rental PS5 Premium dengan fasilitas lengkap.',
};

export default function PublicLandingPage() {
  return <PublicLandingClient />;
}
