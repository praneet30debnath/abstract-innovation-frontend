import React, { useState } from 'react';
import { MenuItem, CircularProgress, Snackbar, Alert } from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';
import { useAuth } from '../context/AuthContext';
import { isWhitelisted } from '../utils/featureFlags';
import { api } from '../services/api';
import { loadRazorpay } from '../utils/loadRazorpay';

interface Props {
  onClose: () => void;
}

export default function TestPaymentButton({ onClose }: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  if (!isWhitelisted(user?.email)) return null;

  async function handleClick() {
    onClose();
    setLoading(true);
    try {
      await loadRazorpay();

      const { rzpOrderId, amount } = await api.post<{ rzpOrderId: string; amount: number }>(
        '/api/test-charge', {}
      );

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID!,
        amount,
        currency: 'INR',
        name: 'Abstract Innovation',
        description: 'Test Payment',
        order_id: rzpOrderId,
        handler: () => {
          setSnack({ open: true, message: 'Test payment successful ✓', severity: 'success' });
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
        theme: { color: '#1e3a8a' },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', () => {
        setSnack({ open: true, message: 'Test payment failed', severity: 'error' });
        setLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      setSnack({ open: true, message: err.message || 'Something went wrong', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <MenuItem onClick={handleClick} disabled={loading}>
        {loading
          ? <CircularProgress size={16} sx={{ mr: 1 }} />
          : <ScienceIcon fontSize="small" sx={{ mr: 1, color: '#1e3a8a' }} />
        }
        Test Payment (₹10)
      </MenuItem>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))}>
          {snack.message}
        </Alert>
      </Snackbar>
    </>
  );
}
