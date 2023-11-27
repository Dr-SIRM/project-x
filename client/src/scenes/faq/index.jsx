import { Box, useTheme } from "@mui/material";
import Header from "../../components/Header";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { tokens } from "../../theme";

const FAQ = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Erhöhen der Schriftgröße für die FAQ-Texte
  const largerText = { fontSize: "1rem" };

  // Stil für die Fragen
  const questionStyle = {
    ...largerText,
    marginBottom: "20px", // Abstand gegen unten
  };

  // Stil für die Antworten
  const answerStyle = {
    ...largerText,
    marginLeft: "40px", // Einrückung für die Antworten
    marginBottom: "4px", // Abstand gegen unten
    borderBottom: `1px solid ${colors.greenAccent[400]}`,
    paddingBottom: "20px",
  };

  return (
    <Box m="20px">
      <Header
        title="FAQ"
        subtitle="Häufig gestellte Fragen. Fragen und Antworten werden pro Thema schriftlich und mit Videoanleitungen erklärt."
      />

      {/* Allgemeiner Ablauf */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.redAccent[300]} variant="h5">
            Planungserstellung Schritt für Schritt: Eine Kurzanleitung
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography style={questionStyle}>
            Was ist der allgemeine Ablauf, damit der Algorithmus von TimeTab
            einen optimalen Schichtplan erstellt?
          </Typography>
          <Typography style={answerStyle}>
            1. Bitte befolgen Sie bei Ihrem ersten Login die detaillierte
            Schritt-für-Schritt-Anleitung. Überprüfen Sie sorgfältig, ob alle
            Einstellungen bezüglich Ihres Unternehmens und der
            Solver-Anforderungen korrekt vorgenommen wurden.
            <br />
            <br />
            2. Laden Sie alle Teammitglieder ein. Überprüfen Sie im Bereich
            'Team verwalten', dass alle Team-Einstellungen korrekt sind.
            <br />
            <br />
            3. Navigieren Sie zum Abschnitt 'Planung'. Tragen Sie dort für den
            gewünschten Zeitraum die Anzahl der benötigten Mitarbeiter mit den
            jeweiligen Qualifikationen ein.
            <br />
            <br />
            4. Ihre Mitarbeiter sind angehalten, ihre Verfügbarkeiten anzugeben,
            sodass ersichtlich ist, an welchen Tagen und zu welchen Uhrzeiten
            sie arbeiten können.
            <br />
            <br />
            5. Wechseln Sie zum 'Solver', um einen optimalen Schichtplan für den
            gewünschten Zeitraum generieren zu lassen.
            <br />
            <br />
            6. Nachdem der Schichtplan erstellt wurde, können Sie die geplanten
            Schichten im Bereich 'Schichtplan' einsehen und/oder als Exceldatei
            herunterladen.
          </Typography>
        </AccordionDetails>
        <AccordionDetails>
          <iframe
            width="1000"
            height="440"
            src="https://www.youtube.com/embed/YOUR_VIDEO_ID_FOR_DASHBOARD"
            title="YouTube video player"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </AccordionDetails>
      </Accordion>

      {/* Dashboard */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            Dashboard
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography style={questionStyle}>
            Was kann ich dem Dashboard alles entnehmen?
          </Typography>
          <Typography style={answerStyle}>
            Im Dashboard erhalten Sie einen umfassenden Überblick über Ihre
            Belegschaft, einschliesslich der Gesamtzahl der Mitarbeiter sowie
            der Aufteilung zwischen Teilzeit- und Vollzeitkräften. Ein
            interaktives Diagramm zeigt Ihnen zudem die täglichen Arbeitsstunden
            der laufenden Woche auf. Auf der rechten Seite des Dashboards finden
            Sie Informationen zu den aktuell arbeitenden Mitarbeitern sowie zu
            den bevorstehenden Schichten. Im unteren Bereich werden die
            Abschnitte "Fehlende Planung" und "Fehlerhafte Planung"
            hervorgehoben, die aufzeigen, welche Mitarbeiter ihre
            Verfügbarkeiten noch nicht mitgeteilt haben und an welchen Tagen
            noch Schichtzuweisungen ausstehen.
          </Typography>
        </AccordionDetails>
        <AccordionDetails>
          <Typography style={questionStyle}>
            Welche Funktionen bieten die Felder 'Fehlende Planung' und
            'Fehlerhafte Planung', und wie kann ich sie für effektive
            Kommunikation mit meinen Mitarbeitern nutzen?
          </Typography>
          <Typography style={answerStyle}>-- Coming Soon --</Typography>
        </AccordionDetails>
        <AccordionDetails>
          <iframe
            width="1000"
            height="440"
            src="https://www.youtube.com/embed/YOUR_VIDEO_ID_FOR_DASHBOARD"
            title="YouTube video player"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </AccordionDetails>
      </Accordion>

      {/* Solver */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            Solver
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography style={questionStyle}>
            Wie funktioniert der 'Solver' und welche Prozesse verwendet er, um
            einen optimalen Schichtplan zu erstellen?"
          </Typography>
          <Typography style={answerStyle}>
            Der von TimeTab entwickelte Algorithmus verwendet einen
            intelligenten Solver, um optimale Schichtpläne zu erstellen. Dieser
            Algorithmus ist das Ergebnis fortschrittlicher mathematischer
            Forschung und wurde speziell entworfen, um komplexe Planungsaufgaben
            zu bewältigen. Er analysiert alle verfügbaren Daten – wie
            Arbeitszeiten, Mitarbeiterverfügbarkeiten und spezifische
            Unternehmensanforderungen – und prüft systematisch jede mögliche
            Kombination dieser Faktoren. Ziel ist es, einen Schichtplan zu
            finden, der nicht nur alle betrieblichen Anforderungen erfüllt,
            sondern auch effizient und umsetzbar für die Mitarbeiter ist. Dieser
            Prozess ermöglicht es dem Solver, aus den unzähligen
            Planungsoptionen den optimalen Schichtplan herauszufiltern, der den
            Bedürfnissen Ihres Unternehmens am besten entspricht.
          </Typography>
        </AccordionDetails>
        <AccordionDetails>
          <Typography style={questionStyle}>
            Was genau passiert bei den Vorüberprüfungen?
          </Typography>
          <Typography style={answerStyle}>
            Im Rahmen der Vorüberprüfungen analysiert der Algorithmus, ob
            ausreichend Informationen vorliegen, um einen optimalen Schichtplan
            zu erstellen. Sollten Informationen fehlen oder unvollständig sein,
            erhalten Sie eine Rückmeldung, welche spezifischen Daten noch
            benötigt werden oder was ergänzt werden muss, um den Planungsprozess
            erfolgreich durchführen zu können.
          </Typography>
        </AccordionDetails>
        <AccordionDetails>
          <iframe
            width="1000"
            height="440"
            src="https://www.youtube.com/embed/YOUR_VIDEO_ID_FOR_DASHBOARD"
            title="YouTube video player"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </AccordionDetails>
      </Accordion>

      {/* Solver-Anforderungen */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            Solver-Anforderungen
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography style={questionStyle}>
            Welchen Zweck erfüllen die Solver-Anforderungen und warum ist es
            notwendig, sie zu definieren?
          </Typography>
          <Typography style={answerStyle}>
            Die Solver-Anforderungen dienen dazu, dem Algorithmus Ihre
            Prioritäten und wichtigen Kriterien mitzuteilen. Dies stellt sicher,
            dass er Ihre spezifischen Anforderungen berücksichtigt und einen
            Schichtplan erstellt, der diesen entspricht.
          </Typography>
        </AccordionDetails>
        <AccordionDetails>
          <Typography style={questionStyle}>
            Was beinhalten die Mindestanforderungen?
          </Typography>
          <Typography style={answerStyle}>-- Coming Soon --</Typography>
        </AccordionDetails>
        <AccordionDetails>
          <Typography style={questionStyle}>
            Was beinhalten die Zusatzanfoderungen?
          </Typography>
          <Typography style={answerStyle}>-- Coming Soon --</Typography>
        </AccordionDetails>
        <AccordionDetails>
          <iframe
            width="1000"
            height="440"
            src="https://www.youtube.com/embed/YOUR_VIDEO_ID_FOR_DASHBOARD"
            title="YouTube video player"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </AccordionDetails>
      </Accordion>

      {/* Team verwalten */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[100]} variant="h5">
            Team verwalten
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography style={questionStyle}>
            Werden die Änderungen in 'Team verwalten' automatisch gespeichert?
          </Typography>
          <Typography style={answerStyle}>
            Genau, Sie brauchen lediglich Ihre Änderungen vorzunehmen. Alle von
            Ihnen eingegebenen Daten und Änderungen werden dann automatisch und
            sicher gespeichert.
          </Typography>
        </AccordionDetails>
        <AccordionDetails>
          <Typography style={questionStyle}>
            Was bedeutet 'Zugriffslevel'?
          </Typography>
          <Typography style={answerStyle}>
            In der Spalte 'Zugriffslevel' können Sie einsehen, welche
            Zugriffsberechtigungen die einzelnen Teammitglieder haben. Es gibt
            zwei Stufen: 'Admin' und 'User'. Ein Admin hat umfassende
            Berechtigungen, einschliesslich des Zugriffs auf alle Informationen
            und der Möglichkeit, Schichtpläne zu erstellen. User hingegen können
            lediglich ihre Verfügbarkeiten eintragen und ihre geplanten
            Arbeitsstunden einsehen.
          </Typography>
        </AccordionDetails>
        <AccordionDetails>
          <iframe
            width="1000"
            height="440"
            src="https://www.youtube.com/embed/oBKEaczB5sc"
            title="YouTube video player"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </AccordionDetails>
      </Accordion>

      {/* Benutzerverwaltung */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[100]} variant="h5">
            Benutzerverwaltung
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography style={questionStyle}>
            Was für Informationen kann ich unter 'Benutzerverwaltung' einsehen?
          </Typography>
          <Typography style={answerStyle}>
            In der 'Benutzerverwaltung' können Sie die eingetragenen
            Verfügbarkeiten Ihrer Mitarbeiter sowie deren zugewiesene Schichten
            einsehen. Wählen Sie dazu einfach den gewünschten Mitarbeiter aus
            der linken Liste aus. Die relevanten Informationen werden Ihnen
            daraufhin übersichtlich und strukturiert dargestellt.
          </Typography>
        </AccordionDetails>
        <AccordionDetails>
          <iframe
            width="1000"
            height="440"
            src="https://www.youtube.com/embed/YOUR_VIDEO_ID_FOR_DASHBOARD"
            title="YouTube video player"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </AccordionDetails>
      </Accordion>

      {/* Einladen */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[100]} variant="h5">
            Einladen
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography style={questionStyle}>
            Wie funktioniert der Prozess, um einen neuen Mitarbeiter einzuladen
            und ins System aufzunehmen?
          </Typography>
          <Typography style={answerStyle}>
            Geben Sie zuerst die erforderlichen Informationen des neuen
            Mitarbeiters ein, einschliesslich seiner Fähigkeiten, Art der
            Anstellung und ob er sich in der Einarbeitungsphase befindet. Diese
            Angaben können später im Bereich 'Team verwalten' bei Bedarf
            angepasst werden. Zudem legen Sie fest, welche
            Zugriffsberechtigungen der neue Mitarbeiter erhalten soll. Wählt man
            'User' aus, beschränkt sich die Berechtigung des Mitarbeiters
            darauf, seine Verfügbarkeiten einzutragen und den eigenen
            Schichtplan einzusehen. Achten Sie darauf, die korrekte
            E-Mail-Adresse einzugeben. Nachdem die Einladung versandt wurde,
            erhält der Mitarbeiter einen Code per E-Mail. Mit diesem Code kann
            er sich im System registrieren. Nach Abschluss der Registrierung ist
            der Mitarbeiter erfolgreich in Ihrem System integriert.
          </Typography>
        </AccordionDetails>
        <AccordionDetails>
          <iframe
            width="1000"
            height="440"
            src="https://www.youtube.com/embed/YOUR_VIDEO_ID_FOR_DASHBOARD"
            title="YouTube video player"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </AccordionDetails>
      </Accordion>

      {/* Verfügbarkeit */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            Verfügbarkeit
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography style={questionStyle}>
            Was genau wird bei 'Verfügbarkeit' eingetragen?
          </Typography>
          <Typography style={answerStyle}>
            Im Bereich 'Verfügbarkeit' können Sie und Ihre Mitarbeiter angeben,
            an welchen Tagen und zu welchen Zeiten Verfügbarkeit für die Arbeit
            besteht. Als Admin haben Sie zusätzlich die Möglichkeit, Ihre eigene
            Verfügbarkeit einzutragen sowie die Verfügbarkeiten Ihrer
            Mitarbeiter zu erfassen, anzupassen oder einzusehen. Wählen Sie
            hierfür einfach den gewünschten Mitarbeiter aus der Liste oben aus.
            Sie können zwischen den einzelnen Wochen wechseln, um
            Verfügbarkeiten für unterschiedliche Zeitperioden zu planen. Zudem
            besteht die Option, Ferien für Sie selbst oder Ihre Mitarbeiter
            einzutragen.
          </Typography>
        </AccordionDetails>
        <AccordionDetails>
          <Typography style={questionStyle}>
            Für was kann ich 'Ferien' eintragen und was bewirkt das?
          </Typography>
          <Typography style={answerStyle}>
            Wenn Sie oder ein Mitarbeiter Ferien in das System eintragen, wird
            dies so verstanden, dass der Mitarbeiter an diesen Tagen nicht zur
            Arbeit eingeplant wird. Dies bedeutet, dass eventuell bereits
            eingetragene Arbeitsstunden für diese Tage ignoriert werden. Bei
            Vollzeitmitarbeitern hat dies zusätzlich den Effekt, dass ihre
            wöchentliche Arbeitszeit korrekt berechnet werden kann. Hier ein
            einfaches Beispiel: Nehmen wir an, ein Vollzeitmitarbeiter hat eine
            reguläre Wochenarbeitszeit von 40 Stunden. Trägt dieser Mitarbeiter
            für einen Tag Ferien ein und arbeitet somit nur an 4 Tagen der
            Woche, wird der Algorithmus versuchen, den Mitarbeiter für insgesamt
            32 Stunden statt der üblichen 40 Stunden einzuplanen. Das korrekte
            Eintragen von Ferien bei Vollzeitmitarbeitern ist daher wichtig, um
            Planungsschwierigkeiten zu vermeiden.
          </Typography>
        </AccordionDetails>
        <AccordionDetails>
          <iframe
            width="1000"
            height="440"
            src="https://www.youtube.com/embed/YOUR_VIDEO_ID_FOR_DASHBOARD"
            title="YouTube video player"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </AccordionDetails>
      </Accordion>

      {/* Unternehmen */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            Unternehmen
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography style={questionStyle}>
            Was bedeutet der Begriff 'Wochenstunden' im Kontext der
            Arbeitszeitplanung?
          </Typography>
          <Typography style={answerStyle}>
            Unter 'Wochenstunden' versteehen wir die Gesamtzahl der
            Arbeitsstunden, die ein Mitarbeiter bei einer Vollzeitbeschäftigung
            (100 % Anstellung) in einer Woche leistet. Bei der Erstellung des
            Schichtplans berücksichtigt unser Algorithmus die Wochenstunden
            eines zu 100 % angestellten Mitarbeiters, um sicherzustellen, dass
            seine Arbeitszeit entsprechend seiner Vertragsvereinbarung verteilt
            wird.
          </Typography>
        </AccordionDetails>
        <AccordionDetails>
          <Typography style={questionStyle}>
            Was ist unter dem Begriff 'Schichten' zu verstehen und wie
            funktioniert die Einteilung?
          </Typography>
          <Typography style={answerStyle}>
            Mit 'Schichten' beziehen wir uns auf die Einteilung der täglichen
            Arbeitsstunden in verschiedene Arbeitsperioden. Sie können zwischen
            1, 2 oder 3 Schichten wählen. Bei 2 Schichten wird der Arbeitstag
            beispielsweise in eine Morgenschicht und eine Abendschicht
            aufgeteilt. Bei 3 Schichten teilt sich der Tag in drei gleich lange
            Arbeitsperioden. Zum Beispiel: Wenn Ihr Betrieb täglich 14 Stunden
            geöffnet ist und Sie sich für 2 Schichten entscheiden, dann umfasst
            die erste Schicht die ersten 7 Stunden und die zweite Schicht die
            restlichen 7 Stunden. Unser Algorithmus plant die Mitarbeiter so
            ein, dass sie, wenn möglich, in einer Woche stets in derselben
            Schicht eingesetzt werden. Bei der Planung über mehrere Wochen
            hinweg wechseln die Schichten der Mitarbeiter, um eine faire
            Verteilung zu gewährleisten.
          </Typography>
        </AccordionDetails>
        <AccordionDetails>
          <iframe
            width="1000"
            height="440"
            src="https://www.youtube.com/embed/YOUR_VIDEO_ID_FOR_DASHBOARD"
            title="YouTube video player"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </AccordionDetails>
      </Accordion>

      {/* Planung */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            Planung
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography style={questionStyle}>
            Was sind die Schritte, um die benötigte Anzahl von Mitarbeitern mit
            spezifischen Fähigkeiten zu planen?
          </Typography>
          <Typography style={answerStyle}>
            Um die benötigte Anzahl von Mitarbeitern mit bestimmten Fähigkeiten
            zu planen, beginnen Sie, indem Sie die entsprechende Fähigkeit oben
            links auswählen. Geben Sie dann die Anzahl der Mitarbeiter ein, die
            an jedem Tag benötigt werden. Wählen Sie danach die spezifischen
            Zeitblöcke aus, in denen diese Mitarbeiter erforderlich sind. Diesen
            Vorgang sollten Sie täglich für jede Woche wiederholen. Nachdem Sie
            die Stundenangaben für einen Tag gemacht haben, reichen Sie diese
            ein und fahren mit dem nächsten Tag fort. Diesen Prozess wiederholen
            Sie für jede benötigte Fähigkeit und jede Woche. Sobald Sie alle
            Angaben für eine Woche komplettiert haben, können Sie die gesamten
            Daten einreichen.
          </Typography>
        </AccordionDetails>
        <AccordionDetails>
          <Typography style={questionStyle}>
            Wie kann ich eine personalisierte Vorlage speichern und wieder
            verwenden?
          </Typography>
          <Typography style={answerStyle}>
            Um eine personalisierte Vorlage zu speichern, tragen Sie zuerst alle
            benötigten Informationen ein. Wählen Sie dann aus den verfügbaren
            Optionen (Vorlage 1, Vorlage 2, Vorlage 3) die gewünschte Vorlage
            aus, in der Sie Ihre Daten speichern möchten. Klicken Sie auf
            'Vorlage speichern', um Ihre Eingaben zu sichern. Um die
            gespeicherte Vorlage zu verwenden, klicken Sie einfach darauf, und
            die voreingestellten Informationen werden geladen. Anschliessend
            müssen Sie nur noch die Daten einreichen.
          </Typography>
        </AccordionDetails>
        <AccordionDetails>
          <iframe
            width="1000"
            height="440"
            src="https://www.youtube.com/embed/YOUR_VIDEO_ID_FOR_DASHBOARD"
            title="YouTube video player"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </AccordionDetails>
      </Accordion>

      {/* Schichtplan */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[100]} variant="h5">
            Schichtplan
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography style={questionStyle}>
            Wie kann ich einen Schichtplan als Exceldatei herunterladen?
          </Typography>
          <Typography style={answerStyle}>
            Um Ihren Schichtplan als Excel-Datei herunterzuladen, klicken Sie
            bitte auf die Option 'Export Excel', die Sie oben links auf dieser
            Seite finden. Wählen Sie anschließend den Zeitraum aus, für den der
            Schichtplan exportiert werden soll. Stellen Sie sicher, dass der
            Schichtplan für den ausgewählten Zeitraum bereits erstellt wurde.
            Nachdem Sie Ihre Auswahl getroffen haben, beginnt der Download der
            Excel-Datei automatisch. Sie können die heruntergeladene Datei dann
            auf Ihrem Computer speichern und bei Bedarf für weitere Zwecke
            nutzen oder bearbeiten.
          </Typography>
        </AccordionDetails>
        <AccordionDetails>
          <Typography style={questionStyle}>-- Coming Soon --</Typography>
          <Typography style={answerStyle}>-- Coming Soon --</Typography>
        </AccordionDetails>
        <AccordionDetails>
          <iframe
            width="1000"
            height="440"
            src="https://www.youtube.com/embed/YOUR_VIDEO_ID_FOR_DASHBOARD"
            title="YouTube video player"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </AccordionDetails>
      </Accordion>

      {/* Kalender */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[100]} variant="h5">
            Kalender
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography style={questionStyle}>
            Was für Informationen kann ich dem Kalender entnehmen?
          </Typography>
          <Typography style={answerStyle}>
            In Ihrem Kalender wird Ihnen und Ihren Mitarbeitern eine klare
            Übersicht Ihrer geplanten Arbeitseinsätze geboten. Diese Ansicht ist
            sowohl auf Tages-, Wochen- als auch Monatsbasis verfügbar, was eine
            effiziente Planung und Koordination Ihrer Einsätze ermöglicht. S
          </Typography>
        </AccordionDetails>
        <AccordionDetails>
          <Typography style={questionStyle}>
            Wie kann ich meinen Schichtplan in meinem Kalender exportieren?
          </Typography>
          <Typography style={answerStyle}>
            Klicken Sie dazu einfach oben links auf 'Export Kalender'.
            Anschliessend wird eine Datei heruntergeladen, die Sie dann ganz
            einfach in Ihren entsprechenden Kalender importieren können.
          </Typography>
        </AccordionDetails>
        <AccordionDetails>
          <iframe
            width="1000"
            height="440"
            src="https://www.youtube.com/embed/YOUR_VIDEO_ID_FOR_DASHBOARD"
            title="YouTube video player"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </AccordionDetails>
      </Accordion>

      {/* Schlusssatz */}
      <Typography variant="h5" style={{ marginTop: "20px" }}>
        Sie haben Ihre Frage im FAQ nicht gefunden? Dann kontaktieren Sie uns
        direkt.
      </Typography>

      {/* Auf die E-Mail-Adresse verweisen */}
      <Typography variant="h5" style={{ marginTop: "20px" }}>
        <a
          href="mailto:timetab@gmx.ch"
          style={{
            color: colors.greenAccent[700],
            textDecoration: "underline",
          }}
        >
          timetab@gmx.ch
        </a>
      </Typography>
    </Box>
  );
};

export default FAQ;
