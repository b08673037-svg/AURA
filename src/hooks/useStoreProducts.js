import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../services/firebase";

export const useStoreProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const productsRef = ref(db, "products");
    
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productsList = Object.entries(data)
          .map(([id, product]) => {
            // 1. Map admin product shape to storefront product shape
            const mappedProduct = {
              id: id,
              slug: product.sku ? product.sku.toLowerCase() : id, 
              name: product.name,
              price: Number(product.price) || 0,
              originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
              category: product.category ? product.category.toLowerCase() : "uncategorized",
              description: product.description || "A premium AURA selection.",
              stock: Number(product.stock) || 0,
              
              // Handle images: Storefront expects an array
              image: product.image || "",
              images: product.image ? [product.image] : [],
              hoverImage: null,
              
              // Default arrays for variants so the UI doesn't break
              sizes: product.sizes || ["S", "M", "L", "XL"],
              colors: product.colors || ["Default"],
              
              status: product.status,
              badge: product.stock <= 5 ? "Low Stock" : null,
            };
            return mappedProduct;
          })
          // 2. ONLY show products marked as active
          .filter((p) => p.status === "active");

        setProducts(productsList);
      } else {
        setProducts([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { products, loading };
};