import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box, Card, CardContent, IconButton, Tooltip } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import productData from '../utils/productData';
import { ColorVariant } from '../utils/productData/types';

function ImageCarousel({ images, alt }: { images: string[]; alt: string }) {
  const [current, setCurrent] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [animating, setAnimating] = useState<'left' | 'right' | null>(null);
  const [completing, setCompleting] = useState(false);
  const touchStartX = React.useRef<number | null>(null);
  const touchStartY = React.useRef<number | null>(null);
  const swipeAxis = React.useRef<'horizontal' | 'vertical' | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const lockedRef = React.useRef(false);

  // Attach touchmove as non-passive so preventDefault works
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onTouchMove = (e: TouchEvent) => {
      if (swipeAxis.current === 'horizontal') e.preventDefault();
    };
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => el.removeEventListener('touchmove', onTouchMove);
  }, []);

  const total = images.length;
  const nextIdx = (current + 1) % total;
  const prevIdx = (current - 1 + total) % total;

  // Arrow click: keyframe slide animation
  const arrowNext = () => {
    if (lockedRef.current || total <= 1) return;
    lockedRef.current = true;
    setAnimating('left');
    setTimeout(() => {
      setCurrent(c => (c + 1) % total);
      setAnimating(null);
      lockedRef.current = false;
    }, 320);
  };

  const arrowPrev = () => {
    if (lockedRef.current || total <= 1) return;
    lockedRef.current = true;
    setAnimating('right');
    setTimeout(() => {
      setCurrent(c => (c - 1 + total) % total);
      setAnimating(null);
      lockedRef.current = false;
    }, 320);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (lockedRef.current || total <= 1) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    swipeAxis.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;

    // Determine axis on first meaningful movement
    if (swipeAxis.current === null && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      swipeAxis.current = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical';
    }

    if (swipeAxis.current !== 'horizontal') return;

    e.preventDefault(); // prevent page scroll only for horizontal swipes
    setDragOffset(dx);
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null) return;
    touchStartX.current = null;
    touchStartY.current = null;
    if (swipeAxis.current !== 'horizontal') {
      swipeAxis.current = null;
      return;
    }
    swipeAxis.current = null;
    const w = containerRef.current?.offsetWidth || 300;

    if (dragOffset < -40) {
      lockedRef.current = true;
      setCompleting(true);
      setDragOffset(-w);
      setTimeout(() => {
        setCurrent(c => (c + 1) % total);
        setDragOffset(0);
        setCompleting(false);
        lockedRef.current = false;
      }, 280);
    } else if (dragOffset > 40) {
      lockedRef.current = true;
      setCompleting(true);
      setDragOffset(w);
      setTimeout(() => {
        setCurrent(c => (c - 1 + total) % total);
        setDragOffset(0);
        setCompleting(false);
        lockedRef.current = false;
      }, 280);
    } else {
      // Snap back
      setCompleting(true);
      setDragOffset(0);
      setTimeout(() => setCompleting(false), 280);
    }
  };

  const isDragging = dragOffset !== 0 || completing;
  const adjacentIdx = dragOffset <= 0 ? nextIdx : prevIdx;
  const adjacentTransform = dragOffset <= 0
    ? `translateX(calc(100% + ${dragOffset}px))`
    : `translateX(calc(-100% + ${dragOffset}px))`;

  return (
    <Box
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      sx={{
        position: 'relative',
        width: '100%',
        height: 300,
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        '@keyframes slideOutLeft': { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-100%)' } },
        '@keyframes slideOutRight': { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(100%)' } },
        '@keyframes slideInFromRight': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        '@keyframes slideInFromLeft': { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(0)' } },
      }}
    >
      {/* Current image: follows finger during drag, keyframe slide on arrow click */}
      <Box
        component="img"
        src={images[current]}
        alt={alt}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          userSelect: 'none',
          pointerEvents: 'none',
          ...(animating
            ? { animation: animating === 'left' ? 'slideOutLeft 0.32s ease forwards' : 'slideOutRight 0.32s ease forwards' }
            : { transform: `translateX(${dragOffset}px)`, transition: completing ? 'transform 0.28s ease' : 'none' }
          ),
        }}
      />

      {/* Adjacent image peeking in during drag/swipe */}
      {isDragging && !animating && (
        <Box
          component="img"
          src={images[adjacentIdx]}
          alt={alt}
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            userSelect: 'none',
            pointerEvents: 'none',
            transform: adjacentTransform,
            transition: completing ? 'transform 0.28s ease' : 'none',
          }}
        />
      )}

      {/* Incoming image during arrow click animation */}
      {animating && (
        <Box
          component="img"
          src={images[animating === 'left' ? nextIdx : prevIdx]}
          alt={alt}
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            userSelect: 'none',
            pointerEvents: 'none',
            animation: animating === 'left' ? 'slideInFromRight 0.32s ease forwards' : 'slideInFromLeft 0.32s ease forwards',
          }}
        />
      )}

      {total > 1 && (
        <>
          <IconButton
            onClick={arrowPrev}
            size="small"
            sx={{
              position: 'absolute',
              left: 4,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(255,255,255,0.8)',
              '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
              zIndex: 1,
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
          <IconButton
            onClick={arrowNext}
            size="small"
            sx={{
              position: 'absolute',
              right: 4,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(255,255,255,0.8)',
              '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
              zIndex: 1,
            }}
          >
            <ChevronRightIcon />
          </IconButton>
          <Box sx={{ position: 'absolute', bottom: 8, width: '100%', display: 'flex', justifyContent: 'center', gap: 0.5, zIndex: 1 }}>
            {images.map((_, i) => (
              <Box
                key={i}
                onClick={() => { if (i > current) arrowNext(); else if (i < current) arrowPrev(); }}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: i === current ? 'primary.main' : 'rgba(0,0,0,0.3)',
                  cursor: 'pointer',
                }}
              />
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}

function ColorPickerCard({ name, price, colors }: { name: string; price: number; colors: ColorVariant[] }) {
  const [selected, setSelected] = useState(0);
  const active = colors[selected];

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': { transform: 'translateY(-8px)', boxShadow: 6 },
      }}
    >
      <Box
        component="img"
        src={active.image}
        alt={`${name} - ${active.name}`}
        sx={{
          width: '100%',
          height: 300,
          objectFit: 'contain',
          backgroundColor: '#ffffff',
        }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="h3" gutterBottom>
          {name}
        </Typography>
        <Typography variant="h5" color="primary" sx={{ fontWeight: 600, mb: 1.5 }}>
          ₹{price}
        </Typography>

        {/* Color label */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Color: <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>{active.name}</Box>
        </Typography>

        {/* Color swatches */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
          {colors.map((color, i) => (
            <Tooltip key={i} title={color.name} placement="top" arrow>
              <Box
                onClick={() => setSelected(i)}
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: color.hex,
                  cursor: 'pointer',
                  border: i === selected
                    ? '2px solid #1e3a8a'
                    : '2px solid transparent',
                  outline: i === selected ? '1px solid #1e3a8a' : '1px solid #ccc',
                  outlineOffset: '2px',
                  transition: 'outline 0.15s, border 0.15s',
                  '&:hover': { outline: '1px solid #1e3a8a', outlineOffset: '2px' },
                  // White swatch needs a border to be visible
                  ...(color.hex === '#f3f3f3' || color.hex === '#ffffff'
                    ? { boxShadow: 'inset 0 0 0 1px #ccc' }
                    : {}),
                }}
              />
            </Tooltip>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

function ProductDetail() {
  const { productName } = useParams<{ productName: string }>();

  const displayName = productName
    ?.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ') || '';

  const variants = [...(productData[productName || ''] || [])].sort((a, b) => a.price - b.price);
  const isFridgeMagnet = productName === 'fridge-magnet';

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
          sx={{
            fontWeight: 700,
            mb: 2,
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3.75rem' },
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
            fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
            px: 2,
          }}
        >
          Choose from our collection
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: 3,
        }}
      >
        {variants.map((variant, index) => (
          variant.colors ? (
            <ColorPickerCard
              key={index}
              name={variant.name}
              price={variant.price}
              colors={variant.colors}
            />
          ) : (
            <Card
              key={index}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': { transform: 'translateY(-8px)', boxShadow: 6 },
              }}
            >
              {isFridgeMagnet && variant.images ? (
                <ImageCarousel images={variant.images} alt={variant.name} />
              ) : (
                <Box
                  component="img"
                  height="300px"
                  src={variant.image}
                  alt={variant.name}
                  sx={{ objectFit: 'contain', backgroundColor: '#ffffff', width: '100%' }}
                />
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h3" gutterBottom>
                  {variant.name}
                </Typography>
                <Typography variant="h5" color="primary" sx={{ fontWeight: 600 }}>
                  ₹{variant.price}
                </Typography>
                {!isFridgeMagnet && variant.dimensions && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {variant.dimensions.height} x {variant.dimensions.width} {variant.dimensions.unit}
                  </Typography>
                )}
              </CardContent>
            </Card>
          )
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
