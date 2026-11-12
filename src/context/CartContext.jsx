import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('aura_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [savedItems, setSavedItems] = useState(() => {
    const saved = localStorage.getItem('aura_saved');
    return saved ? JSON.parse(saved) : [];
  });

  const [coupon, setCoupon] = useState(null);

  useEffect(() => {
    localStorage.setItem('aura_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('aura_saved', JSON.stringify(savedItems));
  }, [savedItems]);

  const addToCart = (product, quantity, selectedSize, selectedColor) => {
    setCartItems(prev => {
      const existingItemIndex = prev.findIndex(item => 
        item.id === product.id && 
        item.selectedSize === selectedSize && 
        item.selectedColor === selectedColor
      );

      if (existingItemIndex > -1) {
        const newCart = [...prev];
        newCart[existingItemIndex].quantity += quantity;
        return newCart;
      }

      return [...prev, {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || product.image,
        category: product.category,
        selectedSize,
        selectedColor,
        quantity,
        stock: 10
      }];
    });
  };

  const removeFromCart = (id, size, color) => {
    setCartItems(prev => prev.filter(item => 
      !(item.id === id && item.selectedSize === size && item.selectedColor === color)
    ));
    toast.success("Item removed from bag");
  };

  const updateQuantity = (id, size, color, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(prev => prev.map(item => 
      (item.id === id && item.selectedSize === size && item.selectedColor === color)
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const saveForLater = (id, size, color) => {
    const itemToSave = cartItems.find(item => 
      item.id === id && item.selectedSize === size && item.selectedColor === color
    );
    
    if (itemToSave) {
      setSavedItems(prev => [...prev, itemToSave]);
      removeFromCart(id, size, color);
      toast.success("Saved for later");
    }
  };

  const moveToCart = (id, size, color) => {
    const itemToMove = savedItems.find(item => 
      item.id === id && item.selectedSize === size && item.selectedColor === color
    );
    
    if (itemToMove) {
      addToCart(itemToMove, itemToMove.quantity, itemToMove.selectedSize, itemToMove.selectedColor);
      setSavedItems(prev => prev.filter(item => 
        !(item.id === id && item.selectedSize === size && item.selectedColor === color)
      ));
    }
  };

  const removeSavedItem = (id, size, color) => {
    setSavedItems(prev => prev.filter(item => 
      !(item.id === id && item.selectedSize === size && item.selectedColor === color)
    ));
  };

  const applyCoupon = (code) => {
    if (code.toUpperCase() === 'AURA10') {
      setCoupon({ code: 'AURA10', discount: 0.10 }); // 10% off
      toast.success("Coupon applied!");
    } else {
      toast.error("Invalid coupon code");
    }
  };

  const removeCoupon = () => setCoupon(null);

  // NEW: Clears the cart, saved items, and coupon — used after a successful checkout
  const clearCart = () => {
    setCartItems([]);
    setSavedItems([]);
    setCoupon(null);
    localStorage.removeItem('aura_cart');
    localStorage.removeItem('aura_saved');
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Calculate discount
  const discountAmount = coupon ? subtotal * coupon.discount : 0;
  const finalTotal = subtotal - discountAmount;

  return (
    <CartContext.Provider value={{
      cartItems,
      savedItems,
      cartCount,
      subtotal,
      coupon,
      discountAmount,
      finalTotal,
      addToCart,
      removeFromCart,
      updateQuantity,
      saveForLater,
      moveToCart,
      removeSavedItem,
      applyCoupon,
      removeCoupon,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};