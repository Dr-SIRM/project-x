import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Table, TableBody, TableCell, TableHead, TableRow, Paper, Typography } from '@mui/material';

const MitarbeiterUebersicht = () => {
  const [mitarbeiter, setMitarbeiter] = useState([]);

  useEffect(() => {
    // Die Daten von der API abrufen
    axios.get('http://localhost:5000/api/mitarbeiter')
      .then((response) => {
        setMitarbeiter(response.data);
      })
      .catch((error) => {
        console.error('Ein Fehler ist aufgetreten:', error);
      });
  }, []);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Mitarbeiterübersicht</Typography>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Arbeitszeit</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mitarbeiter.map((m, index) => (
              <TableRow key={index}>
                <TableCell>{m.name}</TableCell>
                <TableCell>{m.arbeitszeit}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
};

export default MitarbeiterUebersicht;
