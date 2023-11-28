import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import styles from "./style";
import { Billing, Business, CardDeal, Clients, CTA, Footer, Navbar, Stats, Testimonials, Hero, Conditions, Product } from "./components";

const App = () => (
  <Router>
    <div className="bg-primary w-full overflow-hidden">
      <div className={`${styles.paddingX} ${styles.flexCenter}`}>
        <div className={`${styles.boxWidth}`}>
          <Navbar />
        </div>
      </div>

      <Routes>
        {/* Redirect from base URL to /home */}
        <Route path="/" element={<Navigate replace to="/home" />} />

        <Route path="/home" element={
          <>
            <div className={`bg-primary ${styles.flexStart}`}>
              <div className={`${styles.boxWidth}`}>
                <Hero />
              </div>
            </div>
            
            <div className={`bg-primary ${styles.paddingX} ${styles.flexCenter}`}>
              <div className={`${styles.boxWidth}`}>
                <Stats />
                <Business />
                {/* <Billing /> */}
                {/* <CardDeal /> */}
                <CTA />
                {/* Contact Form */}
                {/* <Testimonials /> */}
                <Footer />
              </div>
            </div>
          </>
        } />

        <Route path="/Conditions" element={
          <div className={`bg-primary ${styles.paddingX} ${styles.flexCenter}`}>
            <div className={`${styles.boxWidth}`}>
              <Conditions />
            </div>
          </div>
        } />

        <Route path="/product" element={
          <div className={`bg-primary ${styles.paddingX} ${styles.flexCenter}`}>
            <div className={`${styles.boxWidth}`}>
              <Product />
            </div>
          </div>
        } />

        {/* Add more routes as needed */}
      </Routes>
    </div>
  </Router>
);

export default App;
