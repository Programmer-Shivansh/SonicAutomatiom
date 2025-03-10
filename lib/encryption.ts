import crypto from 'crypto';
import "server-only";

// Use a consistent encryption key derived from environment variable
const getEncryptionKey = () => {
  const key = process.env.ENCRYPTION_KEY || 'default-encryption-key-for-development-only';
  // Create a key with the correct length (32 bytes for AES-256)
  return crypto.createHash('sha256').update(key).digest();
};

const algorithm = 'aes-256-cbc';

export function symmetricEncrypt(text: string): string {
  // Generate a random initialization vector
  const iv = crypto.randomBytes(16);
  const key = getEncryptionKey();
  
  // Create cipher with key and iv
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  
  // Encrypt the data
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Return iv + encrypted data as a single string
  // We'll need the IV for decryption later
  return iv.toString('hex') + ':' + encrypted;
}

export function symmetricDecrypt(encryptedText: string): string {
  // Split the IV from the encrypted text
  const parts = encryptedText.split(':');
  if (parts.length !== 2) {
    throw new Error('Invalid encrypted format');
  }
  
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const key = getEncryptionKey();
  
  // Create decipher
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  
  // Decrypt the data
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
