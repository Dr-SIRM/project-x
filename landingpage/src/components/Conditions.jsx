import React from "react";
import styles from "../style";
import { Footer } from '../components';
import Button from "./Button";

const Conditions = () => {
  return (
    <div className={styles.padding}>
      <h1 className={`${styles.heading2} text-center mb-6`}>Preise</h1>

      {/* Introductory text about the conditions */}
      <p className="text-center mb-6 text-white">
        Hier finden Sie eine Übersicht unserer Preispläne und die jeweiligen Konditionen. Wählen Sie das für Sie passende Angebot.
      </p>

      <div className={`flex justify-center ${styles.marginY}`}>
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 md:max-w-[1140px]">
          {["Small business", "Big business", "Enterprise Business"].map((plan, index) => (
            <div 
              key={index}
              className={`flex flex-col items-center px-10 py-12 rounded-[20px] w-full sm:w-[370px] max-w-[370px] bg-blue-800 hover:bg-blue-700 transition-all duration-300 ${styles.marginX} feedback-card`}
            >
              <h2 className={`${styles.heading2} text-xl mb-4 text-white`}>{plan}</h2>
              <h2 className={`${styles.paragraph} mb-2 text-l mb-4 text-white`}>Features</h2>
              <p className={`${styles.paragraph} mb-2`}>abc</p>
              <p className={`${styles.paragraph} mb-2`}>Cost: CHF XX.XX</p>
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
