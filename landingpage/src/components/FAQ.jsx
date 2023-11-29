import React, { useState } from 'react';
import styles from "../style";

const Faq = () => {
  // An array of FAQs, each with a question and answer
  const faqs = [
    {
      question: "Was ist TimeTab?",
      answer: "This is a description of what the product or service is about."
    },
    {
      question: "Wie starte ich?",
      answer: "Here are the steps to get started with our product/service..."
    },
    {
      question: "Was sind die Abokosten?",
      answer: "We offer various pricing plans, which are..."
    },
    {
      question: "Was sind die Abokosten?",
      answer: "We offer various pricing plans, which are..."
    },
    {
      question: "Was sind die Abokosten?",
      answer: "We offer various pricing plans, which are..."
    },
  ];

  // State to track the currently active FAQ item
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = index => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  return (
    <div className={styles.padding}>
      <h1 className={`${styles.heading3} text-center mb-6`}>Frequently Asked Questions</h1>

      <div className={`${styles.flexCenter} flex-col`}>
        {faqs.map((faq, index) => (
          <div 
            key={index}
            className={`w-full px-4 py-2 mb-2 border-b border-gray-300 cursor-pointer ${activeIndex === index ? 'bg-black-100' : ''}`}
            onClick={() => toggleFAQ(index)}
          >
            <h2 className={`${styles.heading4}`}>{faq.question}</h2> {/* Use heading4 for questions */}
            <p className={`pl-4 text-white ${activeIndex === index ? 'block' : 'hidden'}`}>{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Faq;
