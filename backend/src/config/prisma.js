import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../generated/prisma/client.js";
import env from "./env.js";

const adapter = new PrismaMariaDb({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.name,
  connectionLimit: 5,
  // MySQL 8 (o banco das hospedagens) usa caching_sha2_password; sem SSL, o
  // driver precisa buscar a chave publica do servidor para fazer o login.
  allowPublicKeyRetrieval: true,
});

const prisma = new PrismaClient({ adapter });

export { prisma };
