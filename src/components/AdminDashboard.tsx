import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Box, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, CircularProgress, Alert,
} from '@mui/material';
import { api } from '../services/api';

interface OrderRow {
  order_id: number;
  status: string;
  created_at: string;
  customer_name: string | null;
  customer_email: string;
  item_id: number;
  product_name: string;
  variant_name: string;
  price: number;
  quantity: number;
  image_url: string | null;
  size: string | null;
}

const STATUS_COLOR: Record<string, 'warning' | 'info' | 'success' | 'error' | 'default'> = {
  pending: 'warning',
  processing: 'info',
  completed: 'success',
  cancelled: 'error',
};

export default function AdminDashboard() {
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<OrderRow[]>('/api/orders')
      .then(setRows)
      .catch(err => setError(err.message || 'Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Container sx={{ pt: 4 }}><Alert severity="error">{error}</Alert></Container>;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>Orders</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {rows.length} item{rows.length !== 1 ? 's' : ''} across all orders
      </Typography>

      {rows.length === 0 ? (
        <Typography color="text.secondary">No orders yet.</Typography>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f1f5f9' }}>
                <TableCell><strong>Order ID</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Customer</strong></TableCell>
                <TableCell><strong>Product</strong></TableCell>
                <TableCell><strong>Variant</strong></TableCell>
                <TableCell><strong>Size</strong></TableCell>
                <TableCell><strong>Qty</strong></TableCell>
                <TableCell><strong>Price</strong></TableCell>
                <TableCell><strong>Image</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map(row => (
                <TableRow key={row.item_id} hover>
                  <TableCell>#{row.order_id}</TableCell>
                  <TableCell>{new Date(row.created_at).toLocaleDateString('en-IN')}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{row.customer_name || '—'}</Typography>
                    <Typography variant="caption" color="text.secondary">{row.customer_email}</Typography>
                  </TableCell>
                  <TableCell>{row.product_name}</TableCell>
                  <TableCell>{row.variant_name}</TableCell>
                  <TableCell>{row.size || '—'}</TableCell>
                  <TableCell>{row.quantity}</TableCell>
                  <TableCell>₹{row.price}</TableCell>
                  <TableCell>
                    {row.image_url ? (
                      <Box
                        component="a"
                        href={row.image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Box
                          component="img"
                          src={row.image_url}
                          alt="order"
                          sx={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 1, display: 'block' }}
                        />
                      </Box>
                    ) : '—'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.status}
                      color={STATUS_COLOR[row.status] || 'default'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}
