
// Security Utilities for Glyph Circle
// Implements AES-256 Encryption & Environment Integrity Checks

const ENCRYPTION_KEY_STORAGE = 'glyph_secure_key';

// 1. Jailbreak/Root Detection Simulation (Web Context)
export const checkSystemIntegrity = (): boolean => {
  // In a PWA/Web context, we check for secure context and automation tools
  const isSecureContext = window.isSecureContext;
  const isAutomation = navigator.webdriver;
  
  // Block if running in automation or insecure HTTP (except localhost)
  if (isAutomation) {
    console.warn("Security Alert: Automation detected.");
    return false;
  }
  
  if (!isSecureContext && window.location.hostname !== 'localhost') {
     console.warn("Security Alert: Insecure context.");
     return false;
  }

  return true;
};

// 2. Cryptography Utils
const getCryptoKey = async (): Promise<CryptoKey> => {
  let rawKey = localStorage.getItem(ENCRYPTION_KEY_STORAGE);
  
  if (!rawKey) {
    const key = await window.crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    const exported = await window.crypto.subtle.exportKey('jwk', key);
    localStorage.setItem(ENCRYPTION_KEY_STORAGE, JSON.stringify(exported));
    return key;
  }

  return window.crypto.subtle.importKey(
    'jwk',
    JSON.parse(rawKey),
    { name: 'AES-GCM' },
    true,
    ['encrypt', 'decrypt']
  );
};

export const encryptData = async (data: string): Promise<string> => {
  const key = await getCryptoKey();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encodedData = new TextEncoder().encode(data);

  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encodedData
  );

  const encryptedArray = Array.from(new Uint8Array(encrypted));
  const ivArray = Array.from(iv);
  
  return JSON.stringify({
    iv: ivArray,
    data: encryptedArray
  });
};

export const decryptData = async (cipherText: string): Promise<string | null> => {
  try {
    const { iv, data } = JSON.parse(cipherText);
    const key = await getCryptoKey();
    
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(iv) },
      key,
      new Uint8Array(data)
    );

    return new TextDecoder().decode(decrypted);
  } catch (e) {
    console.error("Decryption failed", e);
    return null;
  }
};
