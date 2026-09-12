import { AboutSection } from "@/components/landing/AboutSection";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { ContactSection } from "@/components/landing/ContactSection";
import { DashboardPreviewSection } from "@/components/landing/DashboardPreviewSection";
import { Footer } from "@/components/landing/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { ServicesSection } from "@/components/landing/ServicesSection";

export function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <HowItWorksSection />
      <DashboardPreviewSection />
      <BenefitsSection />
      <ContactSection />
      <Footer />
    </>
  );
}
