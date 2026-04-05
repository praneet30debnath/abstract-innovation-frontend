import React, { useState, useEffect } from 'react';
import { Box, Tabs, Tab, Paper, Typography } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import GoogleLoginButton from './GoogleLoginButton';
import OtpLoginForm from './OtpLoginForm';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [tab, setTab] = useState(0);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { restoreCart } = useCart();
  const { user, loading } = useAuth();
  const googleError = searchParams.get('error') === 'google';
  const redirect = searchParams.get('redirect') || '/';

  useEffect(() => {
    if (!loading && user) {
      navigate(redirect, { replace: true });
    }
  }, [user, loading, navigate, redirect]);

  async function handleOtpSuccess() {
    await restoreCart();
    navigate(redirect, { replace: true });
  }

  if (loading || user) return null;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh', px: 2 }}>
      <Paper elevation={3} sx={{ width: '100%', maxWidth: 420, p: 4, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={700} color="#1e3a8a" textAlign="center" mb={3}>
          Sign in to Abstract Innovation
        </Typography>

        {googleError && (
          <Typography color="error" variant="body2" textAlign="center" mb={2}>
            Google sign-in failed. Please try again.
          </Typography>
        )}

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          centered
          sx={{ mb: 3, '& .MuiTab-root.Mui-selected': { color: '#1e3a8a' }, '& .MuiTabs-indicator': { bgcolor: '#1e3a8a' } }}
        >
          <Tab label="Google" />
          <Tab label="Email OTP" />
        </Tabs>

        {tab === 0 && <GoogleLoginButton redirect={redirect} />}
        {tab === 1 && <OtpLoginForm onSuccess={handleOtpSuccess} />}
      </Paper>
    </Box>
  );
}
