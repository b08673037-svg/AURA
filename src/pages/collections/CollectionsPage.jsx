import CollectionsHero from '../../components/collections/CollectionsHero';
import CollectionCard from '../../components/collections/CollectionCard';
import SectionHeading from '../../components/common/SectionHeading';
import { collectionsData } from '../../data/collectionData';
import './CollectionsPage.css';

const CollectionsPage = () => {
  return (
    <div className="collections-page-wrapper">
      
      {/* 1. Hero */}
      <CollectionsHero />

      <div className="collections-content">
        {/* 2. Explore Collections Grid */}
        <section id="explore-collections" className="explore-section">
          <SectionHeading 
            eyebrow="DISCOVER" 
            title="Explore Our Collections" 
            description="Find the pieces that reflect your style."
            align="center"
          />
          <div className="collections-grid">
            {collectionsData.map((collection, index) => (
              <CollectionCard 
                key={collection.id} 
                collection={collection} 
                index={index} 
              />
            ))}
          </div>
        </section>
      </div>

    </div>
  );
};

export default CollectionsPage;