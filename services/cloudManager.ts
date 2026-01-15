
import { sqliteService } from './sqliteService';

export interface CloudProvider {
  id: string;
  provider: 'Google Drive' | 'Dropbox' | 'AWS S3' | 'Firebase Storage';
  name: string;
  api_key?: string;
  secret?: string;
  folder_id?: string;
  bucket_name?: string;
  region?: string;
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
        if (!provider.api_key || provider.api_key.length < 5) {
          resolve({ success: false, message: "Invalid API Key format" });
        } else {
          resolve({ success: true, message: `Successfully connected to ${provider.provider}. Found 245 objects.` });
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
   * In a real FastAPI app, this would return `https://api.glyphcircle.com/images/${imageId}`.
   * Here, we simulate the result URL based on the active provider.
   */
  getProxyImageUrl(imageId: string | number, fallbackUrl: string): string {
    const active = this.getActiveProvider();
    
    if (!active) return fallbackUrl;

    // Simulate different URL structures per provider
    if (active.provider === 'Google Drive') {
        // Use a placeholder visual to prove the switch worked in UI
        return `https://via.placeholder.com/600x400/22c55e/ffffff?text=GDrive:${active.folder_id?.substring(0,5)}..._${imageId}`; 
    }
    if (active.provider === 'Dropbox') {
        return `https://via.placeholder.com/600x400/3b82f6/ffffff?text=Dropbox:${active.folder_id}_${imageId}`;
    }
    if (active.provider === 'AWS S3') {
        return `https://via.placeholder.com/600x400/f59e0b/000000?text=S3:${active.bucket_name}_${imageId}`;
    }

    return fallbackUrl;
  }
}

export const cloudManager = new CloudManager();
