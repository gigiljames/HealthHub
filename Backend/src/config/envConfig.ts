import dotenv from "dotenv";
dotenv.config({ path: ".env" });
import { envSchema } from "../presentation/validators/envValidator";

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("**************ENV VALIDATION ERROR***************");
  parsedEnv.error.issues.forEach((issue) => {
    console.error(`${issue.message}`);
  });
  console.error("*************************************************");
  throw new Error("Invalid environment variables");
}

export const env = parsedEnv.data;
