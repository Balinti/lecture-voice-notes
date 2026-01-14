// Environment variable helpers with graceful fallbacks

export const ENV = {
  // Supabase
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,

  // Stripe
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  stripeExamPackPriceId: process.env.NEXT_PUBLIC_STRIPE_EXAM_PACK_PRICE_ID,

  // OpenAI
  openaiApiKey: process.env.OPENAI_API_KEY,

  // App
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://lecture-voice-notes.vercel.app',
  databaseUrl: process.env.DATABASE_URL,
};

export function isSupabaseConfigured(): boolean {
  return !!(ENV.supabaseUrl && ENV.supabaseAnonKey);
}

export function isStripeConfigured(): boolean {
  return !!(ENV.stripeSecretKey && ENV.stripePublishableKey);
}

export function isExamPackEnabled(): boolean {
  return isStripeConfigured() && !!ENV.stripeExamPackPriceId;
}

export function isOpenAIConfigured(): boolean {
  return !!ENV.openaiApiKey;
}

export function getAppUrl(): string {
  return ENV.appUrl;
}
