import React from "react";
import styles from "../style";
import {Footer} from '../components';
import Button from "./Button";

const Conditions = () => {
  return (
    <div className={`${styles.padding}`}>
      <h1 className={`${styles.heading2} text-center mb-6`}>Preise</h1>

      <div className={`flex justify-center ${styles.marginY}`}>
        <div className="flex justify-between w-full md:max-w-[1140px]"> {/* Adjust the max-width as needed */}
          {["Small business", "Big business", "Enterprise Businessd"].map((plan, index) => (
            <div 
              key={index} 
              className={`flex justify-between flex-col px-10 py-12 rounded-[20px] max-w-[370px] bg-blue-800 hover:bg-blue-700 transition-all duration-300 ${styles.marginX} last:mr-0 feedback-card`}
            >
              <h2 className={`${styles.heading2} text-xl mb-4 text-white`}>{plan}</h2>
              <h2 className={`${styles.paragraph} mb-2 text-l mb-4 text-white`}>Features</h2>
              <p className={`${styles.paragraph} mb-2`}>abc</p>
              <p className={`${styles.paragraph} mb-2`}>Cost: CHF XX.XX</p>
              <div className={`${styles.flexCenter} sm:ml-10 ml-0 sm:mt-0 mt-10 p`}>
                <Button />
              </div>

              {/* You can add more details below, like features or benefits */}
            </div>
          ))}
        </div>
      </div>


      <Footer />
    </div>
  );
};

export default Conditions;
