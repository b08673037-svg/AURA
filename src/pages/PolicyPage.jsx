import { useLocation } from 'react-router-dom';
import './InfoPage.css';

const PolicyPage = () => {
  const location = useLocation();
  const path = location.pathname;

  // Content mapping based on the route
  const contentData = {
    "/privacy": {
      eyebrow: "AURA POLICIES",
      title: "Privacy Policy",
      content: (
        <>
          <h2>Information We Collect</h2>
          <p>When you visit AURA, we collect certain information about your device, your interaction with the site, and information necessary to process your purchases. We may also collect additional information if you contact us for customer support.</p>
          
          <h2>How We Use Your Information</h2>
          <p>We use the information we collect to fulfill any orders placed through the site (including processing your payment information, arranging for shipping, and providing you with invoices and/or order confirmations). Additionally, we use this information to communicate with you, screen our orders for potential risk or fraud, and provide you with information or advertising relating to our products or services.</p>
          
          <h2>Sharing Your Personal Information</h2>
          <p>We share your Personal Information with service providers to help us provide our services and fulfill our contracts with you, as described above. For example, we use Firebase to power our online store. We may also share your Personal Information to comply with applicable laws and regulations.</p>
          
          <h2>Contact Us</h2>
          <p>For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by email at hello@aura.com.</p>
        </>
      )
    },
    "/terms": {
      eyebrow: "AURA POLICIES",
      title: "Terms & Conditions",
      content: (
        <>
          <h2>Overview</h2>
          <p>This website is operated by AURA. Throughout the site, the terms “we”, “us” and “our” refer to AURA. We offer this website, including all information, tools and services available from this site to you, the user, conditioned upon your acceptance of all terms, conditions, policies and notices stated here.</p>
          
          <h2>Online Store Terms</h2>
          <p>By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence. You may not use our products for any illegal or unauthorized purpose nor may you, in the use of the Service, violate any laws in your jurisdiction.</p>
          
          <h2>Pricing and Availability</h2>
          <p>Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time. We shall not be liable to you or to any third-party for any modification, price change, suspension or discontinuance of the Service.</p>
          
          <h2>Governing Law</h2>
          <p>These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of Pakistan.</p>
        </>
      )
    },
    "/careers": {
      eyebrow: "JOIN THE TEAM",
      title: "Careers at AURA",
      content: (
        <>
          <h2>Join Our Vision</h2>
          <p>At AURA, we are always looking for passionate, creative, and driven individuals to join our growing team. We believe in fostering a culture of innovation, inclusivity, and excellence.</p>
          
          <h2>Current Openings</h2>
          <p>We currently do not have any open positions. However, we are always happy to receive speculative applications from talented individuals who share our vision for timeless style and everyday confidence.</p>
          
          <h2>How to Apply</h2>
          <p>If you are interested in joining our team, please send your resume and a brief cover letter to careers@aura.com. We will keep your information on file for future opportunities.</p>
        </>
      )
    }
  };

  const data = contentData[path];

  if (!data) {
    return (
      <div className="info-page-wrapper" style={{ textAlign: 'center', paddingTop: '10rem' }}>
        <h2>Page Not Found</h2>
      </div>
    );
  }

  return (
    <div className="info-page-wrapper">
      <div className="info-hero">
        <span className="info-eyebrow">{data.eyebrow}</span>
        <h1>{data.title}</h1>
      </div>
      <div className="info-content">
        {data.content}
      </div>
    </div>
  );
};

export default PolicyPage;