import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Card, CardContent, CardMedia, Box } from '@mui/material';

function Products() {
  const products = [
    { title: 'Customized Cup', icon: '☕', image: '/images/products/category-customized-cup.jpg' },
    { title: 'Customized Bottle', icon: '🍶', image: null },
    { title: 'Customized Photo Frame', icon: '🖼️', image: null },
    { title: 'Customized Cushion Cover', icon: '🛋️', image: null },
    { title: 'Fridge Magnet', icon: '🧲', image: null },
    { title: 'Coasters', icon: '🟫', image: null },
    { title: 'Tote Bag', icon: '👜', image: null },
    { title: 'T Shirt', icon: '👕', image: null },
    { title: 'Memento', icon: '🎁', image: null },
    { title: 'Customized Candle', icon: '🕯️', image: null },
    { title: 'CCTV', icon: '📹', image: null }
  ];

  // Helper function to create URL slug from product title
  const createSlug = (title: string) => {
    return title.toLowerCase().replace(/\s+/g, '-');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Our Products
        </Typography>
        <Typography variant="h5" color="text.secondary">
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
                  sx={{ objectFit: 'contain', backgroundColor: '#ffffff' }}
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
