import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (stripeInstance) return stripeInstance;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return null;
  }

  stripeInstance = new Stripe(secretKey, {
    apiVersion: '2025-12-15.clover',
    typescript: true,
  });

  return stripeInstance;
}

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY && !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
}

export function hasExamPackPrice(): boolean {
  return !!process.env.NEXT_PUBLIC_STRIPE_EXAM_PACK_PRICE_ID;
}

export function getExamPackPriceId(): string | undefined {
  return process.env.NEXT_PUBLIC_STRIPE_EXAM_PACK_PRICE_ID;
}
