export const collectionsData = [
  {
    id: "c1",
    slug: "new-season",
    title: "The New Season",
    eyebrow: "FRESH PERSPECTIVES",
    description: "Fresh perspectives and new-season essentials for the modern wardrobe.",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1200&auto=format&fit=crop",
    link: "/collections/new-season"
  },
  {
    id: "c2",
    slug: "modern-gentleman",
    title: "The Modern Gentleman",
    eyebrow: "MEN'S EDIT",
    description: "Refined everyday pieces for the modern man.",
    image: "https://images.unsplash.com/photo-1480455624313-e29b44bbfde1?q=80&w=1200&auto=format&fit=crop",
    link: "/collections/modern-gentleman"
  },
  {
    id: "c3",
    slug: "effortless-elegance",
    title: "Effortless Elegance",
    eyebrow: "WOMEN'S EDIT",
    description: "Contemporary silhouettes and timeless feminine style.",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop",
    link: "/collections/effortless-elegance"
  },
  {
    id: "c4",
    slug: "everyday-essentials",
    title: "Everyday Essentials",
    eyebrow: "CORE WARDROBE",
    description: "Versatile pieces designed for everyday confidence.",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop",
    link: "/collections/everyday-essentials"
  },
  {
    id: "c5",
    slug: "weekend-edit",
    title: "The Weekend Edit",
    eyebrow: "OFF-DUTY",
    description: "Relaxed styles for your time away.",
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1200&auto=format&fit=crop",
    link: "/collections/weekend-edit"
  },
  {
    id: "c6",
    slug: "occasion-wear",
    title: "Occasion Wear",
    eyebrow: "SPECIAL MOMENTS",
    description: "Distinctive styles for your special moments.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop",
    link: "/collections/occasion-wear"
  }
];

export const getCollectionBySlug = (slug) => {
  return collectionsData.find(c => c.slug === slug);
};