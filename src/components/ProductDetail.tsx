import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Container, Typography, Box, Card, CardContent,
  IconButton, Tooltip, Button, ToggleButtonGroup, ToggleButton,
  CircularProgress, Alert,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { isOrdersEnabled } from '../utils/featureFlags';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

// ── API types ─────────────────────────────────────────────────────────────────

interface ApiColor { id: number; hex: string; name: string; image_url: string; }
interface ApiVariantImage { id: number; image_url: string; }
interface ApiVariant {
  id: number; name: string; price: number; image_url: string;
  height: number | null; width: number | null; dimension_unit: string | null;
  weight_grams: number | null;
  images: ApiVariantImage[]; colors: ApiColor[];
}
interface ApiProduct {
  id: number; slug: string; name: string;
  is_customizable: boolean; needs_size: boolean;
  variants: ApiVariant[];
}

// ── Image upload + size picker UI injected into every card ──────────────────

function ProductActions({
  productSlug,
  productName,
  variantName,
  price,
  weightGrams,
  needsImage,
  needsSize,
}: {
  productSlug: string;
  productName: string;
  variantName: string;
  price: number;
  weightGrams?: number;
  needsImage: boolean;
  needsSize: boolean;
}) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [size, setSize] = useState<string>('');
  const [added, setAdded] = useState(false);

  const canAdd =
    (!needsImage || imageFile !== null) &&
    (!needsSize || size !== '');

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setImageFile(file);
  }

  function handleAddToCart() {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }
    addItem({
      productSlug,
      productName,
      variantName,
      price,
      quantity: 1,
      weightGrams: weightGrams ?? undefined,
      imageFile: imageFile ?? undefined,
      size: size || undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
      {needsImage && (
        <Box>
          <Button
            component="label"
            variant="outlined"
            size="small"
            startIcon={<UploadFileIcon />}
            fullWidth
          >
            {imageFile ? imageFile.name : 'Upload Your Image'}
            <input type="file" accept="image/*" hidden onChange={handleFileChange} />
          </Button>
        </Box>
      )}

      {needsSize && (
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Size:
          </Typography>
          <ToggleButtonGroup
            value={size}
            exclusive
            onChange={(_e, val) => { if (val) setSize(val); }}
            size="small"
            sx={{ flexWrap: 'wrap', gap: 0.5 }}
          >
            {SIZES.map(s => (
              <ToggleButton key={s} value={s} sx={{ px: 1.5, py: 0.5, fontSize: '0.75rem' }}>
                {s}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
      )}

      <Button
        variant="contained"
        size="small"
        startIcon={<ShoppingCartIcon />}
        disabled={!canAdd}
        onClick={handleAddToCart}
        fullWidth
        sx={{ mt: 0.5 }}
      >
        {added ? 'Added!' : 'Add to Cart'}
      </Button>
    </Box>
  );
}

// ── Carousel ─────────────────────────────────────────────────────────────────

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
    if (swipeAxis.current === null && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      swipeAxis.current = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical';
    }
    if (swipeAxis.current !== 'horizontal') return;
    e.preventDefault();
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
      setTimeout(() => { setCurrent(c => (c + 1) % total); setDragOffset(0); setCompleting(false); lockedRef.current = false; }, 280);
    } else if (dragOffset > 40) {
      lockedRef.current = true;
      setCompleting(true);
      setDragOffset(w);
      setTimeout(() => { setCurrent(c => (c - 1 + total) % total); setDragOffset(0); setCompleting(false); lockedRef.current = false; }, 280);
    } else {
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
        position: 'relative', width: '100%', height: 300, overflow: 'hidden',
        backgroundColor: '#ffffff',
        '@keyframes slideOutLeft': { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-100%)' } },
        '@keyframes slideOutRight': { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(100%)' } },
        '@keyframes slideInFromRight': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        '@keyframes slideInFromLeft': { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(0)' } },
      }}
    >
      <Box component="img" src={images[current]} alt={alt} sx={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        objectFit: 'contain', userSelect: 'none', pointerEvents: 'none',
        ...(animating
          ? { animation: animating === 'left' ? 'slideOutLeft 0.32s ease forwards' : 'slideOutRight 0.32s ease forwards' }
          : { transform: `translateX(${dragOffset}px)`, transition: completing ? 'transform 0.28s ease' : 'none' }
        ),
      }} />
      {isDragging && !animating && (
        <Box component="img" src={images[adjacentIdx]} alt={alt} sx={{
          position: 'absolute', width: '100%', height: '100%', objectFit: 'contain',
          userSelect: 'none', pointerEvents: 'none',
          transform: adjacentTransform,
          transition: completing ? 'transform 0.28s ease' : 'none',
        }} />
      )}
      {animating && (
        <Box component="img" src={images[animating === 'left' ? nextIdx : prevIdx]} alt={alt} sx={{
          position: 'absolute', width: '100%', height: '100%', objectFit: 'contain',
          userSelect: 'none', pointerEvents: 'none',
          animation: animating === 'left' ? 'slideInFromRight 0.32s ease forwards' : 'slideInFromLeft 0.32s ease forwards',
        }} />
      )}
      {total > 1 && (
        <>
          <IconButton onClick={arrowPrev} size="small" sx={{ position: 'absolute', left: 4, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: 'rgba(255,255,255,1)' }, zIndex: 1 }}>
            <ChevronLeftIcon />
          </IconButton>
          <IconButton onClick={arrowNext} size="small" sx={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: 'rgba(255,255,255,1)' }, zIndex: 1 }}>
            <ChevronRightIcon />
          </IconButton>
          <Box sx={{ position: 'absolute', bottom: 8, width: '100%', display: 'flex', justifyContent: 'center', gap: 0.5, zIndex: 1 }}>
            {images.map((_, i) => (
              <Box key={i} onClick={() => { if (i > current) arrowNext(); else if (i < current) arrowPrev(); }}
                sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: i === current ? 'primary.main' : 'rgba(0,0,0,0.3)', cursor: 'pointer' }} />
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}

// ── Lightbox ──────────────────────────────────────────────────────────────────

function ImageLightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <Box onClick={onClose} sx={{
      position: 'fixed', inset: 0, zIndex: 1300, backgroundColor: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.2s ease',
      '@keyframes fadeIn': { from: { opacity: 0 }, to: { opacity: 1 } },
      cursor: 'zoom-out',
    }}>
      <Box component="img" src={src} alt={alt} onClick={e => e.stopPropagation()} sx={{
        maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 2,
        boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
        animation: 'zoomIn 0.2s ease',
        '@keyframes zoomIn': { from: { transform: 'scale(0.9)', opacity: 0 }, to: { transform: 'scale(1)', opacity: 1 } },
        cursor: 'default',
      }} />
      <Box sx={{ position: 'absolute', top: 16, right: 20, color: 'white', fontSize: '2rem', lineHeight: 1, cursor: 'pointer', opacity: 0.8, '&:hover': { opacity: 1 } }} onClick={onClose}>
        ✕
      </Box>
    </Box>
  );
}

