import React from "react";
import styles from "../style";

const Datasecurity = () => {
  return (
    <div className={`${styles.padding} text-white`}>
      <h1 className={`${styles.heading2} text-center mb-6`}>
        Datenschutzerklärung
      </h1>

      {/* Datenschutzerklärung Inhalt */}
      <div className="text-left">
        <h2 className={styles.heading3}>1. Datenschutz auf einen Blick</h2>
        <p>
          Allgemeine Hinweise: Die folgenden Hinweise geben einen einfachen
          Überblick darüber, was mit Ihren personenbezogenen Daten passiert,
          wenn Sie unsere Website besuchen. Personenbezogene Daten sind alle
          Daten, mit denen Sie persönlich identifiziert werden können.
        </p>

        <h2 className={styles.heading3}>
          2. Datenerfassung auf unserer Website
        </h2>
        <h3 className={styles.heading4}>
          Wer ist verantwortlich für die Datenerfassung auf dieser Website?
        </h3>
        <p>
          Die Datenverarbeitung auf dieser Website erfolgt durch den
          Websitebetreiber. Dessen Kontaktdaten können Sie dem Impressum dieser
          Website entnehmen.
        </p>

        <h3 className={styles.heading4}>Wie erfassen wir Ihre Daten?</h3>
        <p>
          Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese
          mitteilen. Hierbei kann es sich z.B. um Daten handeln, die Sie in ein
          Kontaktformular eingeben oder Registrieren.
        </p>
        <p>
          Andere Daten werden automatisch beim Besuch der Website durch unsere
          IT-Systeme erfasst. Das sind vor allem technische Daten (z.B.
          Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs). Die
          Erfassung dieser Daten erfolgt automatisch, sobald Sie unsere Website
          betreten.
        </p>

        <h3 className={styles.heading4}>Wofür nutzen wir Ihre Daten?</h3>
        <p>
          Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung
          der Website zu gewährleisten. Andere Daten können zur Analyse Ihres
          Nutzerverhaltens verwendet werden.
        </p>

        <h3 className={styles.heading4}>
          Welche Rechte haben Sie bezüglich Ihrer Daten?
        </h3>
        <p>
          Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft,
          Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten zu
          erhalten. Sie haben außerdem ein Recht, die Berichtigung, Sperrung
          oder Löschung dieser Daten zu verlangen. Hierzu sowie zu weiteren
          Fragen zum Thema Datenschutz können Sie sich jederzeit unter der im
          Impressum angegebenen Adresse an uns wenden. Des Weiteren steht Ihnen
          ein Beschwerderecht bei der zuständigen Aufsichtsbehörde zu.
        </p>

        <h2 className={styles.heading3}>
          3. Analyse-Tools und Tools von Drittanbietern
        </h2>
        <p>
          Beim Besuch unserer Website kann Ihr Surf-Verhalten statistisch
          ausgewertet werden. Das geschieht vor allem mit Cookies und mit
          sogenannten Analyseprogrammen. Die Analyse Ihres Surf-Verhaltens
          erfolgt in der Regel anonym; das Surf-Verhalten kann nicht zu Ihnen
          zurückverfolgt werden.
        </p>
        <p>
          Sie können dieser Analyse widersprechen oder sie durch die
          Nichtbenutzung bestimmter Tools verhindern. Detaillierte Informationen
          dazu finden Sie in der folgenden Datenschutzerklärung.
        </p>

        <p>TimeTab GmbH, 01.01.2024</p>
      </div>
    </div>
  );
};

export default Datasecurity;
