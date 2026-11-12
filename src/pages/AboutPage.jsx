import AboutHero from '../components/about/AboutHero';
import OurStory from '../components/about/OurStory';
import BrandPhilosophy from '../components/about/BrandPhilosophy';
import BrandValues from '../components/about/BrandValues';
import CollectionIntroduction from '../components/about/CollectionIntroduction';
import OurVision from '../components/about/OurVision';
import AboutCampaignBanner from '../components/about/AboutCampaignBanner';

const AboutPage = () => {
  return (
    <div 
      style={{ 
        width: '100%', 
        maxWidth: '100%', 
        overflow: 'hidden', /* Prevents horizontal scrollbar just on this page */
        display: 'flex', 
        flexDirection: 'column' 
      }}
    >
      <AboutHero />
      <OurStory />
      <BrandPhilosophy />
      <BrandValues />
      <CollectionIntroduction />
      <OurVision />
      <AboutCampaignBanner />
    </div>
  );
};

export default AboutPage;