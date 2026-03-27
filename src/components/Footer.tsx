import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-3">
        <p className="text-2xl text-primary" style={{ fontFamily: "'Indie Flower', cursive" }}>
          Pets are family.
        </p>
        <p className="text-xs text-gray-400">© 2026 Goodle Inc.</p>
      </div>
    </footer>
  );
};

export default Footer;