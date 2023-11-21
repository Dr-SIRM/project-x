import { Box, useTheme } from "@mui/material";
import Header from "../../components/Header";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { tokens } from "../../theme";
import { API_BASE_URL } from "../../config";

const FAQ = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Box m="20px">
      <Header title="FAQ" subtitle="Frequently Asked Questions. Die Antworten werden jeweils schriftlich und mit einem Video erklärt." />

      {/* Frage 1 */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            Was ist auf dem Dashboard alles ersichtlich?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Auf dem Dashboard (Für User und Admin ein seperates FAQ?)
          </Typography>
        </AccordionDetails>
        <AccordionDetails>
          <Typography>
            Anleitungsvideo "Team Verwalten"
          </Typography>
          <iframe
            width="1000"
            height="440"
            src="https://www.youtube.com/embed/VIDEO_ID_1"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </AccordionDetails>
      </Accordion>

      {/* Frage 2 */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            Wie kann ich mein Team verwalten?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Sie können unter "Team Verwalten" Einstellungen vornehmen. Sie können die Emailadresse der Mitarbeiter ändern, die Anstellung und den Anstellungsgrad anpassen oder Abteilungen zuweisen. Ebenfalls können Sie einzelne Mitarbeiter löschen.
          </Typography>
        </AccordionDetails>
        <AccordionDetails>
          <Typography>
            Anleitungsvideo "Team Verwalten"
          </Typography>
          <iframe
            width="1000"
            height="440"
            src="https://www.youtube.com/embed/oBKEaczB5sc"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </AccordionDetails>
      </Accordion>

      {/* Frage 3 */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            Wie funktioniert die automatisierte Schichtplanung und wie werden die Schichten automatisch zugewiesen?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Die automatisierte Schichtplanung basiert in der Regel auf Regeln und Vorgaben, die von den Administratoren oder Managern der Schichtplanungs-App festgelegt werden.
          </Typography>
        </AccordionDetails>
        <AccordionDetails>
          <Typography>
            Anleitungsvideo "Automatische Schichtplanung"
          </Typography>
          <iframe
            width="1000"
            height="440"
            src="https://www.youtube.com/embed/VIDEO_ID_3"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </AccordionDetails>
      </Accordion>

      {/* Frage 4 */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            Ist es möglich, manuell Änderungen an den automatisch zugewiesenen Schichten vorzunehmen?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Nein, es ist nicht möglich, manuell Änderungen an den automatisch zugewiesenen Schichten vorzunehmen.
          </Typography>
        </AccordionDetails>
        <AccordionDetails>
          <Typography>
            Anleitungsvideo "Manuelle Änderungen an Schichten"
          </Typography>
          <iframe
            width="1000"
            height="440"
            src="https://www.youtube.com/embed/VIDEO_ID_4"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </AccordionDetails>
      </Accordion>

      {/* Frage 5 */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            Wie werden Abwesenheiten wie Urlaub oder Krankheit in der automatisierten Schichtplanung berücksichtigt?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Abwesenheiten wie Urlaub oder Krankheit werden in der automatisierten Schichtplanung in der Regel berücksichtigt, indem sie als Parameter in die Schichtplanung einbezogen werden.
          </Typography>
        </AccordionDetails>
        <AccordionDetails>
          <Typography>
            Anleitungsvideo "Berücksichtigung von Abwesenheiten"
          </Typography>
          <iframe
            width="1000"
            height="440"
            src="https://www.youtube.com/embed/VIDEO_ID_5"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </AccordionDetails>
      </Accordion>

      {/* Frage 6 */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            Wie können die Mitarbeiter auf den aktuellen Schichtplan zugreifen und ihre Schichtpläne einsehen?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Die Mitarbeiter können in der Regel auf den aktuellen Schichtplan über eine mobile App oder eine Webanwendung zugreifen, die von der automatisierten Schichtplanungs-App bereitgestellt wird.
          </Typography>
        </AccordionDetails>
        <AccordionDetails>
          <Typography>
            Anleitungsvideo "Zugriff auf den Schichtplan für Mitarbeiter"
          </Typography>
          <iframe
            width="1000"
            height="440"
            src="https://www.youtube.com/embed/VIDEO_ID_6"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default FAQ;
