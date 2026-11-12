import './ShopHero.css';

const ShopHero = ({ title, description, image }) => {
  return (
    <div className="shop-hero">
      <div className="shop-hero-content">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="shop-hero-image">
        <img src={image} alt={title} />
      </div>
    </div>
  );
};

export default ShopHero;