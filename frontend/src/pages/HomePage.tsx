import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { AboutSection } from "@/components/landing/AboutSection";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { ContactSection } from "@/components/landing/ContactSection";
import { DashboardPreviewSection } from "@/components/landing/DashboardPreviewSection";
import { Footer } from "@/components/landing/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { ServicesSection } from "@/components/landing/ServicesSection";
import { scrollToId } from "@/lib/scroll";

export function HomePage() {
  const { hash } = useLocation();
  const [servicoEscolhido, setServicoEscolhido] = useState<{ servico: string; vez: number } | null>(null);

  // Links como "/#contato" vindos de outras paginas rolam ate a secao.
  useEffect(() => {
    if (!hash) return;
    const t = setTimeout(() => scrollToId(hash.slice(1)), 50);
    return () => clearTimeout(t);
  }, [hash]);

  return (
    <>
      <HeroSection />
      <AboutSection />
      <ServicesSection
        onSolicitar={(servico) => {
          setServicoEscolhido({ servico, vez: Date.now() });
          scrollToId("contato");
        }}
      />
      <HowItWorksSection />
      <DashboardPreviewSection />
      <BenefitsSection />
      <ContactSection servicoEscolhido={servicoEscolhido} />
      <Footer />
    </>
  );
}
