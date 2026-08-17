import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import './MainLayout.css';

export const MainLayout = ({ children }) => {
  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        {children || <Outlet />}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
