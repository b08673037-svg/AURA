import { Link } from 'react-router-dom';
import './InfoPage.css';

const ReturnsPage = () => {
  return (
    <div className="info-page-wrapper">
      <div className="info-hero">
        <span className="info-eyebrow">AURA POLICIES</span>
        <h1>Returns & Exchanges</h1>
        <p>We want you to love your AURA pieces. If something isn't right, we're here to help.</p>
      </div>

      <div className="info-content">
        <h2>14-Day Return Policy</h2>
        <p>We offer a 14-day return and exchange policy on unworn items with original tags attached. If 14 days have gone by since your purchase, unfortunately, we can’t offer you a refund or exchange.</p>

        <h2>Eligibility for Returns</h2>
        <p>To be eligible for a return, your item must be unused and in the same condition that you received it. It must also be in the original packaging with all tags attached.</p>
        <ul>
          <li>Items must be unworn, unwashed, and free of any makeup or deodorant stains.</li>
          <li>Original tags must be attached.</li>
          <li>Footwear must be returned in its original box.</li>
        </ul>

        <h2>How to Start a Return</h2>
        <p>To initiate a return, please contact our customer care team at <strong>hello@aura.com</strong> with your order number and the reason for your return. Our team will guide you through the process.</p>

        <h2>Refunds</h2>
        <p>Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. If approved, your refund will be processed to your original method of payment within 5-7 business days.</p>

        <h2>Exchanges</h2>
        <p>If you need to exchange an item for a different size or color, please contact us. Exchanges are subject to stock availability.</p>

        <div className="info-cta">
          <Link to="/contact" className="btn-primary">Contact Customer Care</Link>
        </div>
      </div>
    </div>
  );
};

export default ReturnsPage;