export const categoryConfig = {
  // --- ALL PRODUCTS (CATEGORY HUB) ---
  "all": {
    title: "The Full Collection",
    eyebrow: "EXPLORE EVERYTHING",
    description: "Discover our complete range of premium fashion, shoes, and accessories.",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop",
    subcategories: [
      { name: "Men", slug: "men" },
      { name: "Women", slug: "women" },
      { name: "Accessories", slug: "accessories" },
      { name: "Shoes", slug: "shoes" },
      { name: "Bags", slug: "bags" },
    ]
  },

  // --- MAIN GENDER PAGES ---
  men: {
    title: "The Modern Gentleman",
    eyebrow: "THE AURA MEN'S EDIT",
    description: "Discover refined essentials, contemporary silhouettes, and timeless pieces designed for everyday confidence.",
    image: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?q=80&w=1200&auto=format&fit=crop",
    subcategories: [
      { name: "Shirts", slug: "shirts" },
      { name: "T-Shirts", slug: "t-shirts" },
      { name: "Polo Shirts", slug: "polo-shirts" },
      { name: "Trousers", slug: "trousers" },
      { name: "Jeans", slug: "jeans" },
      { name: "Jackets", slug: "jackets" },
      { name: "Hoodies", slug: "hoodies" },
      { name: "Shoes", slug: "shoes" },
      { name: "Accessories", slug: "accessories" }
    ]
  },
  women: {
    title: "Effortless Elegance",
    eyebrow: "THE AURA WOMEN'S EDIT",
    description: "Explore beautiful silhouettes, contemporary fashion, and timeless essentials that celebrate your individuality.",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop",
    subcategories: [
      { name: "Dresses", slug: "dresses" },
      { name: "Tops", slug: "tops" },
      { name: "Shirts", slug: "shirts" },
      { name: "Trousers", slug: "trousers" },
      { name: "Jeans", slug: "jeans" },
      { name: "Skirts", slug: "skirts" },
      { name: "Co-ord Sets", slug: "co-ord-sets" },
      { name: "Outerwear", slug: "outerwear" },
      { name: "Traditional Wear", slug: "traditional" },
      { name: "Shoes", slug: "shoes" },
      { name: "Bags", slug: "bags" },
      { name: "Accessories", slug: "accessories" }
    ]
  },

  // --- SPECIFIC COLLECTION PAGES ---
  accessories: {
    title: "The Finishing Touch",
    eyebrow: "THE ACCESSORIES EDIT",
    description: "Elevate your look with our curated selection of premium accessories.",
    image: "https://images.unsplash.com/photo-1611085583191-a3b181a88401?q=80&w=1200&auto=format&fit=crop",
  },
  shoes: {
    title: "Step Into Style",
    eyebrow: "THE FOOTWEAR EDIT",
    description: "Discover our collection of expertly crafted shoes designed for comfort and elegance.",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1200&auto=format&fit=crop",
  },
  bags: {
    title: "The Signature Bags",
    eyebrow: "THE BAG EDIT",
    description: "Timeless silhouettes and premium materials for the modern individual.",
    image: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=1200&auto=format&fit=crop",
  },
  "new-arrivals": {
    title: "Just Arrived",
    eyebrow: "THE NEW SEASON",
    description: "Discover the latest additions to the AURA collection.",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1200&auto=format&fit=crop",
  },
  "best-sellers": {
    title: "Best Sellers",
    eyebrow: "THE MOST LOVED",
    description: "Discover the pieces our community loves the most.",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop",
  },

  // --- MEN'S SUBCATEGORIES ---
  "men/shirts": {
    title: "Men's Shirts",
    description: "Tailored fits and premium fabrics for the modern gentleman.",
    image: "https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?q=80&w=1200&auto=format&fit=crop"
  },
  "men/t-shirts": {
    title: "Men's T-Shirts",
    description: "Everyday essentials crafted from the finest cotton.",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200&auto=format&fit=crop"
  },
  "men/trousers": {
    title: "Men's Trousers",
    description: "Refined trousers for every occasion.",
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=1200&auto=format&fit=crop"
  },
  "men/jeans": {
    title: "Men's Jeans",
    description: "Classic denim and modern cuts for everyday wear.",
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=1200&auto=format&fit=crop"
  },
  "men/jackets": {
    title: "Men's Jackets",
    description: "Outerwear designed for style and warmth.",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1200&auto=format&fit=crop"
  },

  // --- WOMEN'S SUBCATEGORIES ---
  "women/dresses": {
    title: "Women's Dresses",
    description: "Elegant silhouettes for every occasion.",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1200&auto=format&fit=crop"
  },
  "women/tops": {
    title: "Women's Tops",
    description: "Contemporary styles for a refined wardrobe.",
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1200&auto=format&fit=crop"
  },
  "women/bags": {
    title: "Women's Bags",
    description: "The perfect finishing touch to any outfit.",
    image: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=1200&auto=format&fit=crop"
  },
  "women/skirts": {
    title: "Women's Skirts",
    description: "Flattering silhouettes for every season.",
    image: "https://images.unsplash.com/photo-1583496661160-fb5886a13d44?q=80&w=1200&auto=format&fit=crop"
  },
  "women/outerwear": {
    title: "Women's Outerwear",
    description: "Elevated layers for the modern woman.",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1200&auto=format&fit=crop"
  }
};