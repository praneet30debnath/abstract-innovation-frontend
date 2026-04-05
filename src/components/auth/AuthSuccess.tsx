import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const REDIRECT_KEY = 'abstractinnovation:login-redirect';

export default function AuthSuccess() {
  const { setUser } = useAuth();
  const { restoreCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    api.get<any>('/api/auth/me')
      .then(async user => {
        setUser(user);
        await restoreCart();
        const redirect = localStorage.getItem(REDIRECT_KEY) || '/';
        localStorage.removeItem(REDIRECT_KEY);
        navigate(redirect, { replace: true });
      })
      .catch(() => navigate('/login', { replace: true }));
  }, [navigate, setUser, restoreCart]);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <CircularProgress sx={{ color: '#1e3a8a' }} />
    </Box>
  );
}
