import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';
import Footer from './Footer';
import { PageTitleProvider } from '../context/PageTitleContext';

const PublicLayout: React.FC = () => {
  return (
    <PageTitleProvider>
      <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
        <PublicNavbar />
        <main className="flex-grow">
          <Outlet />
        </main>
        <Footer />
      </div>
    </PageTitleProvider>
  );
};

export default PublicLayout;
