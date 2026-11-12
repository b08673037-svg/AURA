import './InfoPage.css';

const ShippingPage = () => {
  return (
    <div className="info-page-wrapper">
      <div className="info-hero">
        <span className="info-eyebrow">AURA POLICIES</span>
        <h1>Shipping & Delivery</h1>
        <p>Everything you need to know about how your AURA pieces reach you.</p>
      </div>

      <div className="info-content">
        <h2>Delivery Within Pakistan</h2>
        <p>We currently offer shipping across Pakistan.</p>
        <ul>
          <li><strong>Standard Delivery:</strong> 3-5 Business Days. Free on orders over PKR 5,000.</li>
          <li><strong>Express Delivery:</strong> 1-2 Business Days. A flat rate of PKR 500 applies.</li>
        </ul>

        <h2>Order Processing</h2>
        <p>Orders are processed Monday through Saturday, excluding public holidays. Orders placed after 2:00 PM will be processed the following business day.</p>

        <h2>Tracking Your Order</h2>
        <p>Once your order has been dispatched, you will receive a tracking number via email. You can also track your order directly on our website by visiting the <strong>Track Order</strong> page.</p>
      </div>
    </div>
  );
};

export default ShippingPage;