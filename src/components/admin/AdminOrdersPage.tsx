import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Select, MenuItem, Chip, CircularProgress,
  Alert, FormControl, Dialog, DialogTitle, DialogContent, IconButton, Divider,
  Button, TextField, Tooltip, Checkbox, Snackbar,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CancelIcon from '@mui/icons-material/Cancel';
import { api } from '../../services/api';

interface OrderRow {
  order_id: number;
  status: string;
  amount: number | null;
  payment_id: string | null;
  paid_at: string | null;
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
  waybill: string | null;
  delhivery_status: string | null;
  pickup_request_id: number | null;
  pickup_scheduled_date: string | null;
}

type Status = 'pending' | 'processing' | 'completed' | 'cancelled' | 'PAID' | 'PAYMENT_FAILED' | 'REFUNDED';

const STATUS_STYLES: Record<Status, { color: string; bg: string }> = {
  pending:        { color: '#92400e', bg: '#fef3c7' },
  processing:     { color: '#1e40af', bg: '#dbeafe' },
  completed:      { color: '#14532d', bg: '#dcfce7' },
  cancelled:      { color: '#7f1d1d', bg: '#fee2e2' },
  PAID:           { color: '#14532d', bg: '#bbf7d0' },
  PAYMENT_FAILED: { color: '#7f1d1d', bg: '#fecaca' },
  REFUNDED:       { color: '#3730a3', bg: '#e0e7ff' },
};

