import { MarketingNav } from './MarketingNav';
import { Hero } from './Hero';
import { AgentsGrid } from './AgentsGrid';
import { HowItWorks } from './HowItWorks';
import { Stats } from './Stats';
import { Pricing } from './Pricing';
import { FinalCta } from './FinalCta';
import { MarketingFooter } from './MarketingFooter';

export function MarketingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />
      <main className="flex-1">
        <Hero />
        <AgentsGrid />
        <HowItWorks />
        <Stats />
        <Pricing />
        <FinalCta />
      </main>
      <MarketingFooter />
    </div>
  );
}
