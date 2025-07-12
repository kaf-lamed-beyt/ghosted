import crypto from 'crypto';
import { CRY_KEY } from '../constants';

const passPhrase = Buffer.from(CRY_KEY!, 'hex');
const algorithm = 'aes-256-ecb';

/**
 *
 * @param value
 * @returns A base64 encoded string
 */
export const protector = (value: string) => {
  const secret_msg = Buffer.from(value!, 'utf-8');
  const cipher = crypto.createCipheriv(algorithm, passPhrase, '');
  const encrypted = Buffer.concat([cipher.update(secret_msg), cipher.final()]);
  return encrypted.toString('base64');
};

/**
 *
 * @param encryptedStr
 * @returns A decrypted string
 */
export const antagonist = (protectedValue: string) => {
  if (!protectedValue) return;

  try {
    const secret_msg = Buffer.from(protectedValue!, 'base64');
    const decipher = crypto.createDecipheriv(
      algorithm,
      passPhrase,
      null
    );
    if (secret_msg) {
      const decrypted = Buffer.concat([
        decipher.update(secret_msg),
        decipher?.final(),
      ]);

      return decrypted.toString('utf-8');
    }
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};
