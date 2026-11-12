import './SectionHeading.css';

const SectionHeading = ({ eyebrow, title, description, align = "left" }) => {
  return (
    <div className={`section-heading ${align === "center" ? "text-center" : ""}`}>
      {eyebrow && (
        <div className="heading-eyebrow">
          <span className="line"></span>
          <span>{eyebrow}</span>
        </div>
      )}
      <h2 className="heading-title">{title}</h2>
      {description && <p className="heading-description">{description}</p>}
    </div>
  );
};

export default SectionHeading;