import React from 'react';
import { Box, Container, Typography } from '@mui/material';

function Home() {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          py: 8,
        }}
      >
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 700,
            mb: 3,
            fontSize: {
              xs: '2rem',
              sm: '2.5rem',
              md: '3.75rem',
            },
          }}
        >
          Welcome to Abstract Innovation
        </Typography>

        <Typography
          variant="h5"
          color="text.secondary"
          sx={{
            mb: 6,
            maxWidth: '800px',
            fontSize: {
              xs: '1rem',
              sm: '1.25rem',
              md: '1.5rem',
            },
            px: 2,
          }}
        >
          We transform your ideas into beautiful, meaningful prints.
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            maxWidth: '600px',
            px: 2,
          }}
        >
          <Typography
            variant="h6"
            color="primary"
            sx={{
              fontSize: {
                xs: '1rem',
                sm: '1.25rem',
              },
            }}
          >
            Create. Customize. Celebrate.
          </Typography>
          <Typography
            variant="h6"
            color="primary"
            sx={{
              fontSize: {
                xs: '1rem',
                sm: '1.25rem',
              },
            }}
          >
            Where Ideas Become Products.
          </Typography>
          <Typography
            variant="h6"
            color="primary"
            sx={{
              fontSize: {
                xs: '1rem',
                sm: '1.25rem',
              },
            }}
          >
            Personalized Prints, Endless Possibilities.
          </Typography>
          <Typography
            variant="h6"
            color="primary"
            sx={{
              fontSize: {
                xs: '1rem',
                sm: '1.25rem',
              },
            }}
          >
            Turn Moments into Memories.
          </Typography>
          <Typography
            variant="h6"
            color="primary"
            sx={{
              fontSize: {
                xs: '1rem',
                sm: '1.25rem',
              },
            }}
          >
            Print Your Feelings.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}

export default Home;
