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

const MOCK_DATABASE: MockDatabase = {
  users: [
    { id: 1, name: 'rocky', role: 'admin', status: 'active', email: 'rocky@glyph.co' },
    { id: 2, name: 'Minti', role: 'admin', status: 'active', email: 'minti@glyph.co' },
    { id: 3, name: 'Test User', role: 'user', status: 'inactive', email: 'test@example.com' },
    { id: 4, name: 'Jane Doe', role: 'user', status: 'active', email: 'jane.d@example.com' },
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
    { id: 'chart_kundali_default', path: '/img/kundali.png', caption: 'Sample Kundali Chart', status: 'active' },
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
    const storedDb = sessionStorage.getItem(DB_SESSION_KEY);
    if (storedDb) {
      return JSON.parse(storedDb);
    } else {
      const dbCopy = JSON.parse(JSON.stringify(MOCK_DATABASE));
      sessionStorage.setItem(DB_SESSION_KEY, JSON.stringify(dbCopy));
      return dbCopy;
    }
  } catch (error) {
    console.error("Failed to read mock DB from sessionStorage:", error);
    return JSON.parse(JSON.stringify(MOCK_DATABASE));
  }
};

export const setMockDb = (db: MockDatabase): void => {
  try {
    sessionStorage.setItem(DB_SESSION_KEY, JSON.stringify(db));
  } catch (error) {
    console.error("Failed to write mock DB to sessionStorage:", error);
  }
};