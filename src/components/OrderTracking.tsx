import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, CircularProgress, Alert,
  Card, CardContent, Chip, Button, Divider,
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { api } from '../services/api';

interface TrackingScan {
  date: string;
  time: string;
  location: string;
  activity: string;
  'sr-status-label': string;
}

interface TrackingData {
  waybill: string;
  status: string;
  scans: TrackingScan[];
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

  const scans: TrackingScan[] = tracking.scans || [];

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Button onClick={() => navigate(-1)} sx={{ mb: 2 }} size="small">← Back</Button>

      <Typography variant="h5" fontWeight={700} gutterBottom>Track Order #{orderId}</Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="body2" color="text.secondary">Waybill</Typography>
              <Typography variant="subtitle1" fontWeight={600}>{tracking.waybill}</Typography>
            </Box>
            <Chip
              label={tracking.status || 'In Transit'}
              color={tracking.status === 'Delivered' ? 'success' : 'primary'}
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>

      {scans.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
          No scan events yet. Check back shortly.
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {scans.map((scan, idx) => (
            <Box key={idx} sx={{ display: 'flex', gap: 2 }}>
              {/* Timeline indicator */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 24 }}>
                {idx === 0
                  ? <CheckCircleOutlineIcon color="primary" fontSize="small" />
                  : <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'divider', mt: 0.5 }} />
                }
                {idx < scans.length - 1 && (
                  <Box sx={{ width: 2, flexGrow: 1, bgcolor: 'divider', my: 0.5 }} />
                )}
              </Box>

              {/* Scan details */}
              <Box sx={{ pb: 2 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {scan['sr-status-label'] || scan.activity}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {scan.location}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  {scan.date} {scan.time}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      <Divider sx={{ my: 3 }} />
      <Typography variant="caption" color="text.disabled">
        Shipped via Delhivery. For delivery issues, contact us at no.reply@abstract-innovation.co.in
      </Typography>
    </Container>
  );
}
