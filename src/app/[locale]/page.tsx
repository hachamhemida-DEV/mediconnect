import { setRequestLocale } from 'next-intl/server';
import { Header }      from '@/components/layout/Header';
import { Footer }      from '@/components/layout/Footer';
import { Hero }        from '@/components/landing/Hero';
import { Problems }    from '@/components/landing/Problems';
import { Solutions }   from '@/components/landing/Solutions';
import { Features }    from '@/components/landing/Features';
import { Stats }       from '@/components/landing/Stats';
import { HowItWorks }  from '@/components/landing/HowItWorks';
import { WhyUs }       from '@/components/landing/WhyUs';
import { Pricing }     from '@/components/landing/Pricing';
import { CTA }         from '@/components/landing/CTA';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <Problems />
        <Solutions />
        <Features />
        <Stats />
        <HowItWorks />
        <WhyUs />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
