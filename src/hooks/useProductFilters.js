import { useState, useMemo } from 'react';

export const useProductFilters = (initialProducts, categoryConfig) => {
  // Filter States
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 30000]); // Increased max to cover all products
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [sortOption, setSortOption] = useState("featured");

  // Toggle Helpers
  const toggleCategory = (cat) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleSize = (size) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color) => {
    setSelectedColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 30000]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setOnSaleOnly(false);
    setSortOption("featured");
  };

  // The Filtering Engine
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...initialProducts];

    // 1. Filter by Category
    if (selectedCategories.length > 0) {
      result = result.filter(p => {
        // Check if the product matches the category (e.g., 'women') OR the subcategory (e.g., 'dresses')
        return selectedCategories.includes(p.category) || selectedCategories.includes(p.subcategory);
      });
    }

    // 2. Filter by Price
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // 3. Filter by Size
    if (selectedSizes.length > 0) {
      result = result.filter(p => p.sizes && p.sizes.some(size => selectedSizes.includes(size)));
    }

    // 4. Filter by Color
    if (selectedColors.length > 0) {
      result = result.filter(p => p.colors && p.colors.some(color => selectedColors.includes(color)));
    }

    // 5. Filter by Discount
    if (onSaleOnly) {
      result = result.filter(p => p.originalPrice !== null);
    }

    // 6. Sorting Logic
    switch (sortOption) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        result.sort((a, b) => (a.isNew === b.isNew ? 0 : a.isNew ? -1 : 1));
        break;
      case "best-selling":
        result.sort((a, b) => (a.isBestSeller === b.isBestSeller ? 0 : a.isBestSeller ? -1 : 1));
        break;
      case "name-az":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return result;
  }, [initialProducts, selectedCategories, priceRange, selectedSizes, selectedColors, onSaleOnly, sortOption]);

  return {
    filteredAndSortedProducts,
    selectedCategories, priceRange, selectedSizes, selectedColors, onSaleOnly, sortOption,
    toggleCategory, setPriceRange, toggleSize, toggleColor, setOnSaleOnly, setSortOption, clearAllFilters
  };
};