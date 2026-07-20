import crypto from "crypto";

// AES-256-GCM encryption for email-account credentials (tokens / passwords).
// Set EMAIL_ENCRYPTION_KEY in .env to a 64-char hex string (32 bytes):
//   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
const ALGO = "aes-256-gcm";

function getKey() {
  const hex = process.env.EMAIL_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error(
      "EMAIL_ENCRYPTION_KEY must be a 64-char hex string (32 bytes). Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    );
  }
  return Buffer.from(hex, "hex");
}

// Returns a single string: iv:authTag:ciphertext (all hex)
export function encrypt(plainText) {
  if (plainText == null || plainText === "") return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  const enc = Buffer.concat([cipher.update(String(plainText), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${enc.toString("hex")}`;
}

export function decrypt(payload) {
  if (!payload) return null;
  const [ivHex, tagHex, dataHex] = String(payload).split(":");
  if (!ivHex || !tagHex || !dataHex) return null;
  const decipher = crypto.createDecipheriv(ALGO, getKey(), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  const dec = Buffer.concat([decipher.update(Buffer.from(dataHex, "hex")), decipher.final()]);
  return dec.toString("utf8");
}

export default { encrypt, decrypt };