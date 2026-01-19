/**
 * Application constants - centralized configuration values
 */

// Storage
export const STORAGE_KEY = 'citedeck_local_data';

// Limits
export const MAX_ANONYMOUS_REGENERATIONS = 3;
export const MIN_TEXT_LENGTH = 10;
export const DEFAULT_CARD_COUNT = 10;
export const MAX_CARD_COUNT = 20;
export const MIN_PASSWORD_LENGTH = 6;

// Pricing
export const EXAM_PACK_PRICE = 4.99;
export const EXAM_PACK_PRICE_DISPLAY = '$4.99';

// UI
export const SKELETON_ANIMATION_DURATION = '1.5s';
export const MODAL_Z_INDEX = 50;
export const HEADER_Z_INDEX = 40;

// API
export const MAX_TEXT_LENGTH = 15000;
export const API_TIMEOUT_MS = 30000;

// Accessibility
export const KEYBOARD_KEYS = {
  ESCAPE: 'Escape',
  ENTER: 'Enter',
  SPACE: ' ',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  TAB: 'Tab',
} as const;
