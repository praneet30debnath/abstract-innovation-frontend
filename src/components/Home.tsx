import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Container, Typography, Button, Card, CardContent, CardMedia, Grid } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

const festivalBanner = {
  title: 'Saraswati Puja Special',
  subtitle: 'Celebrate wisdom with personalized gifts',
  accentColor: '#f9a825',
  products: [
    { name: 'Customized Candle', image: '/images/banners/saraswati_banner.png', slug: 'customized-candle' },
    { name: 'Customized Cup', image: '/images/banners/saraswati_education.png', slug: 'customized-cup' },
    { name: 'Customized Fashion Apparel', image: '/images/banners/saraswati_fashion.png', slug: 'customized-photo-frame' },
    { name: 'Customized Fashion Apparel', image: '/images/banners/saraswati_sweet.png', slug: 'memento' },
  ],
};

const featuredProducts = [
  { name: 'Customized Cup', image: '/images/products/category-customized-cup.jpg', slug: 'customized-cup' },
  { name: 'Customized Photo Frame', image: '/images/products/category-customized-photo-frame.jpg', slug: 'customized-photo-frame' },
  { name: 'T Shirt', image: '/images/products/category-t-shirt.jpg', slug: 't-shirt' },
  { name: 'Customized Candle', image: '/images/products/category-customized-candle.jpg', slug: 'customized-candle' },
];

const whyChooseUs = [
  { title: 'Premium Quality', icon: '✨', description: 'High-quality materials and printing' },
  { title: 'Fast Delivery', icon: '🚚', description: 'Quick turnaround on all orders' },
  { title: 'Custom Designs', icon: '🎨', description: 'Your ideas, our expertise' },
  { title: 'Best Prices', icon: '💰', description: 'Competitive pricing guaranteed' },
];

const howItWorks = [
  { step: 1, title: 'Choose', description: 'Select your product from our catalog' },
  { step: 2, title: 'Customize', description: 'Add your design, photo, or text' },
  { step: 3, title: 'Order', description: 'Place your order securely' },
  { step: 4, title: 'Receive', description: 'Get it delivered to your doorstep' },
];

