import { OAuth2Client } from "google-auth-library";
import { env } from "../../config/envConfig";

const client = new OAuth2Client(env.GOOGLE_AUTH_CLIENT_ID);

export async function verifyGoogleIdToken(idToken: string) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: env.GOOGLE_AUTH_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return payload;
}
