import { useParams, Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';
import ProductGallery from '../../components/product/ProductGallery';
import ProductInfoPanel from '../../components/product/ProductInfoPanel';
import { useStoreProducts } from '../../hooks/useStoreProducts'; // <-- IMPORT HOOK
import './ProductDetailsPage.css';

const ProductDetailsPage = () => {
  const { slug } = useParams();
  
  // Get live DB products
  const { products, loading } = useStoreProducts();

  // Find by SKU/slug or Firebase ID
  const product = products.find(p => p.slug === slug || p.id === slug);

  if (loading) {
    return <div style={{ padding: '10rem', textAlign: 'center' }}>Loading product details...</div>;
  }

  if (!product) {
    return (
      <div className="product-not-found">
        <h2>Product Not Found</h2>
        <p>This item may be out of stock or no longer available.</p>
        <Link to="/shop" className="btn-primary">Return to Shop</Link>
      </div>
    );
  }

  const productImages = product.images || (product.image ? [product.image] : []);

  return (
    <div className="product-page-wrapper">
      <div className="product-breadcrumbs">
        <Link to="/">Home</Link>
        <FiChevronRight size={14} />
        <Link to="/shop">Shop</Link>
        <FiChevronRight size={14} />
        <Link to={`/shop/${product.category}`}>{product.category}</Link>
        <FiChevronRight size={14} />
        <span className="current">{product.name}</span>
      </div>

      <div className="product-layout-premium">
        <div className="product-left-col">
          {productImages.length > 0 ? (
            <ProductGallery images={productImages} />
          ) : (
            <div className="no-image">No Image Available</div>
          )}
        </div>

        <div className="product-right-col">
          <ProductInfoPanel product={product} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;