import './ProductSelectors.css';

export const ColorSelector = ({ colors, selectedColor, onChange }) => {
  return (
    <div className="selector-group">
      <div className="selector-header">
        <span className="selector-label">Color</span>
        <span className="selected-value">{selectedColor || "Select a color"}</span>
      </div>
      <div className="swatch-grid">
        {colors.map((color) => (
          <button
            key={color}
            className={`color-swatch ${selectedColor === color ? 'active' : ''}`}
            onClick={() => onChange(color)}
            title={color}
            style={{ backgroundColor: color.toLowerCase() }}
          />
        ))}
      </div>
    </div>
  );
};

export const SizeSelector = ({ sizes, selectedSize, onChange, onOpenSizeGuide }) => {
  return (
    <div className="selector-group">
      <div className="selector-header">
        <span className="selector-label">Size</span>
        <button className="size-guide-btn" onClick={onOpenSizeGuide}>
          Size Guide
        </button>
      </div>
      <div className="size-grid">
        {sizes.map((size) => (
          <button
            key={size}
            className={`size-box ${selectedSize === size ? 'active' : ''}`}
            onClick={() => onChange(size)}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
};

export const QuantitySelector = ({ quantity, onChange, maxStock = 10 }) => {
  return (
    <div className="quantity-selector">
      <button 
        onClick={() => onChange(Math.max(1, quantity - 1))}
        disabled={quantity <= 1}
      >
        -
      </button>
      <span>{quantity}</span>
      <button 
        onClick={() => onChange(Math.min(maxStock, quantity + 1))}
        disabled={quantity >= maxStock}
      >
        +
      </button>
    </div>
  );
};