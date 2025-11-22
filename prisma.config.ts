// This configuration file is required because the Prisma CLI is locating it.
// It explicitly references the DATABASE_URL from the .env file.
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  // Point to the schema file
  schema: "prisma/schema.prisma",

  // Explicitly define the datasource URL using the environment variable (which you set in .env)
  datasource: {
    url: env("DATABASE_URL"),
  },
});