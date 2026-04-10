// Ambient declarations for Razorpay browser SDK
// Loaded dynamically via script tag — not an npm import

interface RazorpayPrefill {
  name?: string;
  email?: string;
  contact?: string;
}

interface RazorpayTheme {
  color?: string;
}

interface RazorpayModal {
  ondismiss?: () => void;
  escape?: boolean;
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name?: string;
  description?: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: RazorpayPrefill;
  theme?: RazorpayTheme;
  modal?: RazorpayModal;
}

interface RazorpayInstance {
  open(): void;
}

interface RazorpayConstructor {
  new(options: RazorpayOptions): RazorpayInstance;
}

declare global {
  interface Window {
    Razorpay: RazorpayConstructor;
  }
}
