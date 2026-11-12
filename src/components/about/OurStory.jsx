import { motion } from 'framer-motion';
import './OurStory.css';

const OurStory = () => {
  return (
    <section id="our-story" className="our-story-section">
      <div className="our-story-container">
        
        <motion.div 
          className="story-image-col"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <img src="https://images.unsplash.com/photo-1480455624313-e29b44bbfde1?q=80&w=800&auto=format&fit=crop" alt="AURA Story" />
        </motion.div>

        <motion.div 
          className="story-text-col"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="story-eyebrow">OUR STORY</span>
          <h2 className="story-heading">A Different Perspective on Everyday Style.</h2>
          
          <div className="story-paragraphs">
            <p>AURA was created around a simple belief: fashion should feel as individual as the person wearing it.</p>
            <p>We bring together contemporary design and timeless inspiration to make discovering your personal style feel effortless.</p>
            <p>From everyday essentials to statement pieces, every collection reflects our appreciation for thoughtful design, versatility, and confidence.</p>
            <p>Our goal is simple: to make style feel natural, personal, and timeless.</p>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default OurStory;