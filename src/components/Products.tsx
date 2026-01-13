import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Card, CardContent, CardMedia, Box } from '@mui/material';

function Products() {
  const products = [
    { title: 'Customized Cup', icon: '☕', image: '/images/products/category-customized-cup.jpg' },
    { title: 'Customized Bottle', icon: '🍶', image: '/images/products/category-customized-bottle.jpg' },
    { title: 'Customized Photo Frame', icon: '🖼️', image: '/images/products/category-customized-photo-frame.jpg' },
    { title: 'Customized Cushion Cover', icon: '🛋️', image: '/images/products/category-customized-cushion-cover.jpg' },
    { title: 'Fridge Magnet', icon: '🧲', image: '/images/products/category-fridge-magnet.jpg' },
    { title: 'Tote Bag', icon: '👜', image: '/images/products/category-tote-bag.jpg' },
    { title: 'T Shirt', icon: '👕', image: '/images/products/category-t-shirt.jpg' },
    { title: 'Memento', icon: '🎁', image: '/images/products/category-memento.jpg' },
    { title: 'Customized Candle', icon: '🕯️', image: '/images/products/category-customized-candle.jpg' },
    { title: 'CCTV', icon: '📹', image: '/images/products/category-cctv.jpg' }
  ];

  // Helper function to create URL slug from product title
  const createSlug = (title: string) => {
    return title.toLowerCase().replace(/\s+/g, '-');
  };

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
          Our Products
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
          Discover the range of customized products we offer to make your moments special.
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
        {products.map((product, index) => (
          <Link
            key={index}
            to={`/products/${createSlug(product.title)}`}
            style={{ textDecoration: 'none' }}
          >
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s, box-shadow 0.3s',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6,
                },
              }}
            >
              {product.image ? (
                <CardMedia
                  component="img"
                  height="250"
                  image={product.image}
                  alt={product.title}
                  sx={{ objectFit: 'cover', backgroundColor: '#ffffff' }}
                />
              ) : (
                <Box sx={{ fontSize: '3rem', textAlign: 'center', py: 4 }}>
                  {product.icon}
                </Box>
              )}
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" component="h3">
                  {product.title}
                </Typography>
              </CardContent>
            </Card>
          </Link>
        ))}
      </Box>
    </Container>
  );
}

export default Products;
