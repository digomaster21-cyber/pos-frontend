// src/components/common/Footer.tsx
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-6">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          &copy; {new Date().getFullYear()} YourCompany. All rights reserved.
        </p>

        <div className="flex space-x-4 mt-2 md:mt-0">
          <a
            href="/privacy"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm"
          >
            Privacy Policy
          </a>
          <a
            href="/terms"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm"
          >
            Terms of Service
          </a>
          <a
            href="https://github.com/yourrepo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
