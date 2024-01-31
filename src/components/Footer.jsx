// components/Footer.jsx
import React from "react";

const Footer = () => {
  return (
    <footer className="bg-black text-white p-4 relative">
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between">
        <p className="text-center lg:text-left mb-4 lg:mb-0">
          © 2023 Sarvagna Kadiya
        </p>
        <div className="flex justify-center lg:justify-end">
          <a
            href="https://modedomains.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-teal-500 hover:bg-teal-600 text-gray-800 font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline"
          >
            visit mode domains
          </a>
        </div>
      </div>
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-800"></div>
    </footer>
  );
};

export default Footer;
