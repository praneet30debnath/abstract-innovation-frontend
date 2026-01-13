import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box, Card, CardMedia, CardContent } from '@mui/material';

interface ProductVariant {
  name: string;
  price: number;
  image: string;
}

interface ProductData {
  [key: string]: ProductVariant[];
}

function ProductDetail() {
  const { productName } = useParams<{ productName: string }>();

  // Convert URL slug back to display name
  const displayName = productName
    ?.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ') || '';

  // Product variants data
  const productData: ProductData = {
    'customized-cup': [
      {
        name: 'Patch Cup',
        price: 265,
        image: '/images/products/patch-cup.jpg'
      },
      {
        name: 'Magic Cup',
        price: 260,
        image: '/images/products/magic-cup.jpg'
      },
      {
        name: 'Glitter Cup',
        price: 290,
        image: '/images/products/glitter-cup.jpg'
      },
      {
        name: 'Travel Cup',
        price: 585,
        image: '/images/products/travel-cup.jpg'
      },
      {
        name: 'Beer Mug',
        price: 590,
        image: '/images/products/beer-mug.jpg'
      },
      {
        name: 'Mason Jar',
        price: 395,
        image: '/images/products/mason-jar.jpg'
      }
    ],
    'customized-bottle': [],
    'customized-photo-frame': [],
    'customized-cushion-cover': [],
    'fridge-magnet': [],
    'coasters': [],
    'tote-bag': [],
    't-shirt': [],
    'memento': [],
    'customized-candle': [],
    'cctv': []
  };

  const variants = productData[productName || ''] || [];

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: 2,
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
      <Box sx={{ textAlign: 'center', mb: 3 }}>
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
          {displayName}
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
          Choose from our collection
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
          gap: 3,
        }}
      >
        {variants.map((variant, index) => (
          <Card
            key={index}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: 6,
              },
            }}
          >
            <CardMedia
              component="img"
              height="300"
              image={variant.image}
              alt={variant.name}
              sx={{ objectFit: 'contain', backgroundColor: '#ffffff' }}
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" component="h3" gutterBottom>
                {variant.name}
              </Typography>
              <Typography variant="h5" color="primary" sx={{ fontWeight: 600 }}>
                ₹{variant.price}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {variants.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" color="text.secondary">
            Coming Soon!
          </Typography>
        </Box>
      )}
    </Container>
  );
}

export default ProductDetail;
