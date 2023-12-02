import React from 'react';

const UpButton = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button 
      onClick={scrollToTop} 
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: '#fff', // or any color that fits your design
        color: 'black', // color of the text/icon
        border: 'none',
        borderRadius: '50%',
        width: '40px', // size of the button
        height: '40px', // size of the button
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)', // optional shadow for better visibility
      }}
      aria-label="Scroll to Top"
    >
      &#8679; {/* Unicode for up-pointing arrow */}
    </button>
  );
};

export default UpButton;
