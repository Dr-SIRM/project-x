import React from "react";
import styles from "../style";

const AGB = () => {
  return (
    <div className={`${styles.padding} text-white`}>
      {/* Assuming a dark background for the white text */}
      <h1 className={`${styles.heading2} text-center mb-6`}>
        Allgemeine Geschäftsbedingungen
      </h1>
      {/* Introductory text */}
      <p className="text-center mb-6"></p>

      {/* AGB text */}
      <div className="text-left">
        <h2 className={styles.heading4}>1. Geltungsbereich</h2>
        <p>
          Diese Allgemeinen Geschäftsbedingungen (AGB) regeln die Nutzung der
          Webanwendung TimeTab, die von TimeTab GmbH bereitgestellt wird.{" "}
        </p>

        <h2 className={styles.heading4}>2. Nutzungsrechte</h2>
        <p>
          TimeTab GmbH gewährt dem Nutzer ein nicht-exklusives,
          nicht-übertragbares Recht zur Nutzung der Webanwendung gemäß den
          Bestimmungen dieser AGB.{" "}
        </p>

        <h2 className={styles.heading4}>3. Registrierung und Benutzerkonto</h2>
        <p>
          Für die Nutzung bestimmter Funktionen der Webanwendung ist eine
          Registrierung und die Erstellung eines Benutzerkontos erforderlich.
          Der Nutzer verpflichtet sich, bei der Registrierung wahrheitsgemäße
          und vollständige Angaben zu machen.
        </p>
        <h2 className={styles.heading4}>4. Datenschutz</h2>
        <p>
          Der Schutz personenbezogener Daten ist TimeTab GmbH ein wichtiges
          Anliegen. Die Erhebung, Verarbeitung und Nutzung personenbezogener
          Daten erfolgt in Übereinstimmung mit der Datenschutzerklärung von
          TimeTab GmbH.
        </p>
        <h2 className={styles.heading4}>4. Nutzungsbeschränkungen</h2>
        <p>
          Der Nutzer darf die Webanwendung nicht für rechtswidrige Zwecke
          nutzen, keine Viren oder schädliche Software verbreiten und muss die
          Rechte Dritter respektieren.
        </p>
        <h2 className={styles.heading4}>5. Änderungen und Aktualisierungen</h2>
        <p>
          TimeTab GmbH bemüht sich um eine ständige Verfügbarkeit der
          Webanwendung, kann jedoch keine ununterbrochene Nutzungsgarantie
          geben.
        </p>
        <h2 className={styles.heading4}>6. Verfügbarkeit</h2>
        <p>
          TimeTab GmbH bemüht sich um eine ständige Verfügbarkeit der
          Webanwendung, kann jedoch keine ununterbrochene Nutzungsgarantie
          geben.
        </p>
        <h2 className={styles.heading4}>7. Verfügbarkeit</h2>
        <p>
          TimeTab GmbH behält sich das Recht vor, die Webanwendung jederzeit zu
          ändern oder zu aktualisieren. Die Nutzer werden über wesentliche
          Änderungen informiert.
        </p>
        <h2 className={styles.heading4}>8. Haftungsbeschränkung</h2>
        <p>
          Die Haftung von TimeTab GmbH für Schäden, die aus der Nutzung der
          Webanwendung resultieren, ist, soweit gesetzlich zulässig, beschränkt.
        </p>
        <h2 className={styles.heading4}>9. Kündigung</h2>
        <p>
          Die Nutzungsvereinbarung kann von beiden Parteien jederzeit gekündigt
          werden. Mit der Kündigung erlöschen alle Nutzungsrechte an der
          Webanwendung.
        </p>
        <h2 className={styles.heading4}>10. Schlussbestimmungen</h2>
        <p>
          Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden,
          bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.
        </p>

        <p>TimeTab GmbH, 01.01.2024</p>
      </div>
    </div>
  );
};

export default AGB;
