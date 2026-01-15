
import { sqliteService } from './sqliteService';

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
  
  // --- ADMIN ACTIONS ---

  getAllProviders(): CloudProvider[] {
    return sqliteService.getAll('cloud_providers');
  }

  saveProvider(provider: Omit<CloudProvider, 'id' | 'status'> & { id?: string }) {
    const data = { ...provider, status: 'active' };
    
    if (provider.is_active) {
      // Deactivate all others first to ensure only one is active
      const all = this.getAllProviders();
      all.forEach(p => {
        if (p.id !== provider.id) {
          sqliteService.update('cloud_providers', p.id, { is_active: false });
        }
      });
    }

    if (provider.id) {
      sqliteService.update('cloud_providers', provider.id, data);
    } else {
      sqliteService.insert('cloud_providers', { ...data, id: `cp_${Date.now()}` });
    }
  }

  deleteProvider(id: string) {
    sqliteService.update('cloud_providers', id, { status: 'inactive' }); // Soft delete
  }

  activateProvider(id: string) {
    const all = this.getAllProviders();
    all.forEach(p => {
      sqliteService.update('cloud_providers', p.id, { is_active: p.id === id });
    });
  }

  testConnection(provider: Partial<CloudProvider>): Promise<{ success: boolean; message: string }> {
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

  getActiveProvider(): CloudProvider | null {
    const all = this.getAllProviders();
    return all.find(p => p.is_active && p.status === 'active') || null;
  }

  /**
   * Generates a proxy URL for an image.
   * If a fallback URL is provided, it attempts to optimize it.
   * If an ID is provided, it constructs the URL using the Active Provider.
   */
  getProxyImageUrl(imageId: string | number, fallbackUrl: string): string {
    // If the imageId is actually a URL (often happens in data migration), resolve it directly
    if (String(imageId).startsWith('http')) {
        return this.resolveImage(String(imageId));
    }

    // Otherwise, try to construct from active provider
    const active = this.getActiveProvider();
    
    if (active) {
        // Dynamic Construction based on Provider Type
        switch (active.provider) {
            case 'AWS S3':
                return `https://${active.bucket_name}.s3.${active.region || 'us-east-1'}.amazonaws.com/${imageId}`;
            
            case 'Firebase Storage':
                return `https://firebasestorage.googleapis.com/v0/b/${active.bucket_name}/o/${encodeURIComponent(String(imageId))}?alt=media`;
            
            case 'Cloudinary':
                return `https://res.cloudinary.com/${active.cloud_name}/image/upload/${imageId}`;
            
            case 'Google Drive':
                // For GDrive, we usually expect the full ID passed as the imageId
                // If imageId is a filename like 'tarot.png', this won't work without a lookup table.
                // Assuming here imageId IS the GDrive File ID.
                return `https://lh3.googleusercontent.com/d/${imageId}`;
            
            case 'Generic':
                return `${active.base_url}/${imageId}`;
        }
    }

    // Fallback to the raw URL if construction failed or no provider active
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
