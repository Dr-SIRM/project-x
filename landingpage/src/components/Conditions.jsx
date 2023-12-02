import React from "react";
import styles from "../style";
import Button from "./Button";

// Define an array with the content for each plan
const plans = [
  {
    title: "Small Business",
    features: ["bis zu 10 MA"],
    cost: "CHF 39.95 inkl. MwSt.",
  },
  {
    title: "Medium Business",
    features: ["11 - 30 MA"],
    cost: "CHF 59.95 inkl. MwSt.",
  },
  {
    title: "Large Business",
    features: ["31 - 50 MA"],
    cost: "CHF 69.95 inkl. MwSt.",
  },
  {
    title: "Enterprise Business",
    features: ["50 + MA"],
    cost: "auf Anfrage",
  },
];

const Conditions = () => {
  return (
    <div className={styles.padding}>
      <h1 className={`${styles.heading2} text-center mb-6`}>Preise</h1>
      <p className="text-center mb-6 text-white">
        Hier finden Sie eine Übersicht unserer Preispläne und die jeweiligen Konditionen. Wählen Sie das für Sie passende Angebot.
      </p>

      <div className={`flex justify-center ${styles.marginY}`}>
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 md:max-w-[1140px]">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`flex flex-col items-center px-10 py-12 rounded-[20px] w-full sm:w-[370px] max-w-[370px] bg-blue-800 hover:bg-blue-700 transition-all duration-300 ${styles.marginX} feedback-card`}
            >
              <h2 className={`${styles.heading2} text-xl mb-4 text-white text-center`}>{plan.title}</h2>
              <ul>
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className={`${styles.paragraph} mb-2 text-center`}>
                    {feature}
                  </li>
                ))}
              </ul>
              <p className={`${styles.paragraph} mb-2 text-center`}>{plan.cost}</p>
              <div className="flex justify-center w-full mt-10">
                <Button />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Conditions;




/* Kleines Unternehmen
-10 MA
Kosten: CHF 39.95 inkl. MwSt.

Mittleres Unternehmen
11-30 MA
Kosten: CHF 59.95 inkl. MwSt.

Grosses Unternehmen
31 - 50 MA
Kosten: CHF 69.95 inkl. MwSt.

Enterprise Geschäft
50+ MA
Kosten: auf Anfrage */

