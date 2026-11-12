import { motion, AnimatePresence } from 'framer-motion';
import './ConfirmModal.css';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", isDestructive = false }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />
          <div className="modal-wrapper">
            <motion.div 
              className="confirm-modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              <h3>{title}</h3>
              <p>{message}</p>
              
              <div className="modal-actions">
                <button className="btn-secondary modal-btn" onClick={onCancel}>
                  Cancel
                </button>
                <button 
                  className={`modal-btn ${isDestructive ? 'btn-destructive' : 'btn-primary'}`} 
                  onClick={() => { onConfirm(); onCancel(); }}
                >
                  {confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;