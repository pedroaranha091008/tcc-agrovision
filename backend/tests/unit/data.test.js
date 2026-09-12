import { describe, expect, it } from "vitest";
import { fimDoDia } from "../../src/utils/data.js";

describe("fimDoDia", () => {
  it("move meia-noite UTC para o ultimo instante do mesmo dia", () => {
    const r = fimDoDia("2026-02-01T00:00:00.000Z");
    expect(r.toISOString()).toBe("2026-02-01T23:59:59.999Z");
  });

  it("mantem o mesmo dia mesmo partindo de um horario intermediario", () => {
    const r = fimDoDia("2026-02-01T10:00:00.000Z");
    expect(r.toISOString()).toBe("2026-02-01T23:59:59.999Z");
  });
});
