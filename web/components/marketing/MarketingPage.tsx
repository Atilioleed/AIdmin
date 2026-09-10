import { MarketingNav } from './MarketingNav';
import { Hero } from './Hero';
import { WhatIsAidmin } from './WhatIsAidmin';
import { AgentsGrid } from './AgentsGrid';
import { HowItWorks } from './HowItWorks';
import { Stats } from './Stats';
import { Pricing } from './Pricing';
import { Faq } from './Faq';
import { AboutUs } from './AboutUs';
import { FinalCta } from './FinalCta';
import { MarketingFooter } from './MarketingFooter';
import { MobileStickyCta } from './MobileStickyCta';
import { MarketingStructuredData } from './StructuredData';

export function MarketingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingStructuredData />
      <MarketingNav />
      <main className="flex-1 pb-20 md:pb-0">
        <Hero />
        <WhatIsAidmin />
        <AgentsGrid />
        <HowItWorks />
        <Stats />
        <Pricing />
        <Faq />
        <AboutUs />
        <FinalCta />
      </main>
      <MarketingFooter />
      <MobileStickyCta />
    </div>
  );
}
