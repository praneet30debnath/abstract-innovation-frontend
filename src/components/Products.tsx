import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Card, CardContent, CardMedia, Box, CircularProgress, Alert } from '@mui/material';
import { api } from '../services/api';

interface Product {
  id: number;
  slug: string;
  name: string;
  variant_count: number;
}

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<Product[]>('/api/products')
      .then(setProducts)
      .catch(err => setError(err.message || 'Failed to load products'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Alert severity="error">{error}</Alert>
    </Container>
  );

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: 2,
        animation: 'fadeIn 0.4s ease-in-out',
        '@keyframes fadeIn': {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '2rem', sm: '2.5rem', md: '3.75rem' } }}
        >
          Our Products
        </Typography>
        <Typography
          variant="h5"
          color="text.secondary"
          sx={{ mb: 3, maxWidth: '800px', mx: 'auto', fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' }, px: 2 }}
        >
          Discover the range of customized products we offer to make your moments special.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: 3,
        }}
      >
        {products.map(product => (
          <Link key={product.id} to={`/products/${product.slug}`} style={{ textDecoration: 'none' }}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s, box-shadow 0.3s',
                cursor: 'pointer',
                '&:hover': { transform: 'translateY(-8px)', boxShadow: 6 },
              }}
            >
              <CardMedia
                component="img"
                height="250"
                image={`/images/products/categories/category-${product.slug}.jpg`}
                alt={product.name}
                sx={{ objectFit: 'cover', backgroundColor: '#ffffff' }}
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" component="h3">{product.name}</Typography>
              </CardContent>
            </Card>
          </Link>
        ))}
      </Box>
    </Container>
  );
}

export default Products;
