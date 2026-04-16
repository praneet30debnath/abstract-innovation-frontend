import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, CircularProgress, Alert,
  Card, CardContent, Chip, Button, Divider,
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { api } from '../services/api';

interface TrackingScan {
  dateTime: string;
  scan: string;
  location: string;
  instructions: string;
}

interface TrackingData {
  waybill: string;
  status: string;
  statusCode: string;
  instructions: string;
  expectedDelivery: string | null;
  deliveredAt: string | null;
  scans: TrackingScan[];
}

function formatDateTime(dt: string): string {
  const d = new Date(dt);
  return d.toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

function formatDate(dt: string): string {
  return new Date(dt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function cleanLocation(loc: string): string {
  // "Naihati_Jagatdal_DPP (West Bengal)" → "Naihati Jagatdal DPP (West Bengal)"
  return loc.replace(/_/g, ' ');
}

export default function OrderTracking() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) return;
    api.get<TrackingData>(`/api/shipments/${orderId}/track`)
      .then(data => setTracking(data))
      .catch(err => setError(err.message || 'Could not fetch tracking info'))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 6, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </Container>
    );
  }

  if (!tracking || !tracking.waybill) {
    return (
      <Container maxWidth="sm" sx={{ py: 6, textAlign: 'center' }}>
        <LocalShippingIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">Not yet dispatched</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          We're preparing your order. Tracking will appear once it's dispatched.
        </Typography>
        <Button sx={{ mt: 3 }} onClick={() => navigate(-1)}>Go Back</Button>
      </Container>
    );
  }

  // Newest scan first
  const scans: TrackingScan[] = [...(tracking.scans || [])].reverse();
  const isDelivered = tracking.status === 'Delivered';

  return (
    <Container maxWidth="sm" sx={{ py: 3, pb: { xs: 10, md: 3 } }}>
      <Button onClick={() => navigate(-1)} sx={{ mb: 2 }} size="small">← Back</Button>

      <Typography variant="h5" fontWeight={700} gutterBottom>Track Order #{orderId}</Typography>

      {/* Status + waybill card */}
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">Waybill</Typography>
              <Typography variant="subtitle1" fontWeight={600}>{tracking.waybill}</Typography>
            </Box>
            <Chip
              label={tracking.status || 'In Transit'}
              color={isDelivered ? 'success' : 'primary'}
              variant={isDelivered ? 'filled' : 'outlined'}
            />
          </Box>
          {tracking.instructions && (
            <Typography variant="body2" color="text.secondary">
              {tracking.instructions}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Expected delivery banner */}
      {!isDelivered && tracking.expectedDelivery && (
        <Card variant="outlined" sx={{ mb: 3, bgcolor: '#f0fdf4', borderColor: '#86efac' }}>
          <CardContent sx={{ py: '12px !important', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <EventAvailableIcon sx={{ color: 'success.main' }} />
            <Box>
              <Typography variant="caption" color="success.dark" fontWeight={600} display="block">
                Expected Delivery
              </Typography>
              <Typography variant="body2" fontWeight={600} color="success.dark">
                {formatDate(tracking.expectedDelivery)}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Scan timeline */}
      {scans.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
          No scan events yet. Check back shortly.
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {scans.map((scan, idx) => {
            const isLatest = idx === 0;
            return (
              <Box key={idx} sx={{ display: 'flex', gap: 2 }}>
                {/* Timeline dot + connector */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 24 }}>
                  {isLatest
                    ? <CheckCircleIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                    : <RadioButtonUncheckedIcon sx={{ fontSize: 20, color: 'divider' }} />
                  }
                  {idx < scans.length - 1 && (
                    <Box sx={{ width: 2, flexGrow: 1, bgcolor: 'divider', my: 0.5 }} />
                  )}
                </Box>

                {/* Scan details */}
                <Box sx={{ pb: 2.5, opacity: isLatest ? 1 : 0.7, flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
                  <Typography variant="subtitle2" fontWeight={isLatest ? 700 : 500} color={isLatest ? 'text.primary' : 'text.secondary'}>
                    {scan.instructions}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                    {cleanLocation(scan.location)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' }, gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                    <Typography variant="caption" color="text.disabled">
                      {formatDateTime(scan.dateTime)}
                    </Typography>
                    <Chip label={scan.scan} size="small" variant="outlined" sx={{ height: 18, fontSize: 10, '& .MuiChip-label': { px: 0.75 } }} />
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      <Divider sx={{ my: 3 }} />
      <Typography variant="caption" color="text.disabled">
        Shipped via Delhivery. For delivery issues, contact us at no.reply@abstract-innovation.co.in
      </Typography>
    </Container>
  );
}
