import { Link } from 'react-router-dom';
import { FiUser, FiShoppingBag, FiGift, FiStar, FiFeather, FiSun, FiZap } from 'react-icons/fi';
import { categoriesData } from '../../data/homeData';
import './CategoryNavigation.css';

// Map icon strings to actual React Icons
const iconMap = {
  shirt: <FiUser />,
  dress: <FiFeather />,
  shoe: <FiZap />,
  bag: <FiShoppingBag />,
  glasses: <FiStar />,
  diamond: <FiSun />,
  flame: <FiGift />,
};

const CategoryNavigation = () => {
  return (
    <div className="category-nav-wrapper">
      <div className="category-nav-container">
        {categoriesData.map((cat) => (
          <div key={cat.id} className="category-item-wrapper">
            <Link to={cat.link} className="category-item">
              <span className="category-icon">{iconMap[cat.icon]}</span>
              <span className="category-name">{cat.name}</span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryNavigation;