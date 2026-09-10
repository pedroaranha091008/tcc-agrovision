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
});

const prisma = new PrismaClient({ adapter });

export { prisma };
