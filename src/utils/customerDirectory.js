/**
 * customerDirectory.js
 * Source of truth for distinct delivery addresses and profiles for all customer accounts (c1, c2, c3, c4).
 */

export const CUSTOMER_PROFILES_MAP = {
  c1: {
    id: 'c1',
    legacy_id: 'c1',
    name: 'Priya Rajan',
    username: 'c1',
    email: 'priya_auth@example.com',
    phone: '+91 98765 43210',
    address: '101, 2nd Avenue, Anna Nagar East, Chennai - 600102',
    area: 'Anna Nagar East',
    cluster: 'Anna Nagar Cluster',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=250&auto=format&fit=crop&q=80',
    savedAddresses: [
      {
        id: 'addr-c1-home',
        label: 'Home',
        recipientName: 'Priya Rajan',
        phone: '+91 98765 43210',
        address: '101, 2nd Avenue, Anna Nagar East, Chennai - 600102',
        landmark: 'Opposite Roundtana Park',
        area: 'Anna Nagar East',
        isDefault: true
      },
      {
        id: 'addr-c1-work',
        label: 'Work / Office',
        recipientName: 'Priya Rajan (Work)',
        phone: '+91 98765 43210',
        address: 'Module 4, Ascendas Tech Park, CSIR Road, Taramani, Chennai - 600113',
        landmark: 'Phase 2 Building, 4th Floor',
        area: 'Taramani / OMR',
        isDefault: false
      },
      {
        id: 'addr-c1-family',
        label: 'Family / Parents',
        recipientName: 'Rajan S',
        phone: '+91 98401 23456',
        address: '14/2, 4th Cross St, Mandaveli, Chennai - 600028',
        landmark: 'Near Mandaveli Post Office',
        area: 'Mandaveli',
        isDefault: false
      }
    ]
  },
  c2: {
    id: 'c2',
    legacy_id: 'c2',
    name: 'Ramesh Kumar',
    username: 'c2',
    email: 'c2@example.com',
    phone: '+91 98765 43202',
    address: '15 Gandhi Road, Mylapore, Chennai - 600004',
    area: 'Mylapore',
    cluster: 'Mylapore Cultural Cluster',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80',
    savedAddresses: [
      {
        id: 'addr-c2-home',
        label: 'Home',
        recipientName: 'Ramesh Kumar',
        phone: '+91 98765 43202',
        address: '15 Gandhi Road, Mylapore, Chennai - 600004',
        landmark: 'Near Kapaleeshwarar Temple West Gate',
        area: 'Mylapore',
        isDefault: true
      },
      {
        id: 'addr-c2-work',
        label: 'Work / Office',
        recipientName: 'Ramesh Kumar (Office)',
        phone: '+91 98765 43202',
        address: 'Tidel Park, 3rd Floor, D-Block, Rajiv Gandhi Salai, Taramani, Chennai - 600113',
        landmark: 'Opposite CSIR Campus',
        area: 'Taramani / OMR',
        isDefault: false
      },
      {
        id: 'addr-c2-parents',
        label: 'Parents House',
        recipientName: 'Sundaram K',
        phone: '+91 98402 33445',
        address: '28 North Mada Street, Mylapore, Chennai - 600004',
        landmark: 'Near Bharatiya Vidya Bhavan',
        area: 'Mylapore',
        isDefault: false
      }
    ]
  },
  c3: {
    id: 'c3',
    legacy_id: 'c3',
    name: 'Ananya Sharma',
    username: 'c3',
    email: 'c3@example.com',
    phone: '+91 98765 43203',
    address: '42 Besant Avenue, Adyar, Chennai - 600020',
    area: 'Adyar',
    cluster: 'Adyar Coastal Cluster',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80',
    savedAddresses: [
      {
        id: 'addr-c3-home',
        label: 'Home',
        recipientName: 'Ananya Sharma',
        phone: '+91 98765 43203',
        address: '42 Besant Avenue, Adyar, Chennai - 600020',
        landmark: 'Near Theosophical Society Gate',
        area: 'Adyar',
        isDefault: true
      },
      {
        id: 'addr-c3-studio',
        label: 'Design Studio',
        recipientName: 'Ananya Sharma',
        phone: '+91 98765 43203',
        address: '18 Kasturibai Nagar 2nd Main Rd, Adyar, Chennai - 600020',
        landmark: 'Above Nilgiris Supermarket',
        area: 'Adyar',
        isDefault: false
      },
      {
        id: 'addr-c3-work',
        label: 'Client Office',
        recipientName: 'Ananya Sharma',
        phone: '+91 98765 43203',
        address: 'Olympia Tech Park, Altius Block, Guindy, Chennai - 600032',
        landmark: 'Opposite Guindy Metro Station',
        area: 'Guindy',
        isDefault: false
      }
    ]
  },
  c4: {
    id: 'c4',
    legacy_id: 'c4',
    name: 'Karthik V',
    username: 'c4',
    email: 'c4@example.com',
    phone: '+91 98765 43204',
    address: '88 OMR IT Highway, Thoraipakkam, Chennai - 600097',
    area: 'Thoraipakkam',
    cluster: 'OMR Tech Corridor Cluster',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&auto=format&fit=crop&q=80',
    savedAddresses: [
      {
        id: 'addr-c4-home',
        label: 'Home',
        recipientName: 'Karthik V',
        phone: '+91 98765 43204',
        address: '88 OMR IT Highway, Thoraipakkam, Chennai - 600097',
        landmark: 'Near AKDR Golf Village Toll Plaza',
        area: 'Thoraipakkam',
        isDefault: true
      },
      {
        id: 'addr-c4-work',
        label: 'Office / Tech Park',
        recipientName: 'Karthik V (Work)',
        phone: '+91 98765 43204',
        address: 'Futura Tech Park, Block B, Sholinganallur, Chennai - 600119',
        landmark: 'Near Sholinganallur Junction',
        area: 'Sholinganallur / OMR',
        isDefault: false
      },
      {
        id: 'addr-c4-parents',
        label: 'Parents Residence',
        recipientName: 'Venkatesh S',
        phone: '+91 98403 77889',
        address: '33 100 Feet Road, Velachery, Chennai - 600042',
        landmark: 'Near Phoenix MarketCity Mall',
        area: 'Velachery',
        isDefault: false
      }
    ]
  }
};

