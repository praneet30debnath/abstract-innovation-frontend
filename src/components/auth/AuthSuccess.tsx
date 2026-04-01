import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AuthSuccess() {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get<any>('/api/auth/me')
      .then(user => {
        setUser(user);
        navigate('/', { replace: true });
      })
      .catch(() => navigate('/login', { replace: true }));
  }, [navigate, setUser]);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <CircularProgress sx={{ color: '#1e3a8a' }} />
    </Box>
  );
}
