import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, CircularProgress, Alert } from '@mui/material';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import PaymentIcon from '@mui/icons-material/Payment';
import { api } from '../../services/api';

interface Stats {
  total: number;
  paid: number;
  processing: number;
  completed: number;
  cancelled: number;
  revenue: number;
}

const STAT_CARDS = (s: Stats) => [
  {
    label: 'Total Orders',
    value: s.total,
    icon: <ShoppingBagIcon />,
    bg: '#ede9fe',
    color: '#7c3aed',
  },
  {
    label: 'Paid (Awaiting Processing)',
    value: s.paid,
    icon: <PaymentIcon />,
    bg: '#bbf7d0',
    color: '#15803d',
  },
  {
    label: 'Completed',
    value: s.completed,
    icon: <CheckCircleIcon />,
    bg: '#dcfce7',
    color: '#16a34a',
  },
  {
    label: 'Total Revenue',
    value: `₹${s.revenue.toLocaleString('en-IN')}`,
    icon: <CurrencyRupeeIcon />,
    bg: '#dbeafe',
    color: '#1d4ed8',
  },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<Stats>('/api/orders/stats')
      .then(setStats)
      .catch(err => setError(err.message || 'Failed to load stats'));
  }, []);

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!stats) return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} color="#0f172a" sx={{ mb: 3 }}>
        Overview
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
        {STAT_CARDS(stats).map(card => (
          <Card key={card.label} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Box sx={{ p: 1, borderRadius: 2, bgcolor: card.bg, color: card.color, display: 'flex' }}>
                  {card.icon}
                </Box>
              </Box>
              <Typography variant="h5" fontWeight={700} color="#0f172a">
                {card.value}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {card.label}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {(stats.paid > 0 || stats.processing > 0) && (
        <Box sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: '#eff6ff', border: '1px solid #bfdbfe' }}>
          <Typography variant="body2" color="#1d4ed8">
            {stats.paid > 0 && (
              <><strong>{stats.paid}</strong> paid order{stats.paid !== 1 ? 's' : ''} awaiting processing.{' '}</>
            )}
            {stats.processing > 0 && (
              <><strong>{stats.processing}</strong> order{stats.processing !== 1 ? 's' : ''} currently in processing.</>
            )}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
