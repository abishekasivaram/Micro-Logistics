/**
 * imageUtils.js
 * Centralized utility for consistent, resilient image and logo resolution across
 * customer browsing, seller inventory, product details, cart, and orders.
 */

// Curated high-resolution category fallback images
export const CATEGORY_FALLBACK_IMAGES = {
  dairy: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80',
  bakery: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
  grains: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80',
  'fruits & veg': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&auto=format&fit=crop&q=80',
  'fruits & vegetables': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&auto=format&fit=crop&q=80',
  produce: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&auto=format&fit=crop&q=80',
  groceries: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
  grocery: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
  staples: 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=500&auto=format&fit=crop&q=80',
  snacks: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=80',
  beverages: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&auto=format&fit=crop&q=80',
  drinks: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&auto=format&fit=crop&q=80',
  'personal care': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
  pharmacy: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
  electronics: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=500&auto=format&fit=crop&q=80',
  general: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
};

// Vibrant color pairs and contextual icons for zero-latency, network-independent SVG placeholders
export const CATEGORY_THEMES = {
  dairy: { colors: ['#0284c7', '#38bdf8'], icon: '🥛', label: 'Dairy Product' },
  bakery: { colors: ['#d97706', '#f59e0b'], icon: '🍞', label: 'Bakery & Bread' },
  grains: { colors: ['#b45309', '#fcd34d'], icon: '🌾', label: 'Grains & Cereals' },
  'fruits & veg': { colors: ['#15803d', '#4ade80'], icon: '🥗', label: 'Fresh Produce' },
  'fruits & vegetables': { colors: ['#15803d', '#4ade80'], icon: '🥗', label: 'Fresh Produce' },
  produce: { colors: ['#15803d', '#4ade80'], icon: '🥦', label: 'Fresh Produce' },
  groceries: { colors: ['#059669', '#10b981'], icon: '🛒', label: 'Daily Groceries' },
  grocery: { colors: ['#059669', '#10b981'], icon: '🛒', label: 'Daily Groceries' },
  staples: { colors: ['#059669', '#34d399'], icon: '🌾', label: 'Kitchen Staples' },
  snacks: { colors: ['#ea580c', '#fb923c'], icon: '🍿', label: 'Snacks & Bites' },
  beverages: { colors: ['#0891b2', '#06b6d4'], icon: '🧃', label: 'Beverages' },
  drinks: { colors: ['#0891b2', '#06b6d4'], icon: '🧃', label: 'Beverages' },
  'personal care': { colors: ['#0d9488', '#2dd4bf'], icon: '🧴', label: 'Personal Care' },
  pharmacy: { colors: ['#dc2626', '#f87171'], icon: '💊', label: 'Health & Wellness' },
  electronics: { colors: ['#4f46e5', '#818cf8'], icon: '⚡', label: 'Electronics' },
  general: { colors: ['#475569', '#64748b'], icon: '📦', label: 'Essential Item' }
};

/**
 * Normalizes a category key string
 */
export function normalizeCategory(category) {
  if (!category || typeof category !== 'string') return 'general';
  const clean = category.trim().toLowerCase();
  if (CATEGORY_THEMES[clean]) return clean;
  if (clean.includes('fruit') || clean.includes('veg') || clean.includes('organic')) return 'fruits & veg';
  if (clean.includes('dairy') || clean.includes('milk') || clean.includes('cheese')) return 'dairy';
  if (clean.includes('bake') || clean.includes('bread') || clean.includes('cake') || clean.includes('sweet')) return 'bakery';
  if (clean.includes('grain') || clean.includes('rice') || clean.includes('flour')) return 'grains';
  if (clean.includes('snack') || clean.includes('biscuit') || clean.includes('samosa')) return 'snacks';
  if (clean.includes('drink') || clean.includes('juice') || clean.includes('bev')) return 'beverages';
  if (clean.includes('care') || clean.includes('health') || clean.includes('pharma')) return 'personal care';
  if (clean.includes('elec') || clean.includes('tech')) return 'electronics';
  if (clean.includes('groc') || clean.includes('mart')) return 'groceries';
  return 'general';
}

/**
 * Checks if a string looks like a valid image URL
 */
export function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return false;
  return (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('/')
  );
}

/**
 * Resolves a sensible category-specific fallback image URL
 */
export function getCategoryFallbackImage(category) {
  const norm = normalizeCategory(category);
  return CATEGORY_FALLBACK_IMAGES[norm] || CATEGORY_FALLBACK_IMAGES.general;
}

