import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Select, MenuItem, Chip, CircularProgress,
  Alert, FormControl, Dialog, DialogTitle, DialogContent, IconButton, Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { api } from '../../services/api';

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
  ship_name: string;
  ship_phone: string;
  ship_address1: string;
  ship_address2: string | null;
  ship_city: string;
  ship_state: string;
  ship_pincode: string;
}

type Status = 'pending' | 'processing' | 'completed' | 'cancelled';

const STATUS_STYLES: Record<Status, { color: string; bg: string }> = {
  pending:    { color: '#92400e', bg: '#fef3c7' },
  processing: { color: '#1e40af', bg: '#dbeafe' },
  completed:  { color: '#14532d', bg: '#dcfce7' },
  cancelled:  { color: '#7f1d1d', bg: '#fee2e2' },
};

export default function AdminOrdersPage() {
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<number | null>(null);
  const [addressRow, setAddressRow] = useState<OrderRow | null>(null);

  useEffect(() => {
    api.get<OrderRow[]>('/api/orders')
      .then(setRows)
      .catch(err => setError(err.message || 'Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  async function handleStatusChange(orderId: number, status: Status) {
    setUpdating(orderId);
    try {
      await api.patch(`/api/orders/${orderId}/status`, { status });
      setRows(prev => prev.map(r => r.order_id === orderId ? { ...r, status } : r));
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setUpdating(null);
    }
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" fontWeight={700} color="#0f172a">Orders</Typography>
        <Typography variant="body2" color="text.secondary">{rows.length} item{rows.length !== 1 ? 's' : ''}</Typography>
      </Box>

      {rows.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <Typography>No orders yet.</Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                {['Order', 'Date', 'Customer', 'Product', 'Variant', 'Size', 'Qty', 'Price', 'Image', 'Status'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 600, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map(row => {
                const style = STATUS_STYLES[row.status as Status] ?? { color: '#64748b', bg: '#f1f5f9' };
                const isUpdating = updating === row.order_id;
                return (
                  <TableRow key={row.item_id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{ color: '#2563eb', cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => setAddressRow(row)}
                      >
                        #{row.order_id}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', color: '#64748b', fontSize: '0.8rem' }}>
                      {new Date(row.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>{row.customer_name || '—'}</Typography>
                      <Typography variant="caption" color="text.secondary">{row.customer_email}</Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem' }}>{row.product_name}</TableCell>
                    <TableCell sx={{ fontSize: '0.85rem', color: '#64748b' }}>{row.variant_name}</TableCell>
                    <TableCell>{row.size || '—'}</TableCell>
                    <TableCell>{row.quantity}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>₹{row.price}</TableCell>
                    <TableCell>
                      {row.image_url ? (
                        <Box component="a" href={row.image_url} target="_blank" rel="noopener noreferrer">
                          <Box component="img" src={row.image_url} alt="order"
                            sx={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 1.5, display: 'block', border: '1px solid #e2e8f0' }} />
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">—</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" disabled={isUpdating}>
                        <Select
                          value={row.status}
                          onChange={e => handleStatusChange(row.order_id, e.target.value as Status)}
                          renderValue={val => (
                            <Chip
                              label={val}
                              size="small"
                              sx={{ bgcolor: style.bg, color: style.color, fontWeight: 600, fontSize: '0.7rem', height: 22, cursor: 'pointer' }}
                            />
                          )}
                          sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 'none' }, '& .MuiSelect-select': { p: 0 } }}
                        >
                          {(['pending', 'processing', 'completed', 'cancelled'] as Status[]).map(s => (
                            <MenuItem key={s} value={s}>
                              <Chip
                                label={s}
                                size="small"
                                sx={{ bgcolor: STATUS_STYLES[s].bg, color: STATUS_STYLES[s].color, fontWeight: 600, fontSize: '0.7rem', height: 22 }}
                              />
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Address overlay */}
      <Dialog open={Boolean(addressRow)} onClose={() => setAddressRow(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOnIcon sx={{ color: '#1e3a8a' }} />
            <Typography fontWeight={700}>Order #{addressRow?.order_id} — Delivery Address</Typography>
          </Box>
          <IconButton size="small" onClick={() => setAddressRow(null)}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          {addressRow && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography fontWeight={600}>{addressRow.ship_name}</Typography>
              <Typography variant="body2" color="text.secondary">{addressRow.ship_phone}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>{addressRow.ship_address1}</Typography>
              {addressRow.ship_address2 && (
                <Typography variant="body2">{addressRow.ship_address2}</Typography>
              )}
              <Typography variant="body2">
                {addressRow.ship_city}, {addressRow.ship_state} – {addressRow.ship_pincode}
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