// ── Color picker card ─────────────────────────────────────────────────────────

function ColorPickerCard({
  productSlug, productName, name, price, weightGrams, colors, needsImage, needsSize,
}: {
  productSlug: string;
  productName: string;
  name: string;
  price: number;
  weightGrams?: number;
  colors: { hex: string; name: string; image: string }[];
  needsImage: boolean;
  needsSize: boolean;
}) {
  const { user } = useAuth();
  const [selected, setSelected] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const active = colors[selected];

  return (
    <>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s, box-shadow 0.3s', '&:hover': { transform: 'translateY(-8px)', boxShadow: 6 } }}>
        <Box sx={{ width: '100%', height: 300, overflow: 'hidden', backgroundColor: '#ffffff', cursor: 'zoom-in', position: 'relative' }} onClick={() => setLightboxOpen(true)}>
          <Box component="img" src={active.image} alt={`${name} - ${active.name}`} sx={{ width: '100%', height: '100%', objectFit: 'contain', transition: 'transform 0.35s ease', '&:hover': { transform: 'scale(1.08)' } }} />
        </Box>
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" component="h3" gutterBottom>{name}</Typography>
          <Typography variant="h5" color="primary" sx={{ fontWeight: 600, mb: 1.5 }}>₹{price}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Color: <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>{active.name}</Box>
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
            {colors.map((color, i) => (
              <Tooltip key={i} title={color.name} placement="top" arrow>
                <Box onClick={() => setSelected(i)} sx={{
                  width: 28, height: 28, borderRadius: '50%', backgroundColor: color.hex, cursor: 'pointer',
                  border: i === selected ? '2px solid #1e3a8a' : '2px solid transparent',
                  outline: i === selected ? '1px solid #1e3a8a' : '1px solid #ccc',
                  outlineOffset: '2px',
                  transition: 'outline 0.15s, border 0.15s',
                  '&:hover': { outline: '1px solid #1e3a8a', outlineOffset: '2px' },
                  ...(color.hex === '#f3f3f3' || color.hex === '#ffffff' ? { boxShadow: 'inset 0 0 0 1px #ccc' } : {}),
                }} />
              </Tooltip>
            ))}
          </Box>
          {isOrdersEnabled(user?.email) && (
            <ProductActions
              productSlug={productSlug}
              productName={productName}
              variantName={`${name} - ${active.name}`}
              price={price}
              weightGrams={weightGrams}
              needsImage={needsImage}
              needsSize={needsSize}
            />
          )}
        </CardContent>
      </Card>
      {lightboxOpen && <ImageLightbox src={active.image} alt={`${name} - ${active.name}`} onClose={() => setLightboxOpen(false)} />}
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

function ProductDetail() {
  const { productName } = useParams<{ productName: string }>();
  const { user } = useAuth();
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!productName) return;
    setLoading(true);
    setError('');
    api.get<ApiProduct>(`/api/products/${productName}`)
      .then(setProduct)
      .catch(err => setError(err.message || 'Failed to load product'))
      .finally(() => setLoading(false));
  }, [productName]);

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

  if (!product) return null;

  const variants = [...product.variants].sort((a, b) => a.price - b.price);
  const needsImage = Boolean(product.is_customizable);
  const needsSize = Boolean(product.needs_size);
  const displayName = product.name;

  return (
    <Container maxWidth="lg" sx={{ py: 2, animation: 'fadeIn 0.4s ease-in-out', '@keyframes fadeIn': { '0%': { opacity: 0, transform: 'translateY(10px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } } }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '2rem', sm: '2.5rem', md: '3.75rem' } }}>
          {displayName}
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 3, maxWidth: '800px', mx: 'auto', fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' }, px: 2 }}>
          Choose from our collection
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
        {variants.map((variant) => {
          const hasCarousel = variant.images.length > 0;
          const mappedColors = variant.colors.map(c => ({ hex: c.hex, name: c.name, image: c.image_url }));
          const dimensions = variant.height
            ? { height: variant.height, width: variant.width!, unit: variant.dimension_unit! }
            : null;

          return variant.colors.length > 0 ? (
            <ColorPickerCard
              key={variant.id}
              productSlug={productName || ''}
              productName={displayName}
              name={variant.name}
              price={variant.price}
              weightGrams={variant.weight_grams ?? undefined}
              colors={mappedColors}
              needsImage={needsImage}
              needsSize={needsSize}
            />
          ) : (
            <Card key={variant.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s, box-shadow 0.3s', '&:hover': { transform: 'translateY(-8px)', boxShadow: 6 } }}>
              {hasCarousel ? (
                <ImageCarousel images={variant.images.map(i => i.image_url)} alt={variant.name} />
              ) : (
                <Box component="img" height="300px" src={variant.image_url} alt={variant.name} sx={{ objectFit: 'contain', backgroundColor: '#ffffff', width: '100%' }} />
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h3" gutterBottom>{variant.name}</Typography>
                <Typography variant="h5" color="primary" sx={{ fontWeight: 600 }}>₹{variant.price}</Typography>
                {dimensions && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {dimensions.height} x {dimensions.width} {dimensions.unit}
                  </Typography>
                )}
                {isOrdersEnabled(user?.email) && (
                  <ProductActions
                    productSlug={productName || ''}
                    productName={displayName}
                    variantName={variant.name}
                    price={variant.price}
                    weightGrams={variant.weight_grams ?? undefined}
                    needsImage={needsImage}
                    needsSize={needsSize}
                  />
                )}
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {variants.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" color="text.secondary">Coming Soon!</Typography>
        </Box>
      )}
    </Container>
  );
}

export default ProductDetail;
