import React, { useState, useEffect } from 'react';
import { Toast } from 'react-bootstrap';

const Snackbar = ({ message, show, onHide }) => {
  const [showToast, setShowToast] = useState(show);

  useEffect(() => {
    if (show) {
      setShowToast(true);
      // Automatically hide the Snackbar after 3 seconds
      const timer = setTimeout(() => {
        setShowToast(false);
        if (onHide) onHide(); // Call the onHide function to update parent component
      }, 3000);

      // Cleanup timeout if the component unmounts or show changes
      return () => clearTimeout(timer);
    }
  }, [show, onHide]);

  const handleClose = () => {
    setShowToast(false);
    if (onHide) onHide(); // Ensure parent component is notified to hide Snackbar
  };

  return (
    <Toast
      onClose={handleClose}
      show={showToast}
      delay={3000}
      autohide
      style={{
        position: 'fixed',
        marginTop: '75px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: '9999',
        backgroundColor: 'red', // Red background for error
        color: 'white', // White text color
        width: '310px', // Adjust width to make the toast smaller
        fontSize: '14px',
      }}
    >
      <Toast.Body>{message}</Toast.Body>
    </Toast>
  );
};

export default Snackbar;
