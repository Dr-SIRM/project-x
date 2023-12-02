import React from "react";
import styles from "../style";

const Impressum = () => {
  return (
    <div className={`${styles.padding} text-white`}>
      {/* Annahme eines dunklen Hintergrunds für den weißen Text */}
      <h1 className={`${styles.heading2} text-center mb-6`}>Impressum</h1>

      {/* Impressum Inhalt */}
      <div className="text-left">
        <h2 className={styles.heading4}>Angaben gemäß § 5 TMG:</h2>
        <p>
          TimeTab GmbH
          <br />
          Musterstraße 1<br />
          12345 Hergiswil bei Willisau
          <br />
          Handelsregister: tbd
          <br />
          Umsatzsteuer-ID: CH123456789
        </p>

        <h2 className={styles.heading4}>Kontakt:</h2>
        <p>
          Telefon: 01234 567890
          <br />
          E-Mail: info@timetab.ch
        </p>

        <h2 className={styles.heading4}>
          Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:
        </h2>
        <p>
          Max Mustermann
          <br />
          Musterstraße 1<br />
          12345 Musterstadt
        </p>

        <h2 className={styles.heading4}>Haftungsausschluss:</h2>
        <p>
          <strong>Haftung für Inhalte</strong>
          <br />
          Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für
          die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir
          jedoch keine Gewähr übernehmen.
        </p>
        <p>
          <strong>Haftung für Links</strong>
          <br />
          Unser Angebot enthält Links zu externen Websites Dritter, auf deren
          Inhalte wir keinen Einfluss haben. Deshalb können wir für diese
          fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der
          verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der
          Seiten verantwortlich.
        </p>
        <p>
          <strong>Urheberrecht</strong>
          <br />
          Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen
          Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung,
          Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der
          Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des
          jeweiligen Autors bzw. Erstellers.
        </p>

        <p>TimeTab GmbH, 01.01.2024</p>
      </div>
    </div>
  );
};

export default Impressum;
