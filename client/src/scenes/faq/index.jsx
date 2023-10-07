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
      <Header title="FAQ" subtitle="Frequently Asked Questions Seite" />

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
          Welche Funktionen bietet die automatisierte Schichtplanungs-App?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
          Die automatisierte Schichtplanungs-App bietet in der Regel eine Vielzahl von Funktionen, die die Planung und Verwaltung von Schichten erleichtern. Dazu können beispielsweise die automatische Schichtzuweisung auf der Grundlage von Regeln und Vorgaben, die Berücksichtigung von Abwesenheiten wie Urlaub oder Krankheit, die Integration von Schichtplänen in den Kalender der Mitarbeiter, die Möglichkeit für Mitarbeiter, Änderungen an ihren Schichten vorzunehmen, und die Generierung von Berichten und Statistiken gehören.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
          Wie funktioniert die automatisierte Schichtplanung und wie werden die Schichten automatisch zugewiesen?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
          Die automatisierte Schichtplanung basiert in der Regel auf Regeln und Vorgaben, die von den Administratoren oder Managern der Schichtplanungs-App festgelegt werden. Diese Regeln können beispielsweise die Anzahl der Arbeitsstunden pro Tag oder Woche, die Schichtpräferenzen der Mitarbeiter oder die Verfügbarkeit von Mitarbeitern zu bestimmten Zeiten und an bestimmten Tagen umfassen. Auf der Grundlage dieser Regeln und Vorgaben werden die Schichten automatisch zugewiesen, wobei die Schichtplanungs-App darauf achten wird, dass alle Regeln eingehalten werden und alle Mitarbeiter fair berücksichtigt werden.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
          Ist es möglich, manuell Änderungen an den automatisch zugewiesenen Schichten vorzunehmen?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
          Nein, es ist nicht möglich, manuell Änderungen an den automatisch zugewiesenen Schichten vorzunehmen. Die automatisierte Schichtplanungs-App basiert vollständig auf Algorithmen und Regeln, die von den Administratoren oder Managern der App festgelegt wurden. Die Schichten werden automatisch zugewiesen, um sicherzustellen, dass alle Regeln und Vorgaben eingehalten werden und alle Mitarbeiter fair berücksichtigt werden. Wenn Änderungen erforderlich sind, können diese nur von den Administratoren oder Managern der App vorgenommen werden.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
          Wie werden Abwesenheiten wie Urlaub oder Krankheit in der automatisierten Schichtplanung berücksichtigt?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
          Abwesenheiten wie Urlaub oder Krankheit werden in der automatisierten Schichtplanung in der Regel berücksichtigt, indem sie als Parameter in die Schichtplanung einbezogen werden. Beispielsweise kann ein Mitarbeiter, der im Urlaub ist, für die betreffenden Tage automatisch von der Schichtplanung ausgeschlossen werden, oder ein Mitarbeiter, der krank ist, kann automatisch von der Schichtplanung für einen bestimmten Zeitraum ausgeschlossen werden. Die genauen Regeln und Vorgaben für die Berücksichtigung von Abwesenheiten hängen von den Anforderungen der jeweiligen Schichtplanungs-App ab.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
          Wie können die Mitarbeiter auf den aktuellen Schichtplan zugreifen und ihre Schichtpläne einsehen?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
          Die Mitarbeiter können in der Regel auf den aktuellen Schichtplan über eine mobile App oder eine Webanwendung zugreifen, die von der automatisierten Schichtplanungs-App bereitgestellt wird. Nachdem sich die Mitarbeiter angemeldet haben, können sie ihren Schichtplan einsehen und gegebenenfalls Änderungen an ihren Schichten beantragen, beispielsweise wenn sie einen Tausch mit einem anderen Mitarbeiter durchführen möchten oder wenn sie eine Abwesenheit anmelden müssen. In einigen Fällen können die Mitarbeiter auch automatische Benachrichtigungen erhalten, wenn Änderungen an ihrem Schichtplan vorgenommen wurden oder wenn neue Schichten zugewiesen wurden.          </Typography>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default FAQ;
