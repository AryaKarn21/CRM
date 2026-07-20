import crypto from "crypto";

// Generates a readable temporary password like "Xk9m-Qw27" — random enough
// to be secure, short enough for a human to type in on first login.
export function generateTempPassword() {
  const part = () => crypto.randomBytes(3).toString("hex").slice(0, 4);
  return `${part()}-${part()}`.replace(/^[0-9]/, "A"); // avoid starting with a digit
}