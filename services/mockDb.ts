
export type DbRecord = {
  id: number | string;
  status: 'active' | 'inactive';
  [key: string]: any;
};

export type DbTable = DbRecord[];

export interface MockDatabase {
  [tableName: string]: DbTable;
}

const DB_SESSION_KEY = 'glyph_circle_mock_db';

export const MOCK_DATABASE: MockDatabase = {
  users: [
    { 
      id: 1, 
      name: 'rocky', 
      role: 'admin', 
      status: 'active', 
      email: 'rocky@glyph.co', 
      biometric_id: null, 
      uses_biometrics: false 
    },
    { 
      id: 2, 
      name: 'Minti', 
      role: 'admin', 
      status: 'active', 
      email: 'minti@glyph.co', 
      biometric_id: null, 
      uses_biometrics: false 
    },
    { 
      id: 3, 
      name: 'Test User', 
      role: 'user', 
      status: 'inactive', 
      email: 'test@example.com', 
      biometric_id: null, 
      uses_biometrics: false 
    },
    { 
      id: 4, 
      name: 'Jane Doe', 
      role: 'user', 
      status: 'active', 
      email: 'jane.d@example.com', 
      biometric_id: null, 
      uses_biometrics: false 
    },
  ],
  cloud_providers: [
    { 
      id: 'gdrive_main', 
      provider: 'Google Drive', 
      name: 'Primary Rudraksha Drive', 
      api_key: 'AIzaSy...', 
      folder_id: '1A2B3C...', 
      is_active: true, 
      status: 'active' 
    },
    { 
      id: 'dropbox_backup', 
      provider: 'Dropbox', 
      name: 'Backup Assets', 
      api_key: 'db_key_123', 
      folder_id: '/glyph/assets', 
      is_active: false, 
      status: 'active' 
    },
    { 
      id: 's3_archive', 
      provider: 'AWS S3', 
      name: 'Cold Storage', 
      api_key: 'AKIA...', 
      secret: 'wJalr...', 
      folder_id: 'glyph-bucket-v1', 
      region: 'ap-south-1', 
      is_active: false, 
      status: 'active' 
    }
  ],
  payment_providers: [
    {
      id: 'razorpay_in',
      name: 'Razorpay India',
      provider_type: 'razorpay',
      is_active: true,
      api_key: 'rzp_test_1DP5mmOlF5G5ag',
      api_secret: 'secret_123',
      merchant_id: 'mid_rzp_001',
      currency: 'INR',
      country_codes: 'IN', // Comma separated ISO codes
      credentials_json: '{"theme_color": "#F59E0B"}',
      status: 'active'
    },
    {
      id: 'stripe_global',
      name: 'Stripe International',
      provider_type: 'stripe',
      is_active: true,
      api_key: 'pk_test_stripe_123',
      api_secret: 'sk_test_stripe_456',
      merchant_id: 'acct_stripe_001',
      currency: 'USD',
      country_codes: 'US,UK,EU,GLOBAL',
      credentials_json: '{}',
      status: 'active'
    },
    {
      id: 'paypal_backup',
      name: 'PayPal Standard',
      provider_type: 'paypal',
      is_active: false,
      api_key: 'client_id_paypal',
      api_secret: 'secret_paypal',
      merchant_id: 'merchant_paypal',
      currency: 'USD',
      country_codes: 'GLOBAL',
      credentials_json: '{}',
      status: 'active'
    }
  ],
  merchant_info: [
    {
      id: 1,
      paypal: "payments@mysticalglyph.com",
      upi: "mysticalglyph@paytm",
      card: "Glyph Circle Pvt Ltd",
      status: 'active'
    }
  ],
  services: [
    { 
      id: 'dream-analysis', 
      name: 'Dream Analysis', 
      description: 'Decode the symbols of your subconscious and find your lucky numbers.', 
      path: '/dream-analysis', 
      image: 'https://images.unsplash.com/photo-1519638399535-1b036603ac77?q=80&w=600', 
      status: 'active' 
    },
    { 
      id: 'face-reading', 
      name: 'Face Reading', 
      description: 'Discover what your facial features reveal about your personality.', 
      path: '/face-reading', 
      image: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?q=80&w=600', 
      status: 'active' 
    },
    { 
      id: 'palmistry', 
      name: 'Palmistry', 
      description: 'Read the lines on your hand to understand your character and future.', 
      path: '/palmistry', 
      image: 'https://images.unsplash.com/photo-1602213669352-70b8a3623271?q=80&w=600', 
      status: 'active' 
    },
    { 
      id: 'tarot', 
      name: 'Tarot', 
      description: 'Draw a card and gain insight into your past, present, and future.', 
      path: '/tarot', 
      image: 'https://images.unsplash.com/photo-1632057276939-2c70cb3f40f0?q=80&w=600', 
      status: 'active' 
    },
    { 
      id: 'astrology', 
      name: 'Astrology', 
      description: 'Explore your destiny written in the stars and planets.', 
      path: '/astrology', 
      image: 'https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?q=80&w=600', 
      status: 'active' 
    },
    { 
      id: 'numerology', 
      name: 'Numerology', 
      description: 'Uncover the secrets hidden in your name and birth date.', 
      path: '/numerology', 
      image: 'https://images.unsplash.com/photo-1635326444826-0032f9488395?q=80&w=600', 
      status: 'active' 
    },
    { 
      id: 'store', 
      name: 'Vedic Store', 
      description: 'Authentic Rudraksha, Yantras, and Gemstones for your spiritual path.', 
      path: '/store', 
      image: 'https://images.unsplash.com/photo-1615486511484-92e572499757?q=80&w=600', 
      status: 'active' 
    },
    { 
      id: 'matchmaking', 
      name: 'Vedic Matchmaking', 
      description: 'Check marital compatibility using the ancient Guna Milan system.', 
      path: '/matchmaking', 
      image: 'https://images.unsplash.com/photo-1516961642265-531546e84af2?q=80&w=600', 
      status: 'active' 
    },
    { 
      id: 'remedy', 
      name: 'Personal Guidance', 
      description: 'Get personalized remedies and guidance for your life challenges.', 
      path: '/remedy', 
      image: 'https://images.unsplash.com/photo-1606214309328-97277873a5a4?q=80&w=600', 
      status: 'active' 
    },
  ],
  user_subscriptions: [
    { id: 1, user_id: 3, plan: 'free', ads_enabled: true, status: 'inactive' },
    { id: 2, user_id: 4, plan: 'premium', ads_enabled: false, status: 'active' },
  ],
  reports: [
    { id: 1, user_id: 4, type: 'astrology', created_at: '2023-10-27T10:00:00Z', status: 'active' },
    { id: 2, user_id: 4, type: 'numerology', created_at: '2023-10-26T15:30:00Z', status: 'active' },
  ],
  content: [
    { id: 'home_snippet_1', key: 'vedic_intro', text: 'The Vedas are ancient texts that originated in India...', status: 'active'},
    { id: 'tarot_card_meaning_fool', key: 'The Fool', text: 'Represents new beginnings, innocence, and spontaneity.', status: 'active'},
  ],
  calculation_rules: [
    { id: 'numerology_lifepath', formula: 'sum(digits(dob))', description: 'Calculates Life Path Number', status: 'active' },
    { id: 'astrology_ascendant', formula: 'lookup(time, lat, lon)', description: 'Determines the ascendant sign', status: 'active' },
  ],
  payments: [
    { id: 'txn_123', user_id: 4, amount: 9.99, report_id: 1, created_at: '2023-10-27T09:59:00Z', status: 'active' },
    { id: 'txn_456', user_id: 4, amount: 19.99, store_order_id: 1, created_at: '2023-10-25T11:00:00Z', status: 'active' },
  ],
  image_assets: [
    { id: 'bg_home_1', path: '/img/bg1.jpg', caption: 'Ancient cosmic map', status: 'active' },
    { id: 'chart_kundali_default', path: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=1000&auto=format&fit=crop', caption: 'North Indian Kundali Chart', status: 'active' },
    { id: 'chart_numerology_default', path: 'https://images.unsplash.com/photo-1507842217121-9d597543eb56?q=80&w=1000&auto=format&fit=crop', caption: 'Numerology Geometry', status: 'active' },
    // LOGO ROTATION IMAGES
    { id: 'logo_1', path: 'https://images.unsplash.com/photo-1614730375494-071782d3843f?q=80&w=400', caption: 'Sacred Geometry', status: 'active', tags: ['login_logo'] },
    { id: 'logo_2', path: 'https://images.unsplash.com/photo-1603513492128-ba7bc9b3e143?q=80&w=400', caption: 'Golden Mandala', status: 'active', tags: ['login_logo'] },
    { id: 'logo_3', path: 'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=400', caption: 'Mystic Nebula', status: 'active', tags: ['login_logo'] },
  ],
  feedback: [
    { id: 1, user_id: 4, rating: 5, comment: 'Very insightful reading!', created_at: '2023-10-27T12:00:00Z', status: 'active' },
  ],
  email_templates: [
    { id: 'welcome_email', subject: 'Welcome to Glyph Circle!', body: 'Hello {{name}}, welcome...', status: 'active' },
    { id: 'report_delivery', subject: 'Your report is ready!', body: 'Hi {{name}}, find your report attached.', status: 'active' },
  ],
  config: [
      { id: 'app_title', key: 'title', value: 'Glyph Circle', status: 'active'},
      { id: 'ads_global_enabled', key: 'ads_global', value: 'true', status: 'active'},
  ],
  payment_config: [
    { id: 'pp_main', provider: 'PayPal', account_email: 'billing@glyph.co', creditor_name: 'Glyph Circle Mystical Arts', creditor_address: '123 Astral Plane, Cosmos', status: 'active' },
    { id: 'cc_main', provider: 'Stripe', merchant_id: 'acct_mock_123456789', creditor_name: 'Glyph Circle Mystical Arts', creditor_address: '123 Astral Plane, Cosmos', status: 'active' },
  ],
  featured_content: [
    { id: 1, title: 'A Message from the Sages', text: 'The stars whisper secrets to those who listen. Today, focus on balance and harmony in your relationships.', image_url: 'https://images.unsplash.com/photo-1474540412665-1cdae210ae6b?q=80&w=1920', status: 'active' },
    { id: 2, title: 'Test Message', text: 'This is an inactive test message.', image_url: '', status: 'inactive' }
  ],
  remedy_requests: [
      { id: 1, user_id: 4, concern: 'Career guidance', contact_time: '5pm-7pm IST', status: 'active'},
  ],
  advertisement_config: [
    { id: 'banner-top', placement: 'top', provider: 'AdMob', unit_id: 'ca-app-pub-1234/5678', status: 'active' },
    { id: 'banner-bottom', placement: 'bottom', provider: 'AdMob', unit_id: 'ca-app-pub-1234/9012', status: 'inactive' },
    { id: 'interstitial', placement: 'full-page', provider: 'Facebook', unit_id: 'fb-ad-unit-3456', status: 'active' },
  ],
  store_items: [
    { id: 101, name: 'Healing Crystal', category: 'Crystals', price: 25.00, stock: 50, status: 'active' },
    { id: 102, name: 'Vedic Astrology Book', category: 'Books', price: 40.00, stock: 20, status: 'active' },
    { id: 103, name: 'Protective Yantra', category: 'Yantras', price: 15.50, stock: 0, status: 'inactive' },
  ],
  store_categories: [
      { id: 1, name: 'Crystals', description: 'Natural stones for healing.', status: 'active' },
      { id: 2, name: 'Books', description: 'Wisdom from ancient texts.', status: 'active' },
      { id: 3, name: 'Yantras', description: 'Mystical diagrams for focus.', status: 'active' },
  ],
  store_discounts: [
      { id: 'DIWALI20', code: 'DIWALI20', type: 'percentage', value: 20, status: 'active'},
      { id: 'NEWUSER', code: 'NEWUSER', type: 'fixed', value: 5, status: 'inactive'},
  ],
  store_orders: [
      { id: 1, user_id: 4, item_ids: '[101, 102]', total: 65.00, created_at: '2023-10-25T10:55:00Z', status: 'active'},
  ],
};

export const getMockDb = (): MockDatabase => {
  try {
    const storedDbStr = sessionStorage.getItem(DB_SESSION_KEY);
    const storedDb = storedDbStr ? JSON.parse(storedDbStr) : {};
    
    const finalDb = { ...MOCK_DATABASE, ...storedDb };
    
    // Safety check for new tables introduced
    Object.keys(MOCK_DATABASE).forEach(key => {
        if (!finalDb[key] || (Array.isArray(finalDb[key]) && finalDb[key].length === 0)) {
            finalDb[key] = MOCK_DATABASE[key];
        }
    });

    return finalDb;
  } catch (error) {
    console.error("Failed to read mock DB from sessionStorage:", error);
    return JSON.parse(JSON.stringify(MOCK_DATABASE));
  }
};
