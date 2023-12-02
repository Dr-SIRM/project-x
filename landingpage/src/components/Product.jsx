import React from "react";
import styles from "../style";
import { Footer } from "../components";
import Button from "./Button";
import Dashboard from "../assets/Dashboard.png"; // adjust the path to where your image is stored
import gif_schichtplan from "../assets/gif_schichtplan.gif";
import gif_planung from "../assets/gif_planung.gif";
import gif_anforderungen from "../assets/gif_anforderungen.gif";
import gif_solver from "../assets/gif_solver.gif";
import billImage from "../assets/bill.png";



const Product = () => {
  return (
    <div className={`${styles.padding} text-white`}>
      {/* Assuming a dark background for the white text */}
      <h1 className={`${styles.heading2} text-center mb-6`}>Produkt</h1>
      {/* Introductory text */}
      <p className="text-center mb-6">
      Schichtplanung ohne Kopfzerbrechen beginnt jetzt bei dir! 
      Unsere Software führt dich spielerisch durch den Prozess, 
      berücksichtigt jeden deiner Mitarbeiterwünsche und sorgt für 
      einen fehlerfreien Ablauf. Bereite dich auf ein Planungserlebnis vor, 
      das so angenehm ist, dass es fast schon Spass macht.
      </p>
      {/* Schichtplan */}
      <div className="flex flex-row items-center mb-6">
        <div className="w-1/2 pr-8 flex justify-center">
          <img
            src={gif_schichtplan}
            alt="Schichtplan"
            style={{ Width: "400px", height: "300px" }}
            className="rounded-lg"
          />
        </div>
        <div className="w-1/2">
          <div
            className={`p-8 rounded-[20px] hover:bg-gray-400 ${styles.marginX} feedback-card`}
          >
            <div className="flex flex-col items-start">
              <h2 className={`${styles.heading3} text-lg mb-2`}>
                Schichtplan
              </h2>
              <p className={`${styles.paragraph}`}>
                Unser intuitiver Schichtplan ist übersichtlich und leicht verständlich.
                Mit wenigen Klicks kannst du eingeplante Schichten umplanen oder stornieren.

              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Planung */}
      <div className="flex flex-row items-center mb-6">
        <div className="w-1/2">
          <div
            className={`p-8 rounded-[20px] hover:bg-gray-400 ${styles.marginX} feedback-card`}
          >
            <div className="flex flex-col items-start">
              <h2 className={`${styles.heading3} text-lg mb-2`}>Planung </h2>
              <p className={`${styles.paragraph}`}>
              Unsere Software hilft dir, präzise die richtige Anzahl an Mitarbeitern zur 
              richtigen Zeit am richtigen Ort zu planen – effizient und unkompliziert.
              </p>
            </div>
          </div>
        </div>
        <div className="w-1/2 pl-8 flex justify-center">
          <img
            src={gif_planung}
            alt="Planung"
            style={{ Width: "400px", height: "300px" }}
            className="rounded-lg"
          />
        </div>
      </div>
      {/* Anforderungen */}
      <div className="flex flex-row items-center mb-6">
        <div className="w-1/2 pr-8 flex justify-center">
          <img
            src={gif_anforderungen}
            alt="Anforderungen"
            style={{ Width: "400px", height: "300px" }}
            className="rounded-lg"
          />
        </div>
        <div className="w-1/2">
          <div
            className={`p-8 rounded-[20px] hover:bg-gray-400 ${styles.marginX} feedback-card`}
          >
            <div className="flex flex-col items-start">
              <h2 className={`${styles.heading3} text-lg mb-3`}>
                Anforderungen
              </h2>
              <p className={`${styles.paragraph}`}>
              Passgenaue Schichtpläne erstellen: Unsere Software berücksichtigt alle spezifischen Anforderungen, 
              die du als Admin festlegst. Von Mindest- und Höchstarbeitszeiten über die Einarbeitungsphasen 
              neuer Mitarbeiter bis hin zu Teams, die nicht gemeinsam eingesetzt werden können – wir sorgen dafür, 
              dass deine Planung alle Kriterien erfüllt.
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Solver */}
      <div className="flex flex-row items-center mb-6">
        <div className="w-1/2">
          <div
            className={`p-8 rounded-[20px] hover:bg-gray-400 ${styles.marginX} feedback-card`}
          >
            <div className="flex flex-col items-start">
              <h2 className={`${styles.heading3} text-lg mb-2`}>Solver </h2>
              <p className={`${styles.paragraph}`}>
                Berücksichtigt Mitarbeiterpräferenzen bei der Planung.

              </p>
            </div>
          </div>
        </div>
        <div className="w-1/2 pl-8 flex justify-center">
          <img
            src={gif_solver}
            alt="Solver"
            style={{ Width: "400px", height: "300px" }}
            className="rounded-lg"
          />
        </div>
      </div>
      {/* Features */}
      <div className="flex flex-row items-center mb-6">
        <div className="w-1/2 pr-8 flex justify-center">
          <img
            src={billImage}
            alt="Features Bild"
            style={{ width: "400px", height: "300px" }}
            className="rounded-lg"
          />
        </div>
        <div className="w-1/2">
          <div className={`p-8 rounded-[20px] hover:bg-gray-400 ${styles.marginX} feedback-card`}>
            <div className="flex flex-col items-start">
              <h2 className={`${styles.heading2} text-lg mb-2`}>Features</h2>
              <p className={`${styles.paragraph}`}>
                Reduziert Fehler durch datengetriebene Entscheidungen...
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
