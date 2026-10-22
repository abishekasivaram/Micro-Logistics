// Curated Product Catalog Mapped to Respective Stores for Backend Fallback
const initialProducts = [
  // 1. Fresh Dairy & Bakes (Dairy & Bakery)
  {
    id: '55555555-5555-5555-5555-555555555551',
    uuid: '55555555-5555-5555-5555-555555555551',
    legacy_id: 'p1',
    vendorId: '4b89a3be-8048-48c9-99a9-52c306a6eb09',
    vendorName: 'Fresh Dairy & Bakes',
    name: 'Aavin Green Milk 500ml',
    category: 'Dairy',
    price: 22.0,
    stock: 145,
    prepTime: '5 mins',
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80',
    description: 'Fresh pasteurized toned milk 500ml packet. Daily cold-chain delivery.'
  },
  {
    id: '55555555-5555-5555-5555-555555555553',
    uuid: '55555555-5555-5555-5555-555555555553',
    legacy_id: 'p3',
    vendorId: '4b89a3be-8048-48c9-99a9-52c306a6eb09',
    vendorName: 'Fresh Dairy & Bakes',
    name: 'Amul Fresh Malai Paneer 200g',
    category: 'Dairy',
    price: 85.0,
    stock: 45,
    prepTime: '5 mins',
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=80',
    description: 'Fresh and soft malai paneer cubes, rich in protein and pure dairy goodness.'
  },
  {
    id: '55555555-5555-5555-5555-555555555552',
    uuid: '55555555-5555-5555-5555-555555555552',
    legacy_id: 'p2',
    vendorId: '4b89a3be-8048-48c9-99a9-52c306a6eb09',
    vendorName: 'Fresh Dairy & Bakes',
    name: 'Modern White Bread 400g',
    category: 'Bakery',
    price: 40.0,
    stock: 25,
    prepTime: '5 mins',
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
    description: 'Freshly baked soft white sliced bread loaf for daily morning breakfast.'
  },

  // 2. Namma Chennai Naturals (Groceries)
  {
    id: '55555555-5555-5555-5555-555555555554',
    uuid: '55555555-5555-5555-5555-555555555554',
    legacy_id: 'p4',
    vendorId: '4694794a-e6ed-4f99-bc80-ec9199fbd04c',
    vendorName: 'Namma Chennai Naturals',
    name: 'India Gate Basmati Rice 1kg',
    category: 'Grocery',
    price: 135.0,
    stock: 60,
    prepTime: '10 mins',
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80',
    description: 'Aged long-grain aromatic basmati rice for delicious biryani and everyday meals.'
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    uuid: '55555555-5555-5555-5555-555555555555',
    legacy_id: 'p5',
    vendorId: '4694794a-e6ed-4f99-bc80-ec9199fbd04c',
    vendorName: 'Namma Chennai Naturals',
    name: 'Tata Salt Vacuum Evaporated 1kg',
    category: 'Grocery',
    price: 28.0,
    stock: 120,
    prepTime: '5 mins',
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1518110903495-cd99c12921c5?w=500&auto=format&fit=crop&q=80',
    description: 'Iodized cooking salt vacuum evaporated with guaranteed purity.'
  },

  // 3. Organic Farm Harvest (Fruits & Veg)
  {
    id: '55555555-5555-5555-5555-555555555557',
    uuid: '55555555-5555-5555-5555-555555555557',
    legacy_id: 'p7',
    vendorId: '3fbac8c5-81fb-4a33-b32c-7a8e6ad43167',
    vendorName: 'Organic Farm Harvest',
    name: 'Farm Fresh Red Tomatoes 1kg',
    category: 'Fruits & Veg',
    price: 38.0,
    stock: 80,
    prepTime: '5 mins',
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80',
    description: 'Ripe, juicy country tomatoes harvested fresh from organic local farms.'
  },
  {
    id: '55555555-5555-5555-5555-555555555558',
    uuid: '55555555-5555-5555-5555-555555555558',
    legacy_id: 'p8',
    vendorId: '3fbac8c5-81fb-4a33-b32c-7a8e6ad43167',
    vendorName: 'Organic Farm Harvest',
    name: 'Fresh Shimla Apples (4 pcs / 500g)',
    category: 'Fruits & Veg',
    price: 120.0,
    stock: 50,
    prepTime: '5 mins',
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=80',
    description: 'Sweet and crunchy hand-picked Shimla red apples packed with natural antioxidants.'
  },

  // 4. Chennai Daily Essentials (Grocery)
  {
    id: '55555555-5555-5555-5555-555555555559',
    uuid: '55555555-5555-5555-5555-555555555559',
    legacy_id: 'p9',
    vendorId: 'f140f3aa-1813-49a0-ba5e-3fcc752a278e',
    vendorName: 'Chennai Daily Essentials',
    name: 'Aashirvaad Shudh Chakki Atta 1kg',
    category: 'Grocery',
    price: 55.0,
    stock: 70,
    prepTime: '5 mins',
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop&q=80',
    description: '100% whole wheat chakki ground flour for fluffy, super-soft rotis.'
  },
  {
    id: '55555555-5555-5555-5555-555555555560',
    uuid: '55555555-5555-5555-5555-555555555560',
    legacy_id: 'p10',
    vendorId: 'f140f3aa-1813-49a0-ba5e-3fcc752a278e',
    vendorName: 'Chennai Daily Essentials',
    name: 'Fortune Sunlite Sunflower Oil 1L',
    category: 'Grocery',
    price: 145.0,
    stock: 40,
    prepTime: '5 mins',
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80',
    description: 'Light, healthy refined sunflower cooking oil fortified with Vitamins A & D.'
  }
];

module.exports = { initialProducts };
