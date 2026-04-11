import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, CircularProgress, Alert,
  Card, CardContent, Chip, Button, Divider, Tabs, Tab,
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { api } from '../services/api';

interface OrderItem {
  item_id: number;
  product_slug: string;
  product_name: string;
  variant_name: string;
  price: number;
  quantity: number;
  image_url: string | null;
  size: string | null;
}

interface Order {
  order_id: number;
  status: string;
  created_at: string;
  amount: number | null;
  waybill: string | null;
  ship_name: string;
  ship_address1: string;
  ship_address2: string | null;
  ship_city: string;
  ship_state: string;
  ship_pincode: string;
  items: OrderItem[];
}

const STATUS_LABEL: Record<string, string> = {
  PAID: 'Paid',
  processing: 'Processing',
  completed: 'Delivered',
  cancelled: 'Cancelled',
};

const STATUS_COLOR: Record<string, 'info' | 'warning' | 'success' | 'error'> = {
  PAID: 'info',
  processing: 'warning',
  completed: 'success',
  cancelled: 'error',
};

function groupOrders(rows: any[]): Order[] {
  const map = new Map<number, Order>();
  for (const row of rows) {
    if (!map.has(row.order_id)) {
      map.set(row.order_id, {
        order_id: row.order_id,
        status: row.status,
        created_at: row.created_at,
        amount: row.amount ?? null,
        waybill: row.waybill ?? null,
        ship_name: row.ship_name,
        ship_address1: row.ship_address1,
        ship_address2: row.ship_address2 ?? null,
        ship_city: row.ship_city,
        ship_state: row.ship_state,
        ship_pincode: row.ship_pincode,
        items: [],
      });
    }
    map.get(row.order_id)!.items.push({
      item_id: row.item_id,
      product_slug: row.product_slug,
      product_name: row.product_name,
      variant_name: row.variant_name,
      price: Number(row.price),
      quantity: row.quantity,
      image_url: row.image_url ?? null,
      size: row.size ?? null,
    });
  }
  return Array.from(map.values());
}

function OrderCard({ order }: { order: Order }) {
  const navigate = useNavigate();
  const total = order.amount != null
    ? (order.amount / 100).toFixed(2)
    : order.items.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2);

  const address = [
    order.ship_address1,
    order.ship_address2,
    order.ship_city,
    order.ship_state,
    order.ship_pincode,
  ].filter(Boolean).join(', ');

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        {/* Order header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Box>
            <Typography variant="subtitle2" fontWeight={700}>Order #{order.order_id}</Typography>
            <Typography variant="caption" color="text.disabled">
              {new Date(order.created_at).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric',
              })}
            </Typography>
          </Box>
          <Chip
            label={STATUS_LABEL[order.status] ?? order.status}
            color={STATUS_COLOR[order.status] ?? 'default'}
            size="small"
          />
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        {/* Items */}
        {order.items.map(item => (
          <Box key={item.item_id} sx={{ display: 'flex', gap: 1.5, mb: 1.5, alignItems: 'flex-start' }}>
            {item.image_url && (
              <Box
                component="img"
                src={item.image_url}
                alt={item.product_name}
                sx={{
                  width: 56, height: 56, objectFit: 'cover',
                  borderRadius: 1, flexShrink: 0,
                  border: '1px solid', borderColor: 'divider',
                }}
              />
            )}
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body2" fontWeight={600}>{item.product_name}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {[item.variant_name, item.size].filter(Boolean).join(' · ')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Qty: {item.quantity} &nbsp;·&nbsp; ₹{item.price.toFixed(2)} each
              </Typography>
            </Box>
          </Box>
        ))}

        <Divider sx={{ mb: 1.5 }} />

        {/* Delivery address */}
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
          Deliver to: {order.ship_name} — {address}
        </Typography>

        {/* Footer: total + track */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2" fontWeight={700}>Total: ₹{total}</Typography>
          {order.waybill && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<LocalShippingIcon />}
              onClick={() => navigate(`/track/${order.order_id}`)}
              sx={{ borderColor: '#1e3a8a', color: '#1e3a8a' }}
            >
              Track Order
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);

  useEffect(() => {
    api.get<any[]>('/api/orders/mine')
      .then(rows => setOrders(groupOrders(rows)))
      .catch(err => setError(err.message || 'Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

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
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const active = orders.filter(o => o.status !== 'cancelled');
  const cancelled = orders.filter(o => o.status === 'cancelled');
  const shown = tab === 0 ? active : cancelled;

  return (
    <Container maxWidth="sm" sx={{ py: 3, pb: { xs: 10, md: 3 } }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>My Orders</Typography>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 2, '& .MuiTab-root': { color: '#64748b' }, '& .Mui-selected': { color: '#1e3a8a' }, '& .MuiTabs-indicator': { bgcolor: '#1e3a8a' } }}
      >
        <Tab label={`Active (${active.length})`} />
        <Tab label={`Cancelled (${cancelled.length})`} />
      </Tabs>

      {shown.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="body1" color="text.secondary">
            {tab === 0 ? 'No active orders.' : 'No cancelled orders.'}
          </Typography>
        </Box>
      ) : (
        shown.map(order => <OrderCard key={order.order_id} order={order} />)
      )}
    </Container>
  );
}