/**
 * Resolves a customer profile definition by identifier (c1, c2, c3, c4 or email or name)
 */
export function getCustomerProfileByIdentifier(identifier) {
  if (!identifier) return CUSTOMER_PROFILES_MAP.c1;
  const key = String(identifier).trim().toLowerCase();

  if (CUSTOMER_PROFILES_MAP[key]) return CUSTOMER_PROFILES_MAP[key];

  for (const prof of Object.values(CUSTOMER_PROFILES_MAP)) {
    if (
      prof.id.toLowerCase() === key ||
      prof.legacy_id.toLowerCase() === key ||
      prof.email.toLowerCase() === key ||
      prof.username.toLowerCase() === key ||
      prof.name.toLowerCase() === key
    ) {
      return prof;
    }
  }

  // Fallback defaults if c1..c4 prefix
  if (key.includes('c4') || key.includes('karthik')) return CUSTOMER_PROFILES_MAP.c4;
  if (key.includes('c3') || key.includes('ananya')) return CUSTOMER_PROFILES_MAP.c3;
  if (key.includes('c2') || key.includes('ramesh')) return CUSTOMER_PROFILES_MAP.c2;

  return CUSTOMER_PROFILES_MAP.c1;
}

/**
 * Rectifies any customer user object to ensure distinct address & area
 */
export function rectifyCustomerUser(user) {
  if (!user || user.role !== 'customer') return user;

  const key = user.legacy_id || user.username || user.email || user.name || '';
  const resolved = getCustomerProfileByIdentifier(key);

  // If user already has a valid customized non-default address that isn't the c1 fallback, keep it
  const isAnnaNagarFallback = user.address === '101, 2nd Avenue, Anna Nagar East, Chennai - 600102' || user.address === '101 Anna Nagar East, Chennai';
  const shouldRectify = !user.address || (isAnnaNagarFallback && resolved.legacy_id !== 'c1');

  return {
    ...user,
    name: user.name || resolved.name,
    username: user.username || resolved.username,
    email: user.email || resolved.email,
    phone: user.phone || resolved.phone,
    address: shouldRectify ? resolved.address : user.address,
    area: shouldRectify ? resolved.area : (user.area || resolved.area),
    cluster: resolved.cluster,
    avatar: user.avatar || resolved.avatar
  };
}
