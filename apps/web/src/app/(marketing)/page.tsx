import type { Metadata } from 'next';
import { Hero } from '@/components/landing/Hero';
import { AnimatedStats } from '@/components/landing/AnimatedStats';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { FeaturesGrid } from '@/components/landing/FeaturesGrid';
import { InteractiveDemo } from '@/components/landing/InteractiveDemo';
import { AccessibilitySection } from '@/components/landing/AccessibilitySection';
import { MerchantCollabSection } from '@/components/landing/MerchantCollabSection';
import { Testimonials } from '@/components/landing/Testimonials';
import { Footer } from '@/components/landing/Footer';
import { Navbar } from '@/components/shared/Navbar';

export const metadata: Metadata = {
  title: 'Yaharika Mart — One Neighborhood. Many Stores. Zero Lost Sales.',
  description:
    'Yaharika Mart is a collaborative neighborhood commerce platform where merchants cooperate — sharing stock, absorbing demand spikes, and serving customers together.',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar transparent />
      <main id="main-content">
        <Hero />
        <AnimatedStats />
        <InteractiveDemo />
        <HowItWorks />
        <FeaturesGrid />
        <AccessibilitySection />
        <MerchantCollabSection />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
