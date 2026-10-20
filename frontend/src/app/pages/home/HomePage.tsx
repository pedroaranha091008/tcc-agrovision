import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { HeroSection } from "./HeroSection";
import { AboutSection } from "./AboutSection";
import { ServicesSection } from "./ServicesSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { DashboardPreviewSection } from "./DashboardPreviewSection";
import { BenefitsSection } from "./BenefitsSection";
import { ContactSection } from "./ContactSection";

export function HomePage() {
  const { hash } = useLocation();
  const [servicoEscolhido, setServicoEscolhido] = useState<{ servico: string; vez: number } | null>(null);

  // Links como "/#contato" vindos de outras páginas rolam até a seção.
  useEffect(() => {
    if (!hash) return;
    const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" }), 50);
    return () => clearTimeout(t);
  }, [hash]);

  return (
    <>
      <HeroSection />
      <AboutSection />
      <ServicesSection onSolicitar={servico => setServicoEscolhido({ servico, vez: Date.now() })} />
      <HowItWorksSection />
      <DashboardPreviewSection />
      <BenefitsSection />
      <ContactSection servicoEscolhido={servicoEscolhido} />
    </>
  );
}
