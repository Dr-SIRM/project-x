import React from "react";
import styles from "../style";
import { Footer } from '../components';
import Button from "./Button";
import Dashboard from '../assets/Dashboard.png'; // adjust the path to where your image is stored


const Product = () => {
  return (
    <div className={`${styles.padding} text-white`}> {/* Assuming a dark background for the white text */}
      <h1 className={`${styles.heading2} text-center mb-6`}>Produkt</h1>

      {/* Introductory text */}
      <p className="text-center mb-6">
        Unser automatisiertes Schichtplanungstool minimiert manuellen Planungsaufwand, optimiert die Einsatzplanung unter Berücksichtigung von Mitarbeiterpräferenzen, sowie reduziert potenzielle Fehlerquellen durch intelligente, datengetriebene Entscheidungsunterstützung.
      </p>

      {/* Image section */}
      <div className="flex justify-center my-4"> {/* Additional div for the image with margins */}
        <img src={Dashboard} alt="Description of image" className="max-w-full h-auto rounded-lg" /> {/* Use appropriate alt description */}
      </div>

      <div className={`${styles.marginY} w-full`}> {/* Container should be full width */}
        {[
          { title: "Automatisierung", description: "Minimiert manuellen Aufwand durch automatisierte Prozesse." }, 
          { title: "Optimierung", description: "Berücksichtigt Mitarbeiterpräferenzen bei der Planung." }, 
          { title: "Intelligenz", description: "Reduziert Fehler durch datengetriebene Entscheidungen." }
        ].map((feature, index) => (
          <div 
            key={index}
            className={`p-6 rounded-[20px]  hover:bg-blue-700 transition-all duration-300 mb-4 last:mb-0 ${styles.marginX} feedback-card`} // Consistent styling with the conditions page
          >
            <div className="flex flex-col items-start"> {/* Align content to the start */}
              <h2 className={`${styles.heading2} text-lg mb-2`}>{feature.title}</h2>
              <p className={`${styles.paragraph}`}>{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
};

export default Product;
