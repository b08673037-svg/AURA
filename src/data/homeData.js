export const heroData = {
  eyebrow: "THE NEW SEASON COLLECTION",
  title: "Timeless Style.",
  titleItalic: "Everyday Confidence.",
  description: "Discover premium fashion for men and women with unmatched quality and style.",
  image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1500&auto=format&fit=crop",
};

export const categoriesData = [
  { id: 1, name: "Men's Collection", icon: "shirt", link: "/shop/men" },
  { id: 2, name: "Women's Collection", icon: "dress", link: "/shop/women" },
  { id: 3, name: "Shoes", icon: "shoe", link: "/shop/shoes" },
  { id: 4, name: "Bags", icon: "bag", link: "/shop/bags" },
  { id: 5, name: "Accessories", icon: "glasses", link: "/shop/accessories" },
  { id: 6, name: "New Arrivals", icon: "diamond", link: "/shop/new-arrivals" },
  { id: 7, name: "Best Sellers", icon: "flame", link: "/shop/all" },
];

export const newArrivalsData = [
  {
    id: "p1",
    slug: "premium-bomber-jacket",
    name: "Premium Bomber Jacket",
    price: 4999,
    originalPrice: 6999,
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop",
    hoverImage: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop",
    badge: "New",
    category: "men",
  },
  {
    id: "p2",
    slug: "embroidered-dress",
    name: "Embroidered Dress",
    price: 5999,
    originalPrice: 7499,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop",
    hoverImage: null,
    badge: "-20%",
    category: "women",
  },
  {
    id: "p3",
    slug: "classic-polo-t-shirt",
    name: "Classic Polo T-Shirt",
    price: 2499,
    originalPrice: null,
    image: "https://images.unsplash.com/photo-1625910513452-2f5c0f0a3c4d?q=80&w=800&auto=format&fit=crop",
    hoverImage: null,
    badge: "Hot",
    category: "men",
  },
  {
    id: "p4",
    slug: "stylish-handbag",
    name: "Stylish Handbag",
    price: 3999,
    originalPrice: 4699,
    image: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=800&auto=format&fit=crop",
    hoverImage: null,
    badge: "-15%",
    category: "women",
  },
];

export const collectionsData = {
  men: {
    title: "Men's Collection",
    subtitle: "Modern Essentials. Timeless Appeal.",
    image: "https://images.unsplash.com/photo-1587715363857-65fcecee8fa1?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
    link: "/shop/men", // This makes the Shop Now button work
  },
  women: {
    title: "Women's Collection",
    subtitle: "Elegance in Every Detail.",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop",
    link: "/shop/women", // This makes the Shop Now button work
  }
};

export const shopTheLookData = {
  title: "The Autumn Edit",
  description: "Effortless layering for the modern individual. Discover our curated looks for the season.",
  image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop",
  link: "/collections/autumn"
};

export const trendingCollectionsData = [
  {
    id: "t1",
    title: "Autumn Essentials",
    subtitle: "The seasonal edit.",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1200&auto=format&fit=crop",
    link: "/collections/new-season",
    isLarge: true
  },
  {
    id: "t2",
    title: "Everyday Luxury",
    subtitle: "Elevated basics.",
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=800&auto=format&fit=crop",
    link: "/collections/everyday-essentials",
    isLarge: false
  },
  {
    id: "t3",
    title: "Modern Classics",
    subtitle: "Timeless silhouettes.",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop",
    link: "/collections/modern-classics",
    isLarge: false
  }
];

export const brandStoryData = {
  title: "Fashion That Feels Like You.",
  description: "At AURA, we believe that true style is timeless. We craft premium garments that blend modern aesthetics with unparalleled comfort, empowering you to step out with everyday confidence.",
  image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=800&auto=format&fit=crop"
};

export const reviewsData = [
  {
    id: "r1",
    name: "Sarah M.",
    rating: 5,
    text: "The quality of the fabrics is absolutely incredible. I've never felt more confident in a coat. AURA is my new go-to.",
    product: "Premium Bomber Jacket"
  },
  {
    id: "r2",
    name: "Ahmed K.",
    rating: 5,
    text: "Finally, a brand that understands modern menswear. The fit is perfect, and the delivery was incredibly fast.",
    product: "Classic Polo T-Shirt"
  },
  {
    id: "r3",
    name: "Elena R.",
    rating: 4,
    text: "Elegant, chic, and exactly as pictured. The embroidered dress is a masterpiece. Will definitely be ordering again.",
    product: "Embroidered Dress"
  }
];