import styles from "./style";
import { Billing, Business, CardDeal, Clients, CTA, Footer, Navbar, Stats, Testimonials, Hero, Conditions } from "./components";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

const App = () => (
  <Router>
    <div className="bg-primary w-full overflow-hidden">
      <div className={`${styles.paddingX} ${styles.flexCenter}`}>
        <div className={`${styles.boxWidth}`}>
          <Navbar />
        </div>
      </div>

      <Routes>
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
                <Billing />
                <CardDeal />
                <CTA />
                <Testimonials />
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

        <Route path="/clients" element={
          <div className={`bg-primary ${styles.paddingX} ${styles.flexCenter}`}>
            <div className={`${styles.boxWidth}`}>
              <Clients />
            </div>
          </div>
        } />

        {/* Add other routes as needed */}
      </Routes>
    </div>
  </Router>
);

export default App;