export default function AdminOrdersPage() {
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<number | null>(null);
  const [addressRow, setAddressRow] = useState<OrderRow | null>(null);
  const [dispatching, setDispatching] = useState<number | null>(null);
  const [fetchingLabel, setFetchingLabel] = useState<number | null>(null);
  const [cancelling, setCancelling] = useState<number | null>(null);

  // Pickup scheduling state
  const [pickupDate, setPickupDate] = useState('');
  const [schedulingPickup, setSchedulingPickup] = useState(false);
  const [pickupSnackbar, setPickupSnackbar] = useState<string | null>(null);
  const [selectedForPickup, setSelectedForPickup] = useState<Set<number>>(new Set());

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

  async function handleDispatch(orderId: number) {
    if (!window.confirm(`Dispatch order #${orderId} via Delhivery?`)) return;
    setDispatching(orderId);
    try {
      const { waybill } = await api.post<{ waybill: string; sortCode: string }>(
        `/api/shipments/${orderId}/dispatch`, {}
      );
      setRows(prev => prev.map(r => r.order_id === orderId ? { ...r, waybill } : r));
    } catch (err: any) {
      alert(err.message || 'Dispatch failed');
    } finally {
      setDispatching(null);
    }
  }

  async function handleLabel(orderId: number) {
    setFetchingLabel(orderId);
    try {
      const { pdfUrl } = await api.get<{ pdfUrl: string }>(`/api/shipments/${orderId}/label`);
      window.open(pdfUrl, '_blank');
    } catch (err: any) {
      alert(err.message || 'Failed to fetch label');
    } finally {
      setFetchingLabel(null);
    }
  }

  async function handleCancelShipment(orderId: number, waybill: string) {
    if (!window.confirm(`Cancel Delhivery shipment ${waybill} for order #${orderId}? This cannot be undone.`)) return;
    setCancelling(orderId);
    try {
      await api.delete(`/api/shipments/${orderId}`);
      setRows(prev => prev.map(r => r.order_id === orderId ? { ...r, waybill: null, delhivery_status: null, pickup_request_id: null, pickup_scheduled_date: null } : r));
    } catch (err: any) {
      alert(err.message || 'Failed to cancel shipment');
    } finally {
      setCancelling(null);
    }
  }

  async function handleSchedulePickup() {
    if (!pickupDate) { alert('Please select a pickup date'); return; }

    const selected = Array.from(selectedForPickup);
    if (selected.length === 0) { alert('Select at least one order for pickup'); return; }

    // Validation: any selected order without a waybill?
    const noWaybill = selected.filter(id => {
      const group = groupMap.get(id);
      return !group || !group[0].waybill;
    });
    if (noWaybill.length > 0) {
      alert(`Orders ${noWaybill.map(id => `#${id}`).join(', ')} have no waybill. Dispatch them first.`);
      return;
    }

    // Warning: any selected order already scheduled for pickup?
    const alreadyScheduled = selected.filter(id => {
      const group = groupMap.get(id);
      return group && group[0].pickup_request_id !== null;
    });
    if (alreadyScheduled.length > 0) {
      const ok = window.confirm(
        `Orders ${alreadyScheduled.map(id => `#${id}`).join(', ')} are already marked for pickup. Schedule again anyway?`
      );
      if (!ok) return;
    }

    setSchedulingPickup(true);
    try {
      const result = await api.post<{ pickupId: number; pickupTime: string; order_ids: number[] }>('/api/shipments/pickup', {
        pickup_date: pickupDate,
        order_ids: selected,
      });
      setRows(prev => prev.map(r =>
        selected.includes(r.order_id)
          ? { ...r, pickup_request_id: result.pickupId, pickup_scheduled_date: pickupDate }
          : r
      ));
      setSelectedForPickup(new Set());
      const timeStr = result.pickupTime ? ` at ${result.pickupTime}` : '';
      const pickupRef = result.pickupId ? ` #${result.pickupId}` : '';
      setPickupSnackbar(`Pickup${pickupRef} confirmed${timeStr}`);
    } catch (err: any) {
      alert(err.message || 'Failed to schedule pickup');
    } finally {
      setSchedulingPickup(false);
    }
  }

  // Group flat rows into per-order arrays, preserving sort order
  const orderGroups: OrderRow[][] = [];
  const groupMap = new Map<number, OrderRow[]>();
  for (const row of rows) {
    if (!groupMap.has(row.order_id)) {
      const group: OrderRow[] = [];
      groupMap.set(row.order_id, group);
      orderGroups.push(group);
    }
    groupMap.get(row.order_id)!.push(row);
  }

  const dispatchedCount = selectedForPickup.size;

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" fontWeight={700} color="#0f172a">Orders</Typography>
        <Typography variant="body2" color="text.secondary">{rows.length} item{rows.length !== 1 ? 's' : ''}</Typography>
      </Box>

      {/* Pickup scheduler */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, p: 2, border: '1px solid #e2e8f0', borderRadius: 2, bgcolor: '#f8fafc' }}>
        <LocalShippingIcon sx={{ color: '#1e3a8a' }} />
        <Typography variant="body2" fontWeight={600}>Schedule Pickup</Typography>
        <TextField
          type="date"
          size="small"
          value={pickupDate}
          onChange={e => setPickupDate(e.target.value)}
          inputProps={{ min: new Date().toISOString().split('T')[0] }}
          sx={{ width: 160 }}
        />
        <Button
          variant="contained"
          size="small"
          disabled={schedulingPickup || !pickupDate || dispatchedCount === 0}
          onClick={handleSchedulePickup}
          sx={{ bgcolor: '#1e3a8a', '&:hover': { bgcolor: '#1e40af' } }}
        >
          {schedulingPickup ? 'Scheduling…' : dispatchedCount > 0 ? `Schedule (${dispatchedCount} selected)` : 'Schedule Pickup'}
        </Button>
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
                {['', 'Order', 'Date', 'Customer', 'Product', 'Variant', 'Size', 'Qty', 'Price', 'Image', 'Status', 'Shipment', 'Pickup'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 600, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {orderGroups.map(group => {
                const first = group[0];
                const span = group.length;
                const style = STATUS_STYLES[first.status as Status] ?? { color: '#64748b', bg: '#f1f5f9' };
                const isUpdating = updating === first.order_id;
                const isDispatching = dispatching === first.order_id;
                const isFetchingLabel = fetchingLabel === first.order_id;
                const isCancelling = cancelling === first.order_id;

                // Cells that span all items of this order
                const isChecked = selectedForPickup.has(first.order_id);
                const alreadyPickup = first.pickup_request_id !== null;
                const mergedCheckboxCell = (
                  <TableCell rowSpan={span} sx={{ verticalAlign: 'top', borderBottom: '2px solid #e2e8f0', width: 40, px: 0.5 }}>
                    {first.waybill && (
                      <Tooltip title={alreadyPickup ? `Already scheduled (pickup #${first.pickup_request_id})` : 'Select for pickup'}>
                        <Checkbox
                          size="small"
                          checked={isChecked}
                          onChange={e => {
                            setSelectedForPickup(prev => {
                              const next = new Set(prev);
                              e.target.checked ? next.add(first.order_id) : next.delete(first.order_id);
                              return next;
                            });
                          }}
                          sx={{ color: alreadyPickup ? '#f59e0b' : undefined }}
                        />
                      </Tooltip>
                    )}
                  </TableCell>
                );
                const mergedOrderCell = (
                  <TableCell rowSpan={span} sx={{ verticalAlign: 'top', borderBottom: '2px solid #e2e8f0' }}>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={{ color: '#2563eb', cursor: 'pointer', textDecoration: 'underline' }}
                      onClick={() => setAddressRow(first)}
                    >
                      #{first.order_id}
                    </Typography>
                  </TableCell>
                );
                const mergedDateCell = (
                  <TableCell rowSpan={span} sx={{ verticalAlign: 'top', whiteSpace: 'nowrap', color: '#64748b', fontSize: '0.8rem', borderBottom: '2px solid #e2e8f0' }}>
                    {new Date(first.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </TableCell>
                );
                const mergedCustomerCell = (
                  <TableCell rowSpan={span} sx={{ verticalAlign: 'top', borderBottom: '2px solid #e2e8f0' }}>
                    <Typography variant="body2" fontWeight={500}>{first.customer_name || '—'}</Typography>
                    <Typography variant="caption" color="text.secondary">{first.customer_email}</Typography>
                  </TableCell>
                );
                const mergedStatusCell = (
                  <TableCell rowSpan={span} sx={{ verticalAlign: 'top', borderBottom: '2px solid #e2e8f0' }}>
                    <FormControl size="small" disabled={isUpdating}>
                      <Select
                        value={first.status}
                        onChange={e => handleStatusChange(first.order_id, e.target.value as Status)}
                        renderValue={val => (
                          <Chip
                            label={val}
                            size="small"
                            sx={{ bgcolor: style.bg, color: style.color, fontWeight: 600, fontSize: '0.7rem', height: 22, cursor: 'pointer' }}
                          />
                        )}
                        sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 'none' }, '& .MuiSelect-select': { p: 0 } }}
                      >
                        {(['PAID', 'processing', 'completed', 'cancelled', 'REFUNDED'] as Status[]).map(s => (
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
                );
                const mergedShipmentCell = (
                  <TableCell rowSpan={span} sx={{ verticalAlign: 'top', minWidth: 160, borderBottom: '2px solid #e2e8f0' }}>
                    {first.waybill ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="caption" fontWeight={600} sx={{ color: '#1e3a8a', fontFamily: 'monospace' }}>
                          {first.waybill}
                        </Typography>
                        <Tooltip title="Download label">
                          <span>
                            <IconButton size="small" disabled={isFetchingLabel} onClick={() => handleLabel(first.order_id)} sx={{ color: '#64748b' }}>
                              <PictureAsPdfIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Cancel shipment">
                          <span>
                            <IconButton size="small" disabled={isCancelling} onClick={() => handleCancelShipment(first.order_id, first.waybill!)} sx={{ color: '#ef4444' }}>
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    ) : (
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={first.status !== 'processing' || isDispatching}
                        onClick={() => handleDispatch(first.order_id)}
                        startIcon={<LocalShippingIcon />}
                        sx={{ fontSize: '0.72rem', borderColor: '#1e3a8a', color: '#1e3a8a', '&:hover': { bgcolor: '#eff6ff' } }}
                      >
                        {isDispatching ? 'Dispatching…' : 'Dispatch'}
                      </Button>
                    )}
                  </TableCell>
                );

                const mergedPickupCell = (
                  <TableCell rowSpan={span} sx={{ verticalAlign: 'top', borderBottom: '2px solid #e2e8f0' }}>
                    {first.pickup_request_id ? (
                      <>
                        <Typography variant="body2" fontWeight={500}>#{first.pickup_request_id}</Typography>
                        {first.pickup_scheduled_date && (
                          <Typography variant="caption" color="text.secondary">
                            {new Date(first.pickup_scheduled_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </Typography>
                        )}
                      </>
                    ) : (
                      <Typography variant="caption" color="text.secondary">—</Typography>
                    )}
                  </TableCell>
                );

                return group.map((row, itemIndex) => {
                  const isLastInGroup = itemIndex === group.length - 1;
                  const itemCellSx = { borderBottom: isLastInGroup ? '2px solid #e2e8f0' : '1px solid #f1f5f9' };
                  return (
                    <TableRow key={row.item_id} hover>
                      {itemIndex === 0 && mergedCheckboxCell}
                      {itemIndex === 0 && mergedOrderCell}
                      {itemIndex === 0 && mergedDateCell}
                      {itemIndex === 0 && mergedCustomerCell}
                      <TableCell sx={{ fontSize: '0.85rem', ...itemCellSx }}>{row.product_name}</TableCell>
                      <TableCell sx={{ fontSize: '0.85rem', color: '#64748b', ...itemCellSx }}>{row.variant_name}</TableCell>
                      <TableCell sx={itemCellSx}>{row.size || '—'}</TableCell>
                      <TableCell sx={itemCellSx}>{row.quantity}</TableCell>
                      <TableCell sx={{ fontWeight: 600, ...itemCellSx }}>₹{row.price}</TableCell>
                      <TableCell sx={itemCellSx}>
                        {row.image_url ? (
                          <Box component="a" href={row.image_url} target="_blank" rel="noopener noreferrer">
                            <Box component="img" src={row.image_url} alt="order"
                              sx={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 1.5, display: 'block', border: '1px solid #e2e8f0' }} />
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.secondary">—</Typography>
                        )}
                      </TableCell>
                      {itemIndex === 0 && mergedStatusCell}
                      {itemIndex === 0 && mergedShipmentCell}
                      {itemIndex === 0 && mergedPickupCell}
                    </TableRow>
                  );
                });
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Snackbar
        open={Boolean(pickupSnackbar)}
        autoHideDuration={5000}
        onClose={() => setPickupSnackbar(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setPickupSnackbar(null)} sx={{ width: '100%' }}>
          {pickupSnackbar}
        </Alert>
      </Snackbar>

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
              {(addressRow.amount || addressRow.payment_id) && (
                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e2e8f0' }}>
                  {addressRow.amount && (
                    <Typography variant="body2">
                      <strong>Amount paid:</strong> ₹{(addressRow.amount / 100).toFixed(2)}
                    </Typography>
                  )}
                  {addressRow.payment_id && (
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#64748b', mt: 0.5 }}>
                      {addressRow.payment_id}
                    </Typography>
                  )}
                  {addressRow.paid_at && (
                    <Typography variant="caption" color="text.secondary">
                      Paid at: {new Date(addressRow.paid_at).toLocaleString('en-IN')}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
