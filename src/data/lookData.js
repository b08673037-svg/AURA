export const lookCampaigns = [
  {
    id: "look-01",
    campaignLabel: "THE MODERN GENTLEMAN",
    lookNumber: "LOOK 01",
    title: "Effortless Looks.\nRefined Details.",
    description: "Discover modern essentials designed for confident, effortless everyday dressing.",
    modelImage: "https://images.unsplash.com/photo-1480455624313-e29b44bbfde1?q=80&w=1000&auto=format&fit=crop",
    category: "men",
    products: [
      {
        id: "sp1", // Matches Premium Wool Overcoat in shopData
        slug: "premium-wool-overcoat",
        name: "Premium Wool Overcoat",
        price: 14999,
        image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=200&auto=format&fit=crop",
        hotspot: { top: "25%", left: "45%" } 
      },
      {
        id: "sp4", // Matches Tailored Linen Shirt in shopData
        slug: "tailored-linen-shirt",
        name: "Tailored Linen Shirt",
        price: 4499,
        image: "https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?q=80&w=200&auto=format&fit=crop",
        hotspot: { top: "35%", left: "55%" }
      },
      {
        id: "sp8", // Matches Smart Casual Chinos in shopData
        slug: "smart-casual-chinos",
        name: "Smart Casual Chinos",
        price: 3999,
        image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=200&auto=format&fit=crop",
        hotspot: { top: "65%", left: "50%" }
      },
      {
        id: "sp10", // Matches Classic White Sneakers in shopData
        slug: "classic-white-sneakers",
        name: "Classic White Sneakers",
        price: 6999,
        image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=200&auto=format&fit=crop",
        hotspot: { top: "90%", left: "45%" }
      }
    ]
  },
  {
    id: "look-02",
    campaignLabel: "EFFORTLESS ELEGANCE",
    lookNumber: "LOOK 02",
    title: "Elegance in Every Detail.",
    description: "Timeless pieces, beautiful textures, and contemporary silhouettes for every occasion.",
    modelImage: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop",
    category: "women",
    products: [
      {
        id: "sp2", // Matches Silk Blend Midi Dress in shopData
        slug: "silk-blend-midi-dress",
        name: "Silk Blend Midi Dress",
        price: 8999,
        image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=200&auto=format&fit=crop",
        hotspot: { top: "30%", left: "40%" }
      },
      {
        id: "sp7", // Matches Cashmere Knit Sweater in shopData
        slug: "cashmere-knit-sweater",
        name: "Cashmere Knit Sweater",
        price: 7499,
        image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=200&auto=format&fit=crop",
        hotspot: { top: "70%", left: "45%" }
      },
      {
        id: "sp3", // Matches Classic Leather Tote in shopData
        slug: "classic-leather-tote",
        name: "Classic Leather Tote",
        price: 11999,
        image: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=200&auto=format&fit=crop",
        hotspot: { top: "55%", left: "65%" }
      }
    ]
  }
];