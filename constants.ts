import { Product } from './types';

export const PRODUCT_CATALOG: Product[] = [
  // FOOD - Healthy Snacking
  {
    id: "f1",
    name: "Plant-Based Protein Cookies (Pack of 6)",
    brand: "The Healthy Binge",
    price: 299,
    category: "Food",
    tags: ["vegan", "gluten-free", "high-protein", "snack", "chocolate"],
    description: "Rich chocolate cookies made with pea protein and sweetened with jaggery. 12g protein per serving.",
    image: "https://picsum.photos/400/400?random=1"
  },
  {
    id: "f2",
    name: "Quinoa Energy Bites",
    brand: "NutriSoul",
    price: 249,
    category: "Food",
    tags: ["vegan", "energy", "sugar-free", "superfood"],
    description: "Bite-sized energy balls made from dates, quinoa, and chia seeds. Perfect for pre-workout.",
    image: "https://picsum.photos/400/400?random=2"
  },
  {
    id: "f3",
    name: "Spicy Ragi Chips",
    brand: "CrunchyMillet",
    price: 150,
    category: "Food",
    tags: ["snack", "gluten-free", "spicy", "millet", "affordable"],
    description: "Baked not fried ragi chips seasoned with peri-peri spices. A guilt-free crunchy snack.",
    image: "https://picsum.photos/400/400?random=3"
  },
  {
    id: "f4",
    name: "Almond & Date Breakfast Bar",
    brand: "MorningFuel",
    price: 349,
    category: "Food",
    tags: ["breakfast", "protein", "nuts", "healthy"],
    description: "Start your day with wholesome almonds and dates. No preservatives.",
    image: "https://picsum.photos/400/400?random=4"
  },
  {
    id: "f5",
    name: "Keto Coconut Cookies",
    brand: "KetoKitchen",
    price: 399,
    category: "Food",
    tags: ["keto", "low-carb", "snack", "sugar-free"],
    description: "Low carb coconut delights for your keto diet journey.",
    image: "https://picsum.photos/400/400?random=5"
  },
  
  // FASHION - Ethnic & Sustainable
  {
    id: "c1",
    name: "Handblock Print Cotton Kurta",
    brand: "IndieWeave",
    price: 1499,
    category: "Fashion",
    tags: ["ethnic", "cotton", "summer", "sustainable", "traditional"],
    description: "Breathable 100% cotton kurta with traditional Rajasthani handblock prints. Ideal for summer.",
    image: "https://picsum.photos/400/400?random=6"
  },
  {
    id: "c2",
    name: "Oversized Cotton Tee",
    brand: "UrbanRoot",
    price: 799,
    category: "Fashion",
    tags: ["casual", "trendy", "cotton", "streetwear", "unisex"],
    description: "Premium heavy-gauge cotton t-shirt with an oversized fit. Street style essential.",
    image: "https://picsum.photos/400/400?random=7"
  },
  {
    id: "c3",
    name: "Linen Blend Trousers",
    brand: "EarthAttire",
    price: 1899,
    category: "Fashion",
    tags: ["formal", "casual", "linen", "breathable", "summer"],
    description: "Relaxed fit linen trousers perfect for office or beach wear.",
    image: "https://picsum.photos/400/400?random=8"
  },
  {
    id: "c4",
    name: "Jaipuri Printed Dupatta",
    brand: "RangReza",
    price: 499,
    category: "Fashion",
    tags: ["accessory", "ethnic", "colorful", "affordable"],
    description: "Vibrant chiffon dupatta to add a pop of color to any outfit.",
    image: "https://picsum.photos/400/400?random=9"
  },
  {
    id: "c5",
    name: "Bamboo Fiber Socks (Pack of 3)",
    brand: "EcoStep",
    price: 299,
    category: "Fashion",
    tags: ["essential", "sustainable", "anti-odor", "comfortable"],
    description: "Super soft bamboo socks that keep your feet fresh all day.",
    image: "https://picsum.photos/400/400?random=10"
  },
    {
    id: "c6",
    name: "Indigo Chikankari Kurti",
    brand: "ThreadTales",
    price: 2199,
    category: "Fashion",
    tags: ["ethnic", "embroidery", "premium", "party"],
    description: "Exquisite hand-embroidered chikankari work on indigo fabric.",
    image: "https://picsum.photos/400/400?random=11"
  }
];

export const INITIAL_GREETING = "Namaste! I'm ShopGenie, your personal assistant for Indian D2C brands. Whether you're looking for vegan snacks or breezy cotton kurtas, I can help. What are you shopping for today?";