function Home() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startAutoSlide = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % festivalBanner.products.length);
    }, 3000);
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
    startAutoSlide();
  }, [startAutoSlide]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % festivalBanner.products.length);
    startAutoSlide();
  }, [startAutoSlide]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + festivalBanner.products.length) % festivalBanner.products.length);
    startAutoSlide();
  }, [startAutoSlide]);

  useEffect(() => {
    startAutoSlide();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [startAutoSlide]);

  return (
    <Container
      maxWidth={false}
      sx={{
        width: '100%',
        maxWidth: { xs: 'lg', md: '100%' },
        px: { xs: 2, md: 4, lg: 6 },
        animation: 'fadeIn 0.4s ease-in-out',
        '@keyframes fadeIn': {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 700,
            mb: 2,
            fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
          }}
        >
          Buy Custom Personalized & Corporate Gifts
        </Typography>
        <Typography
          variant="h5"
          color="text.secondary"
          sx={{
            mb: 3,
            maxWidth: '800px',
            mx: 'auto',
            fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
            px: 2,
          }}
        >
          We transform your ideas into beautiful, meaningful prints.
        </Typography>

        {/* CTA Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/products')}
            sx={{
              backgroundColor: '#1e3a8a',
              '&:hover': { backgroundColor: '#1e40af' },
              px: 4,
              py: 1.5,
            }}
          >
            Shop Now
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/contact')}
            sx={{
              borderColor: '#1e3a8a',
              color: '#1e3a8a',
              '&:hover': { borderColor: '#1e40af', backgroundColor: '#e0e7ff' },
              px: 4,
              py: 1.5,
            }}
          >
            Contact Us
          </Button>
        </Box>
      </Box>

      {/* Festival Banner with Carousel */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: festivalBanner.accentColor,
            mb: 1,
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
          }}
        >
          {festivalBanner.title}
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ mb: 3, fontSize: { xs: '1rem', md: '1.25rem' } }}
        >
          {festivalBanner.subtitle}
        </Typography>

        {/* Image Carousel */}
        <Box sx={{ position: 'relative', width: '100%' }}>
          <Link to={`/products/${festivalBanner.products[currentSlide].slug}`} style={{ textDecoration: 'none' }}>
            <Box
              sx={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 2,
                height: { xs: 250, sm: 400, md: 750 },
              }}
            >
              {/* Sliding Track */}
              <Box
                sx={{
                  display: 'flex',
                  width: `${festivalBanner.products.length * 100}%`,
                  height: '100%',
                  transition: 'transform 0.5s ease-in-out',
                  transform: `translateX(-${currentSlide * (100 / festivalBanner.products.length)}%)`,
                }}
              >
                {festivalBanner.products.map((product, index) => (
                  <Box
                    key={index}
                    component="img"
                    src={product.image}
                    alt={product.name}
                    sx={{
                      width: `${100 / festivalBanner.products.length}%`,
                      height: '100%',
                      objectFit: 'contain',
                      flexShrink: 0,
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Link>

          {/* Navigation Arrows */}
          <Button
            onClick={prevSlide}
            sx={{
              position: 'absolute',
              left: { xs: 10, md: 20 },
              top: '50%',
              transform: 'translateY(-50%)',
              minWidth: { xs: 40, md: 50 },
              height: { xs: 40, md: 50 },
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.9)',
              fontSize: { xs: '1.5rem', md: '2rem' },
              '&:hover': { backgroundColor: 'white' },
            }}
          >
            &#8249;
          </Button>
          <Button
            onClick={nextSlide}
            sx={{
              position: 'absolute',
              right: { xs: 10, md: 20 },
              top: '50%',
              transform: 'translateY(-50%)',
              minWidth: { xs: 40, md: 50 },
              height: { xs: 40, md: 50 },
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.9)',
              fontSize: { xs: '1.5rem', md: '2rem' },
              '&:hover': { backgroundColor: 'white' },
            }}
          >
            &#8250;
          </Button>
        </Box>

        {/* Dots Indicator */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
          {festivalBanner.products.map((_, index) => (
            <Box
              key={index}
              onClick={() => setCurrentSlide(index)}
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: index === currentSlide ? festivalBanner.accentColor : '#ccc',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Featured Products */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center', mb: 4 }}>
          Featured Products
        </Typography>
        <Grid container spacing={3}>
          {featuredProducts.map((product, index) => (
            <Grid size={{ xs: 6, sm: 6, md: 3 }} key={index}>
              <Link to={`/products/${product.slug}`} style={{ textDecoration: 'none' }}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': { transform: 'translateY(-5px)', boxShadow: 4 },
                  }}
                >
                  <CardMedia
                    component="img"
                    image={product.image}
                    alt={product.name}
                    sx={{
                      objectFit: 'cover',
                      height: { xs: 200, sm: 300, md: 500 }
                    }}
                  />
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e3a8a' }}>
                      {product.name}
                    </Typography>
                  </CardContent>
                </Card>
              </Link>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Why Choose Us */}
      <Box sx={{ mb: 6, backgroundColor: '#f8fafc', borderRadius: 3, p: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center', mb: 4 }}>
          Why Choose Us
        </Typography>
        <Grid container spacing={3}>
          {whyChooseUs.map((item, index) => (
            <Grid size={{ xs: 6, sm: 6, md: 3 }} key={index}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontSize: '2.5rem', mb: 1 }}>{item.icon}</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e3a8a' }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* How It Works */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center', mb: 4 }}>
          How It Works
        </Typography>
        <Grid container spacing={2}>
          {howItWorks.map((item, index) => (
            <Grid size={{ xs: 6, sm: 6, md: 3 }} key={index}>
              <Box sx={{ textAlign: 'center', position: 'relative' }}>
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    backgroundColor: '#1e3a8a',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  {item.step}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e3a8a' }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}

export default Home;
