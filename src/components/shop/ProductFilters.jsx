import FilterAccordion from './FilterAccordion';
import './ProductFilters.css';

const ProductFilters = ({ 
  config, 
  filters 
}) => {
  const { 
    selectedCategories, toggleCategory, 
    priceRange, setPriceRange, 
    selectedSizes, toggleSize, 
    selectedColors, toggleColor, 
    onSaleOnly, setOnSaleOnly, 
    clearAllFilters 
  } = filters;

  // Available sizes/colors based on the category config
  const availableSizes = ["XS", "S", "M", "L", "XL"];
  const availableColors = ["Black", "White", "Beige", "Burgundy", "Navy", "Grey", "Brown"];

  return (
    <div className="sidebar-filters">
      <div className="filter-header">
        <h3>Filters</h3>
        <button className="clear-all-btn" onClick={clearAllFilters}>Clear All</button>
      </div>

      {/* Category Filter */}
      {config.subcategories && (
        <FilterAccordion title="Category" defaultOpen>
          <div className="filter-options-list">
            {config.subcategories.map((sub) => (
              <label key={sub.slug} className="filter-checkbox">
                <input 
                  type="checkbox" 
                  checked={selectedCategories.includes(sub.slug)}
                  onChange={() => toggleCategory(sub.slug)}
                />
                <span>{sub.name}</span>
              </label>
            ))}
          </div>
        </FilterAccordion>
      )}

      {/* Price Filter */}
      <FilterAccordion title="Price">
        <div className="price-filter">
          <div className="price-inputs">
            <span>PKR {priceRange[0]}</span>
            <span>-</span>
            <span>PKR {priceRange[1]}</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="20000" 
            step="500"
            value={priceRange[1]} 
            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
            className="price-slider"
          />
        </div>
      </FilterAccordion>

      {/* Size Filter */}
      <FilterAccordion title="Size">
        <div className="size-grid">
          {availableSizes.map(size => (
            <button 
              key={size}
              className={`size-btn ${selectedSizes.includes(size) ? 'active' : ''}`}
              onClick={() => toggleSize(size)}
            >
              {size}
            </button>
          ))}
        </div>
      </FilterAccordion>

      {/* Color Filter */}
      <FilterAccordion title="Color">
        <div className="color-grid">
          {availableColors.map(color => (
            <button 
              key={color}
              className={`color-swatch ${selectedColors.includes(color) ? 'active' : ''}`}
              onClick={() => toggleColor(color)}
              title={color}
              style={{ backgroundColor: color.toLowerCase() }}
            />
          ))}
        </div>
      </FilterAccordion>

      {/* Discount Filter */}
      <FilterAccordion title="Discount">
        <label className="filter-checkbox">
          <input 
            type="checkbox" 
            checked={onSaleOnly}
            onChange={(e) => setOnSaleOnly(e.target.checked)}
          />
          <span>On Sale</span>
        </label>
      </FilterAccordion>

    </div>
  );
};

export default ProductFilters;