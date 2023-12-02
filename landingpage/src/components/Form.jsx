import React, { useState } from "react";
import styles from "../style";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    company: "",
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Form submission logic goes here
    // console.log("Form Data Submitted:", formData);
    setFormData({ name: "", email: "", message: "" }); // Reset form fields
  };

  return (
    <div className={`${styles.flexCenter}`}>
      <div className="w-full max-w-md px-4">
        <h1 className={`${styles.heading2} text-center mb-6`}>
          Kontaktiere uns
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="Firmennamen"
            className="w-full p-2 mb-4 border rounded"
          />
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Dein Name"
            className="w-full p-2 mb-4 border rounded"
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Deine Email"
            className="w-full p-2 mb-4 border rounded"
          />
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Beschreibe deine Firma kurz"
            className="w-full p-2 mb-4 border rounded"
            rows="4"
          ></textarea>
          <button
            type="submit"
            className={`py-2 px-6 font-poppins font-medium text-[18px] text-primary bg-blue-gradient rounded-[10px] outline-none ${styles}`}
          >
            Einreichen
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
