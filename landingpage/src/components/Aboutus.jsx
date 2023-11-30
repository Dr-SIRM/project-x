import React from "react";
import styles from "../style";
import Aboutus from "../assets/Aboutus.png"; // adjust the path to where your image is stored

const About = () => {
  return (
    <div className={`${styles.padding} text-white`}>
      {" "}
      {/* Assuming a dark background for the white text */}
      <h1 className={`${styles.heading2} text-center mb-6`}>Über uns</h1>
      {/* Introductory text */}
      <p className="text-center mb-6">
        Es war einmal
        Problem bie einem erfolgreiches Fitness Unternehmen
        
        Tauche ein in die Welt hinter unserer Schichtplanungs-Zauberei! Wir sind
        ein Team aus Datenmagiern und Planungsvirtuosen, die mit Technologie,
        Menschlichkeit und Innovation die Arbeitswelt revolutionieren. Erfahre
        mehr über unsere spannende Reise von kleinen Anfängen zu großen Ideen,
        unsere leuchtenden Werte und wie wir mit Herz, Hirn und Humor die
        Zukunft der Schichtplanung gestalten!
      </p>
      {/* Image section */}
      <div className="flex flex-col justify-center items-center my-4">
        {" "}
        {/* Flex container with column direction */}
        <img
          src={Aboutus}
          alt="Description of image"
          className="max-w-full h-auto rounded-lg"
        />{" "}
        {/* Image with alt description */}
        <p className="text-center mt-2">
          v.L.n.R Gery Müller, Phu Nguyen, Robin Martin
        </p>{" "}
        {/* Description text under the image */}
      </div>
      {/* Quote section with box, different background, and rounded border */}
      <div className="rounded-lg border-2 border-gray-300 bg-gray-800 p-4 mt-12 mx-auto max-w-2xl">
        <p className="italic text-lg">
          "Simple und Sexy, deine Liebhaber für revolutioniertes schichplanen"
"
        </p>
        <p className="mt-4">Gery, Phu und Robin</p>
      </div>
    </div>
  );
};

export default About;
