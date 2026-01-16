
// WebAuthn Biometric Service
// Handles Face ID / Touch ID / Windows Hello integration

function bufferToBase64(buffer: ArrayBuffer): string {
  const binary = String.fromCharCode(...new Uint8Array(buffer));
  return window.btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export const biometricService = {
  // Check availability
  isAvailable: async (): Promise<boolean> => {
    try {
      if (window.PublicKeyCredential &&
          PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
        return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      }
    } catch (e) {
      console.debug("Biometric check failed (likely restricted context):", e);
    }
    return false;
  },

  // Register New Biometric Credential
  register: async (userId: string, userName: string): Promise<string | null> => {
    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: "Glyph Circle",
          id: window.location.hostname,
        },
        user: {
          id: Uint8Array.from(userId, c => c.charCodeAt(0)),
          name: userName,
          displayName: userName,
        },
        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
        authenticatorSelection: {
          authenticatorAttachment: "platform", // Forces TouchID/FaceID
          userVerification: "required",
        },
        timeout: 60000,
        attestation: "none"
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      }) as PublicKeyCredential;

      if (credential) {
        return bufferToBase64(credential.rawId);
      }
      return null;
    } catch (err) {
      console.warn("Biometric Registration Failed (Simulation Fallback may apply):", err);
      throw err;
    }
  },

  // Verify Existing Biometric Credential
  verify: async (credentialIdBase64?: string): Promise<boolean> => {
    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        timeout: 60000,
        userVerification: "required",
        // If we have a specific ID, we can target it, otherwise allow list
        allowCredentials: credentialIdBase64 ? [{
          id: base64ToBuffer(credentialIdBase64),
          type: "public-key",
          transports: ["internal"]
        }] : undefined
      };

      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
      }) as PublicKeyCredential;

      // In a real app, verify signature on server. 
      // For client-only demo, presence of assertion implies local auth success.
      return !!assertion;
    } catch (err) {
      // Don't error aggressively, as this triggers the simulation fallback in Login.tsx
      console.debug("Biometric Verification unavailable:", err);
      throw err;
    }
  }
};
