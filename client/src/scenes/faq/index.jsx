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
  const largerText = { fontSize: '1rem' };

  return (
    <Box m="20px">
      <Header title="FAQ" subtitle="Häufig gestellte Fragen. Fragen und Antworten werden pro Thema schriftlich und mit Videoanleitungen erklärt." />

      {/* Allgemeiner Ablauf */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.redAccent[400]} variant="h5">
          Planungserstellung Schritt für Schritt: Ein Schnellführer
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography style={largerText}>
            Frage: Was ist der allgemeine Ablauf, damit der Algorithmus von TimeTab mir einen optimalen Schichtplan erstellt?
            <br />
            <br />
            1. fsfkldslk
            <br />
            2. fsfkldslk
            <br />
            3. fsfkldslk
            <br />
            4. fsfkldslk
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
          <Typography style={largerText}>
            Frage: Was kann ich dem Dashboard alles entnehmen?
            <br />
            Antwort: 
          </Typography>
        </AccordionDetails>
        <AccordionDetails>
          <Typography style={largerText}>
            Frage: Was bedeutet "Fehlende Planung" und "Fehlerhafte Planung" und was kann ich damit machen?
            <br />
            Antwort: 
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

      {/* Solver */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            Solver
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography style={largerText}>
            Frage: Was muss ich tun, bevor ich den automatischen Planungssolver starte?
            <br />
            Antwort:
          </Typography>
        </AccordionDetails>
        <AccordionDetails>
          <Typography style={largerText}>
            Frage: Wie funktioniert die Vorüberprüfung und was wird dabei geprüft?
            <br />
            Antwort:
          </Typography>
        </AccordionDetails>
        <AccordionDetails>
          <iframe
            width="1000"
            height="440"
            src="https://www.youtube.com/embed/YOUR_VIDEO_ID_FOR_SOLVER"
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
          <Typography style={largerText}>
            Frage: 
            <br />
            Antwort: ...
          </Typography>
        </AccordionDetails>
        <AccordionDetails>
          <Typography style={largerText}>
            Frage: 
            <br />
            Antwort:
          </Typography>
        </AccordionDetails>
        <AccordionDetails>
          <iframe
            width="1000"
            height="440"
            src="https://www.youtube.com/embed/YOUR_VIDEO_ID_FOR_SOLVER_REQUIREMENTS"
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
          <Typography style={largerText}>
            Frage: 
            <br />
            Antwort: ...
          </Typography>
        </AccordionDetails>
        <AccordionDetails>
          <Typography style={largerText}>
            Frage: 
            <br />
            Antwort:
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
          <Typography style={largerText}>
            Frage: Wo finde ich die geplanten Verfügbarkeiten und Schichten der Mitarbeiter?
            <br />
            Antwort:
          </Typography>
        </AccordionDetails>
        <AccordionDetails>
          <iframe
            width="1000"
            height="440"
            src="https://www.youtube.com/embed/YOUR_VIDEO_ID_FOR_USER_MANAGEMENT"
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
          <Typography style={largerText}>
            Frage: Wie lade ich neue Teammitglieder ein und wie funktioniert der Registrierungsprozess mit dem Token?
            <br />
            Antwort:
          </Typography>
        </AccordionDetails>
        <AccordionDetails>
          <iframe
            width="1000"
            height="440"
            src="https://www.youtube.com/embed/YOUR_VIDEO_ID_FOR_USER_MANAGEMENT"
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
          <Typography style={largerText}>
            Frage:
            <br />
            Antwort:
          </Typography>
        </AccordionDetails>
        <AccordionDetails>
          <iframe
            width="1000"
            height="440"
            src="https://www.youtube.com/embed/YOUR_VIDEO_ID_FOR_USER_MANAGEMENT"
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
          <Typography style={largerText}>
            Frage:
            <br />
            Antwort:
          </Typography>
        </AccordionDetails>
        <AccordionDetails>
          <iframe
            width="1000"
            height="440"
            src="https://www.youtube.com/embed/YOUR_VIDEO_ID_FOR_USER_MANAGEMENT"
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
          <Typography style={largerText}>
            Frage:
            <br />
            Antwort:
          </Typography>
        </AccordionDetails>
        <AccordionDetails>
          <iframe
            width="1000"
            height="440"
            src="https://www.youtube.com/embed/YOUR_VIDEO_ID_FOR_USER_MANAGEMENT"
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
          <Typography style={largerText}>
            Frage:
            <br />
            Antwort:
          </Typography>
        </AccordionDetails>
        <AccordionDetails>
          <iframe
            width="1000"
            height="440"
            src="https://www.youtube.com/embed/YOUR_VIDEO_ID_FOR_USER_MANAGEMENT"
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
          <Typography style={largerText}>
            Frage:
            <br />
            Antwort:
          </Typography>
        </AccordionDetails>
        <AccordionDetails>
          <iframe
            width="1000"
            height="440"
            src="https://www.youtube.com/embed/YOUR_VIDEO_ID_FOR_USER_MANAGEMENT"
            title="YouTube video player"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </AccordionDetails>
      </Accordion>


      {/* Schlusssatz */}
      <Typography variant="h5" style={{ marginTop: '20px' }}>
        Sie haben Ihre Frage im FAQ nicht gefunden? Dann kontaktieren Sie uns direkt.
      </Typography>

      {/* Auf die E-Mail-Adresse verweisen */}
      <Typography variant="h5" style={{ marginTop: '20px' }}>
        <a href="mailto:timetab@gmx.ch" style={{ color: colors.greenAccent[700], textDecoration: 'underline' }}>
          ihre-email@beispiel.de
        </a>
      </Typography>

    </Box>
  );
};

export default FAQ;
