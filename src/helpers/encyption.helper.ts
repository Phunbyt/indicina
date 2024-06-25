import * as crypto from 'crypto';

export const generateDataEncryptionKey = () => {
  return crypto.randomBytes(32); // Convert the DEK to a hexadecimal string
};

export const encryptDataEncryptionKey = (dek: Buffer, masterKey: string) => {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', dek, iv);

    let encryptedDek = cipher.update(masterKey);
    encryptedDek = Buffer.concat([encryptedDek, cipher.final()]);

    return {
      iv: iv.toString('hex'),
      encryptedDek: encryptedDek.toString('hex'),
    };
  } catch (error) {
    throw error;
  }
};

export const encryptData = (data: string, dek: string) => {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(dek), iv);

    let encryptedData = cipher.update(data, 'utf8', 'hex');
    encryptedData += cipher.final('hex');
    return {
      iv: iv.toString('hex'),
      encryptedData,
    };
  } catch (error) {
    throw error;
  }
};

export const decryptData = (encryptedData: string, dek: string, iv: string) => {
  try {
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(dek),
      Buffer.from(iv, 'hex'),
    );

    let decryptedData = decipher.update(encryptedData, 'hex', 'utf8');
    decryptedData += decipher.final('utf8');
    return decryptedData;
  } catch (error) {
    console.error('Decryption error decryptData:', error);
    throw error;
  }
};
