import { createContext, useContext, useState } from 'react';

const QuickViewContext = createContext();

export const useQuickView = () => useContext(QuickViewContext);

export const QuickViewProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const openQuickView = (product) => {
    setSelectedProduct(product);
    setIsOpen(true);
  };

  const closeQuickView = () => {
    setIsOpen(false);
    // Delay clearing product to allow close animation to finish
    setTimeout(() => setSelectedProduct(null), 300);
  };

  return (
    <QuickViewContext.Provider value={{ isOpen, selectedProduct, openQuickView, closeQuickView }}>
      {children}
    </QuickViewContext.Provider>
  );
};