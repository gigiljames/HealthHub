import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_AUTH_CLIENT_ID);

export async function verifyGoogleIdToken(idToken: string) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_AUTH_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return payload;
}
