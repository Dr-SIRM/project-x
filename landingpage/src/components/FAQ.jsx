import React, { useState } from "react";
import styles from "../style";

const Faq = () => {
  // An array of FAQs, each with a question and answer
  const faqs = [
    {
      question: "Was ist TimeTab?",
      answer:
        "TimeTab ist eine Schichtplanungssoftware, welche dich bei der Einplanung deiner Mitarbeiter unterstütz und die best mögliche Lösung berechnet",
    },
    {
      question: "Wie starte ich?",
      answer: "Du startest einfach indem du dich registrierts Link.",
    },
    {
      question: "Was sind die Abokosten?",
      answer:
        "Die Abokosten sind abhängig von der Unternhemensgrösse und sind auf Kondition ansehbar. Dahinter stecken keine Zusatzkosten.",
    },
  ];

  // State to track the currently active FAQ item
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  return (
    <div className={styles.padding}>
      <h1 className={`${styles.heading3} text-center mb-6`}>
        Frequently Asked Questions
      </h1>

      <div className={`${styles.flexCenter} flex-col`}>
        {faqs.map((faq, index) => (
          <div
            key={index}
            className={`w-full px-4 py-2 mb-2 border-b border-gray-300 cursor-pointer ${
              activeIndex === index ? "bg-black-100" : ""
            }`}
            onClick={() => toggleFAQ(index)}
          >
            <h2 className={`${styles.heading4}`}>{faq.question}</h2>{" "}
            {/* Use heading4 for questions */}
            <p
              className={`pl-4 text-white ${
                activeIndex === index ? "block" : "hidden"
              }`}
            >
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Faq;
