// Home.js
import React from 'react';
import { Stats, Business, Billing, CardDeal, CTA, Footer, Navbar, Testimonials, Clients, Hero } from '../components';

const Home = () => (
  <div>
    <div className={`bg-primary ${styles.flexStart}`}>
      <div className={`${styles.boxWidth}`}>
        <Hero />
      </div>
    </div>
    <Stats />
    <Business />
    <Billing />
    <CardDeal />
    <Testimonials />
    <Clients />
    <CTA />
    <Footer />
  </div>
);

export default Home;
