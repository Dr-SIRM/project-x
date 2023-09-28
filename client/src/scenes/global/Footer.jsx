import React from 'react';
import { Container, Typography, Box, Link } from '@mui/material';

function Footer() {
  return (
    <Container component="footer" maxWidth={false} sx={{ backgroundColor: 'primary.main', color: 'white', p: 3 }}>
      <Typography variant="h6" align="center" gutterBottom>
        My Website
      </Typography>
      <Typography variant="subtitle1" align="center" color="text.secondary" component="p">
        Something here to give the footer a purpose!
      </Typography>
      <Box mt={2} align="center">
        <Link href="#" color="black">
          Link One
        </Link>{' '}
        |{' '}
        <Link href="#" color="black">
          Link Two
        </Link>{' '}
        |{' '}
        <Link href="#" color="black ">
          Link Three
        </Link>
      </Box>
    </Container>
  );
}

export default Footer;
