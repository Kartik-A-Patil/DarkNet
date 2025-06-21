import { saveConfig, getConfig } from './indexedDBHandler';

/**
 * Security module for handling encryption of file chunks
 */
export class SecurityModule {
  private readonly ENCRYPTION_KEY_CONFIG = 'encryptionMasterKey';
  private readonly IV_LENGTH = 12; // 12 bytes for GCM mode
  private encryptionKey: CryptoKey | null = null;
  
  /**
   * Initialize the security module, creating or retrieving encryption keys
   */
  async init(): Promise<boolean> {
    try {
      // Check if we have a stored master key
      const storedKey = await getConfig(this.ENCRYPTION_KEY_CONFIG);
      
      if (storedKey) {
        // Import the existing key
        this.encryptionKey = await window.crypto.subtle.importKey(
          'jwk',
          JSON.parse(storedKey),
          {
            name: 'AES-GCM',
            length: 256
          },
          true,
          ['encrypt', 'decrypt']
        );
      } else {
        // Generate a new key
        this.encryptionKey = await window.crypto.subtle.generateKey(
          {
            name: 'AES-GCM',
            length: 256
          },
          true,
          ['encrypt', 'decrypt']
        );
        
        // Export and store the key
        const exportedKey = await window.crypto.subtle.exportKey('jwk', this.encryptionKey);
        await saveConfig(this.ENCRYPTION_KEY_CONFIG, JSON.stringify(exportedKey));
      }
      
      return true;
    } catch (error) {
      console.error('Error initializing security module:', error);
      return false;
    }
  }
  
  /**
   * Encrypt file chunk data
   * @param data The raw chunk data to encrypt
   * @returns Object containing encrypted data and IV
   */
  async encryptChunk(data: ArrayBuffer): Promise<{ 
    encryptedData: ArrayBuffer; 
    iv: Uint8Array;
  }> {
    if (!this.encryptionKey) {
      await this.init();
    }
    
    // Generate a random initialization vector
    const iv = window.crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
    
    // Encrypt the data
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      this.encryptionKey!,
      data
    );
    
    return { encryptedData, iv };
  }
  
  /**
   * Decrypt file chunk data
   * @param encryptedData The encrypted chunk data
   * @param iv The initialization vector used for encryption
   * @returns The decrypted data
   */
  async decryptChunk(encryptedData: ArrayBuffer, iv: Uint8Array): Promise<ArrayBuffer> {
    if (!this.encryptionKey) {
      await this.init();
    }
    
    // Decrypt the data
    return window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv
      },
      this.encryptionKey!,
      encryptedData
    );
  }
  
  /**
   * Generate a SHA-256 hash of the data (used for chunk IDs)
   * @param data The data to hash
   * @returns The hex string representation of the hash
   */
  async generateHash(data: ArrayBuffer): Promise<string> {
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  /**
   * Combine IV and encrypted data for storage or transmission
   */
  combineIVAndData(iv: Uint8Array, encryptedData: ArrayBuffer): ArrayBuffer {
    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encryptedData), iv.length);
    return combined.buffer;
  }
  
  /**
   * Separate IV and encrypted data
   */
  separateIVAndData(combined: ArrayBuffer): { iv: Uint8Array; encryptedData: ArrayBuffer } {
    const iv = new Uint8Array(combined, 0, this.IV_LENGTH);
    const encryptedData = new ArrayBuffer(combined.byteLength - this.IV_LENGTH);
    new Uint8Array(encryptedData).set(
      new Uint8Array(combined, this.IV_LENGTH)
    );
    
    return { iv, encryptedData };
  }
}

// Export a singleton instance
export const securityModule = new SecurityModule();
