import { z } from "zod";

export const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MS", "MT", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

export const uuid = (campo) => z.string({ required_error: `Informe ${campo}.` }).uuid(`${campo} inválido.`);

/** Número opcional: aceita "", null ou ausente como "sem valor". */
export const numeroOpcional = (schema) =>
  z.preprocess((v) => (v === "" || v === undefined ? undefined : v), schema.nullable().optional());

export const textoOpcional = (max) =>
  z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? null : v), z.string().trim().max(max).nullable().optional());

