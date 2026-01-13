import React from 'react';
import { Container, Typography, Box } from '@mui/material';

function ContactUs() {
  return (
    <Container
      maxWidth="lg"
      sx={{
        animation: 'fadeIn 0.4s ease-in-out',
        '@keyframes fadeIn': {
          '0%': {
            opacity: 0,
            transform: 'translateY(10px)',
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
      }}
    >
      <Box
        sx={{
          minHeight: '50vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          py: 2,
        }}
      >
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 700,
            mb: 2,
            fontSize: {
              xs: '2rem',
              sm: '2.5rem',
              md: '3.75rem',
            },
          }}
        >
          Contact Us
        </Typography>

        <Typography
          variant="h5"
          color="text.secondary"
          sx={{
            mb: 3,
            maxWidth: '800px',
            mx: 'auto',
            fontSize: {
              xs: '1rem',
              sm: '1.25rem',
              md: '1.5rem',
            },
            px: 2,
          }}
        >
          Get in touch with us for any inquiries or support.
        </Typography>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            Abstract Innovation
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Phone Numbers:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box
              sx={{
                backgroundColor: 'rgba(25, 118, 210, 0.1)',
                border: '1px solid rgba(25, 118, 210, 0.3)',
                color: 'primary.main',
                py: 2,
                px: 3,
                borderRadius: 2,
                transition: 'transform 0.2s, background-color 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                  backgroundColor: 'rgba(25, 118, 210, 0.15)',
                },
              }}
            >
              <Typography variant="h6">
                <a href="tel:+913346039929" style={{ textDecoration: 'none', color: 'inherit' }}>
                  +91 33 4603 9929
                </a>
              </Typography>
            </Box>
            <Box
              sx={{
                backgroundColor: 'rgba(25, 118, 210, 0.1)',
                border: '1px solid rgba(25, 118, 210, 0.3)',
                color: 'primary.main',
                py: 2,
                px: 3,
                borderRadius: 2,
                transition: 'transform 0.2s, background-color 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                  backgroundColor: 'rgba(25, 118, 210, 0.15)',
                },
              }}
            >
              <Typography variant="h6">
                <a href="tel:+919830064192" style={{ textDecoration: 'none', color: 'inherit' }}>
                  +91 98300 64192
                </a>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

export default ContactUs;
