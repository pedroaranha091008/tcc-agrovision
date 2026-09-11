import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { AuthProvider } from "@/features/auth/AuthContext";

/** Renderiza um componente com o roteador e o contexto de autenticacao, como em produção. */
export function renderWithProviders(ui: ReactElement, { rota = "/" }: { rota?: string } = {}) {
  return render(
    <MemoryRouter initialEntries={[rota]}>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>,
  );
}
