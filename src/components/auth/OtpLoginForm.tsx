import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, CircularProgress, Alert } from '@mui/material';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface Props {
  onSuccess: () => void;
}

export default function OtpLoginForm({ onSuccess }: Props) {
  const { setUser } = useAuth();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  async function handleSendOtp() {
    setError('');
    setLoading(true);
    try {
      await api.post('/api/auth/otp/send', { email });
      setStep('otp');
      setResendTimer(60);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    setError('');
    setLoading(true);
    try {
      await api.post('/api/auth/otp/verify', { email, code });
      const user = await api.get<any>('/api/auth/me');
      setUser(user);
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {error && <Alert severity="error">{error}</Alert>}

      {step === 'email' ? (
        <>
          <TextField
            label="Email address"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            fullWidth
            onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
          />
          <Button
            variant="contained"
            onClick={handleSendOtp}
            disabled={loading || !email}
            fullWidth
            sx={{ bgcolor: '#1e3a8a', '&:hover': { bgcolor: '#1e40af' } }}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : 'Send OTP'}
          </Button>
        </>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary">
            OTP sent to <strong>{email}</strong>. Valid for 5 minutes.
          </Typography>
          <TextField
            label="Enter 6-digit OTP"
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            fullWidth
            inputProps={{ inputMode: 'numeric', maxLength: 6 }}
            onKeyDown={e => e.key === 'Enter' && handleVerifyOtp()}
          />
          <Button
            variant="contained"
            onClick={handleVerifyOtp}
            disabled={loading || code.length !== 6}
            fullWidth
            sx={{ bgcolor: '#1e3a8a', '&:hover': { bgcolor: '#1e40af' } }}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : 'Verify OTP'}
          </Button>
          <Button
            variant="text"
            onClick={handleSendOtp}
            disabled={resendTimer > 0 || loading}
            fullWidth
            sx={{ color: '#1e3a8a' }}
          >
            {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
          </Button>
        </>
      )}
    </Box>
  );
}