/**
 * Generates an instant, zero-latency vector SVG data URI for a product category.
 * Used when network is slow/offline or remote image fails to load.
 */
export function getCategoryPlaceholderSvg(category, productName = '') {
  const norm = normalizeCategory(category);
  const theme = CATEGORY_THEMES[norm] || CATEGORY_THEMES.general;
  const [c1, c2] = theme.colors;
  const label = productName ? productName.trim().slice(0, 24) : theme.label;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
    <defs>
      <linearGradient id="catGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${c1}" />
        <stop offset="100%" stop-color="${c2}" />
      </linearGradient>
    </defs>
    <rect width="400" height="300" rx="16" fill="url(#catGrad)" />
    <circle cx="200" cy="120" r="50" fill="rgba(255,255,255,0.22)" />
    <text x="200" y="138" text-anchor="middle" font-size="44">${theme.icon}</text>
    <text x="200" y="210" text-anchor="middle" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="700">${label}</text>
    <text x="200" y="235" text-anchor="middle" fill="rgba(255,255,255,0.85)" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="500">${theme.label}</text>
  </svg>`;

  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

/**
 * Resolves the primary image URL for any product record.
 * Preserves valid URLs; uses sensible category-specific fallback if missing.
 */
export function getProductImage(product) {
  if (product && isValidImageUrl(product.image)) {
    return product.image.trim();
  }
  if (product && isValidImageUrl(product.imageUrl)) {
    return product.imageUrl.trim();
  }
  return getCategoryFallbackImage(product?.category);
}

/**
 * Extracts 1-2 uppercase initials from a business or person name
 */
export function getInitials(name = 'Store') {
  if (!name || typeof name !== 'string') return 'ST';
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.trim().slice(0, 2).toUpperCase() || 'ST';
}

/**
 * Generates an instant, elegant vector SVG initials avatar for a vendor.
 * Guarantees zero broken icons, zero naked alt text, and beautiful storefront branding.
 */
export function getVendorInitialsSvg(name = 'Local Seller', category = 'General') {
  const initials = getInitials(name);
  const norm = normalizeCategory(category);
  const theme = CATEGORY_THEMES[norm] || CATEGORY_THEMES.general;
  const [c1, c2] = theme.colors;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
    <defs>
      <linearGradient id="vGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${c1}" />
        <stop offset="100%" stop-color="${c2}" />
      </linearGradient>
    </defs>
    <rect width="120" height="120" rx="24" fill="url(#vGrad)" />
    <circle cx="98" cy="22" r="12" fill="rgba(255,255,255,0.25)" />
    <text x="98" y="27" text-anchor="middle" font-size="11">🏪</text>
    <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="40" font-weight="800" letter-spacing="1">${initials}</text>
  </svg>`;

  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

/**
 * Resolves the logo for any vendor.
 * Returns valid logo if present, or a clean generated initials avatar if missing.
 */
export function getVendorLogo(vendor) {
  if (vendor && isValidImageUrl(vendor.logo)) {
    return vendor.logo.trim();
  }
  if (vendor && isValidImageUrl(vendor.logoUrl)) {
    return vendor.logoUrl.trim();
  }
  return getVendorInitialsSvg(vendor?.name || vendor?.shopName, vendor?.category);
}

/**
 * Safe image onError handler for products.
 * Prevents loops, avoids broken icons, and seamlessly swaps in a category fallback.
 */
export function handleProductImageError(e, category, productName) {
  e.currentTarget.onerror = null;
  const currentSrc = e.currentTarget.src || '';
  const fallbackRemote = getCategoryFallbackImage(category);

  // If the initial failure wasn't the remote category fallback, try that first
  if (fallbackRemote && !currentSrc.includes(fallbackRemote)) {
    e.currentTarget.onerror = () => {
      e.currentTarget.onerror = null;
      e.currentTarget.src = getCategoryPlaceholderSvg(category, productName);
    };
    e.currentTarget.src = fallbackRemote;
    return;
  }

  // Otherwise, fallback directly to the embedded SVG data URI
  e.currentTarget.src = getCategoryPlaceholderSvg(category, productName);
}

/**
 * Safe image onError handler for vendor logos.
 * Prevents loops and replaces a failing logo with a crisp initials badge.
 */
export function handleVendorLogoError(e, vendorName, category) {
  e.currentTarget.onerror = null;
  e.currentTarget.src = getVendorInitialsSvg(vendorName, category);
}
