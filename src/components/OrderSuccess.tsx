import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

export default function OrderSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const orderId = params.get('orderId');

  return (
    <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
      <CheckCircleOutlineIcon sx={{ fontSize: 72, color: 'success.main', mb: 2 }} />
      <Typography variant="h4" fontWeight={700} gutterBottom>Order Placed!</Typography>
      {orderId && (
        <Typography color="text.secondary" sx={{ mb: 1 }}>
          Order ID: <strong>#{orderId}</strong>
        </Typography>
      )}
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        We've received your order and will get started on it soon.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/products')}>
        Continue Shopping
      </Button>
    </Container>
  );
}
