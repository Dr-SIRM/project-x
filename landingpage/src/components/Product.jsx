import React from "react";
import styles from "../style";
import { Footer } from "../components";
import Button from "./Button";
import Dashboard from "../assets/Dashboard.png"; // adjust the path to where your image is stored
import Gif1 from "../assets/Gif1.gif";
import Gif2 from "../assets/Gif2.gif";
import Gif3 from "../assets/Gif3.gif";

const Product = () => {
  return (
    <div className={`${styles.padding} text-white`}>
      {/* Assuming a dark background for the white text */}
      <h1 className={`${styles.heading2} text-center mb-6`}>Produkt</h1>
      {/* Introductory text */}
      <p className="text-center mb-6">
        Willkommen zur Schichtplanungsrevolution! Unsere Lösung macht Planung
        zum Kinderspiel, berücksichtigt Mitarbeiterwünsche und eliminiert Fehler
        – alles mit einem Hauch von Datenmagie. Mach dich bereit für ein
        effizientes und spaßiges Planungserlebnis!
      </p>
      {/* Section 1 */}
      <div className="flex flex-row items-center mb-6">
        <div className="w-1/2 pr-8 flex justify-center">
          <img
            src={Gif2}
            alt="GIF 1"
            style={{ Width: "400px", height: "300px" }}
            className="rounded-lg"
          />
        </div>
        <div className="w-1/2">
          <div
            className={`p-8 rounded-[20px] hover:bg-blue-700 transition-all duration-300 ${styles.marginX} feedback-card`}
          >
            <div className="flex flex-col items-start">
              <h2 className={`${styles.heading3} text-lg mb-2`}>
                Verfügbarkeit
              </h2>
              <p className={`${styles.paragraph}`}>
                Minimiert manuellen Aufwand durch automatisierte Prozesse.
                Minimiert manuellen Aufwand durch automatisierte Prozesse.
                Minimiert manuellen Aufwand durch automatisierte Prozesse.
                Minimiert manuellen Aufwand durch automatisierte Prozesse.
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Section 2 */}
      <div className="flex flex-row items-center mb-6">
        <div className="w-1/2">
          <div
            className={`p-8 rounded-[20px] hover:bg-blue-700 transition-all duration-300 ${styles.marginX} feedback-card`}
          >
            <div className="flex flex-col items-start">
              <h2 className={`${styles.heading2} text-lg mb-2`}>Planung </h2>
              <p className={`${styles.paragraph}`}>
                Berücksichtigt Mitarbeiterpräferenzen bei der Planung.
                Berücksichtigt Mitarbeiterpräferenzen bei der Planung.
                Berücksichtigt Mitarbeiterpräferenzen bei der Planung.
                Berücksichtigt Mitarbeiterpräferenzen bei der Planung.
              </p>
            </div>
          </div>
        </div>
        <div className="w-1/2 pl-8 flex justify-center">
          <img
            src={Gif1}
            alt="GIF 1"
            style={{ Width: "400px", height: "300px" }}
            className="rounded-lg"
          />
        </div>
      </div>
      {/* Section 3 */}
      <div className="flex flex-row items-center mb-6">
        <div className="w-1/2 pr-8 flex justify-center">
          <img
            src={Gif2}
            alt="GIF 1"
            style={{ Width: "400px", height: "300px" }}
            className="rounded-lg"
          />
        </div>
        <div className="w-1/2">
          <div
            className={`p-8 rounded-[20px] hover:bg-blue-700 transition-all duration-300 ${styles.marginX} feedback-card`}
          >
            <div className="flex flex-col items-start">
              <h2 className={`${styles.heading2} text-lg mb-2`}>
                Anforderungen
              </h2>
              <p className={`${styles.paragraph}`}>
                Reduziert Fehler durch datengetriebene Entscheidungen. Reduziert
                Fehler durch datengetriebene Entscheidungen. Reduziert Fehler
                durch datengetriebene Entscheidungen. Reduziert Fehler durch
                datengetriebene Entscheidungen. Reduziert Fehler durch
                datengetriebene Entscheidungen.
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Section 4 */}
      <div className="flex flex-row items-center mb-6">
        <div className="w-1/2">
          <div
            className={`p-8 rounded-[20px] hover:bg-blue-700 transition-all duration-300 ${styles.marginX} feedback-card`}
          >
            <div className="flex flex-col items-start">
              <h2 className={`${styles.heading2} text-lg mb-2`}>Solver </h2>
              <p className={`${styles.paragraph}`}>
                Berücksichtigt Mitarbeiterpräferenzen bei der Planung.
                Berücksichtigt Mitarbeiterpräferenzen bei der Planung.
                Berücksichtigt Mitarbeiterpräferenzen bei der Planung.
                Berücksichtigt Mitarbeiterpräferenzen bei der Planung.
              </p>
            </div>
          </div>
        </div>
        <div className="w-1/2 pl-8 flex justify-center">
          <img
            src={Gif3}
            alt="GIF 1"
            style={{ Width: "400px", height: "300px" }}
            className="rounded-lg"
          />
        </div>
      </div>
      {/* Section 5 */}
      <div className="flex flex-row items-center mb-6">
        <div className="w-1/2 pr-8 flex justify-center">
          <img
            src={Gif2}
            alt="GIF 1"
            style={{ Width: "400px", height: "300px" }}
            className="rounded-lg"
          />
        </div>
        <div className="w-1/2">
          <div
            className={`p-8 rounded-[20px] hover:bg-blue-700 transition-all duration-300 ${styles.marginX} feedback-card`}
          >
            <div className="flex flex-col items-start">
              <h2 className={`${styles.heading2} text-lg mb-2`}>Features</h2>
              <p className={`${styles.paragraph}`}>
                Reduziert Fehler durch datengetriebene Entscheidungen. Reduziert
                Fehler durch datengetriebene Entscheidungen. Reduziert Fehler
                durch datengetriebene Entscheidungen. Reduziert Fehler durch
                datengetriebene Entscheidungen.
              </p>
            </div>
          </div>
        </div>
      </div>
      <h1 className={`${styles.heading3} text-center mb-6`}>
        Youtube Kurzanleitung
      </h1>
      {/* Image section */}
      <div className="flex justify-center my-4 pt-100">
        {/* Additional div for the image with margins */}
        <img
          src={Dashboard}
          alt="Description of image"
          className="max-w-full h-auto rounded-lg"
        />
        {/* Use appropriate alt description */}
      </div>
    </div>
  );
};

export default Product;
