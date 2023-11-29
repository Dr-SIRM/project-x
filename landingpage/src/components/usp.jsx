import React from "react";
import styles from "../style";
import Button from "./Button";

// Define an array with the content for each box
const boxes = [
  {
    title: "Effizienz",
    features: [
      "TimeTab minimiert den manuellen Aufwand und automatisiert die Erstellung von Schichtplänen, sodass Sie wertvolle Zeit sparen.",
    ],
    price: "CHF 30.00",
  },
  {
    title: "tbd",
    features: [
      "Durch Berücksichtigung individueller Präferenzen und Verfügbarkeiten bei der automatisierten Schichtplanung trägt unser Tool dazu bei, die Zufriedenheit und Motivation Ihrer Mitarbeiter zu steigern.",
    ],
    price: "CHF 40.00",
  },
  {
    title: "Zuverlässigkeit",
    features: [
      "Mit intelligenten Algorithmen werden Fehler vermieden und eine verlässliche, bedarfsgerechte Personalzuordnung sichergestellt.",
    ],
    price: "CHF 50.00",
  },
];

const Conditions = () => {
  return (
    <div className={styles.padding}>
      <h1 className={`${styles.heading2} text-center mb-6`}>
        Sie machen das Geschäft, wir kümmern uns um die Planung.
      </h1>
      <p className="text-center mb-6 text-white">
        Unser automatisiertes Schichtplanungstool minimiert manuellen
        Planungsaufwand, optimiert die Einsatzplanung unter Berücksichtigung von
        Mitarbeiterpräferenzen, sowie reduziert potenzielle Fehlerquellen durch
        intelligente, datengetriebene Entscheidungsunterstützung.
      </p>

      <div className={`flex justify-center ${styles.marginY}`}>
        <div className="flex flex-nowrap justify-center gap-4 md:gap-2">
          {boxes.map((box, index) => (
            <div
              key={index}
              className={`flex flex-col items-center px-5 py-12 rounded-[20px] w-[300px] bg-blue-800 hover:bg-blue-700 transition-all duration-300 ${styles.marginX} feedback-card`}
            >
              <div className="flex justify-center items-center w-full">
                <h2 className={`${styles.heading3} text-xl mb-4 text-white`}>
                  {box.title}
                </h2>
              </div>
              {/* <h2 className={`${styles.paragraph} mb-2 text-l mb-4 text-white`}>
                Features
              </h2> */}
              {box.features.map((feature, featureIndex) => (
                <p key={featureIndex} className={`${styles.paragraph} mb-2`}>
                  {feature}
                </p>
              ))}
              <p className={`${styles.paragraph} mb-2`}>{box.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Conditions;
