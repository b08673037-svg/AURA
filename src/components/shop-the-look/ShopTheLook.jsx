import { useState, useEffect, useMemo } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../../services/firebase';
import SectionHeading from '../common/SectionHeading';
import LookCampaign from './LookCampaign';
import { motion } from 'framer-motion';
import './ShopTheLook.css';

const DEFAULT_HOTSPOTS = [
  { top: "25%", left: "45%" },
  { top: "35%", left: "55%" },
  { top: "65%", left: "50%" },
  { top: "90%", left: "45%" }
];

const ShopTheLook = () => {
  const [looks, setLooks] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let looksLoaded = false;
    let prodsLoaded = false;
    
    const check = () => { if (looksLoaded && prodsLoaded) setLoading(false); };

    const unsubLooks = onValue(ref(db, "lookbooks"), (snap) => {
      const data = snap.val() || {};
      setLooks(Object.entries(data).map(([id, val]) => ({ id, ...val })));
      looksLoaded = true; check();
    });

    const unsubProds = onValue(ref(db, "products"), (snap) => {
      const data = snap.val() || {};
      const prods = Object.entries(data)
        .map(([id, val]) => ({ 
          id, ...val, 
          slug: val.sku ? val.sku.toLowerCase() : id,
          images: val.image ? [val.image] : [],
          sizes: val.sizes || ["S", "M", "L", "XL"],
          colors: val.colors || ["Default"]
        }))
        .filter(p => p.status === "active");
      setProducts(prods);
      prodsLoaded = true; check();
    });

    return () => { unsubLooks(); unsubProds(); };
  }, []);

  const campaigns = useMemo(() => {
    return looks.map(look => {
      const lookProducts = look.products?.map(id => products.find(p => p.id === id)).filter(Boolean) || [];
      
      const productsWithHotspots = lookProducts.map((p, index) => ({
        ...p,
        hotspot: DEFAULT_HOTSPOTS[index] || DEFAULT_HOTSPOTS[0]
      }));

      return {
        ...look,
        products: productsWithHotspots
      };
    }).filter(c => c.products.length > 0);
  }, [looks, products]);

  // If loading or no looks exist in the database, just return null (hide the section)
  if (loading || campaigns.length === 0) return null;

  return (
    <section className="shop-the-look-section">
      <div className="section-container">
        <motion.div className="look-intro" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <SectionHeading 
            eyebrow="THE AURA EDIT" 
            title="Shop The Look" 
            description="Discover thoughtfully styled outfits, explore every detail, and bring your favorite looks into your wardrobe."
            align="center"
          />
        </motion.div>

        <div className="look-campaigns-container">
          {campaigns.map((campaign, index) => (
            <LookCampaign 
              key={campaign.id} 
              campaign={campaign} 
              reverse={index % 2 !== 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopTheLook;