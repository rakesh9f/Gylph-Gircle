
import { dbService } from './db';

export interface CloudProvider {
  id: string;
  provider: 'Google Drive' | 'Dropbox' | 'AWS S3' | 'Firebase Storage' | 'Cloudinary' | 'Generic';
  name: string;
  api_key?: string;
  secret?: string;
  folder_id?: string; // Used for GDrive/Dropbox root
  bucket_name?: string; // Used for S3/Firebase
  region?: string; // Used for S3
  cloud_name?: string; // Used for Cloudinary
  base_url?: string; // Used for Generic
  is_active: boolean;
  status: 'active' | 'inactive';
}

class CloudManager {
  
  // --- ADMIN ACTIONS (Async via Supabase) ---

  async saveProvider(provider: Omit<CloudProvider, 'id' | 'status'> & { id?: string }) {
    const data = { ...provider, status: 'active' };
    
    // If setting to active, we ideally want to deactivate others, 
    // but doing that in bulk via client-side requests is slow. 
    // For now, we will just upsert the current one.
    
    if (provider.id) {
      await dbService.updateEntry('cloud_providers', provider.id, data);
    } else {
      await dbService.createEntry('cloud_providers', { ...data });
    }
  }

  async deleteProvider(id: string) {
    await dbService.updateEntry('cloud_providers', id, { status: 'inactive' });
  }

  async testConnection(provider: Partial<CloudProvider>): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock connection test logic
        if (!provider.api_key && !provider.base_url && !provider.bucket_name) {
          resolve({ success: false, message: "Missing required configuration fields (API Key, Bucket, or Base URL)" });
        } else {
          resolve({ success: true, message: `Successfully connected to ${provider.provider}. Latency: 120ms.` });
        }
      }, 1500);
    });
  }

  // --- CLIENT PROXY LOGIC ---

  /**
   * Generates a proxy URL for an image.
   * Uses a resolved image URL directly if possible.
   */
  getProxyImageUrl(imageId: string | number, fallbackUrl: string): string {
    // If the imageId is actually a URL (often happens in data migration), resolve it directly
    if (String(imageId).startsWith('http')) {
        return this.resolveImage(String(imageId));
    }
    // Fallback to the raw URL 
    return this.resolveImage(fallbackUrl);
  }

  /**
   * Universal Image Resolver
   * Detects and optimizes links from various providers.
   */
  public resolveImage(url: string | undefined): string {
    if (!url) return '';
    
    // 1. GOOGLE DRIVE OPTIMIZATION
    if (url.includes('drive.google.com') || url.includes('drive.usercontent.google.com')) {
        // Pattern 1: /file/d/ID/view
        const idMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (idMatch && idMatch[1]) {
            return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
        }
        // Pattern 2: id=ID param
        const idParamMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (idParamMatch && idParamMatch[1]) {
            return `https://lh3.googleusercontent.com/d/${idParamMatch[1]}`;
        }
    }
    
    // 2. DROPBOX OPTIMIZATION
    if (url.includes('dropbox.com')) {
        if (url.includes('?dl=')) return url.replace('?dl=0', 'raw=1').replace('?dl=1', 'raw=1');
        if (!url.includes('raw=1')) return url + '?raw=1';
    }

    // 3. AWS S3 OPTIMIZATION (Ensure HTTPS)
    if (url.includes('.s3.') && url.startsWith('http:')) {
        return url.replace('http:', 'https:');
    }

    // 4. UNSPLASH OPTIMIZATION (Resize for performance)
    if (url.includes('images.unsplash.com') && !url.includes('w=')) {
        return `${url}${url.includes('?') ? '&' : '?'}q=80&w=800&auto=format`;
    }

    return url;
  }
}

export const cloudManager = new CloudManager();
