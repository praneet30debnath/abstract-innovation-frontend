import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BottomNavigation, BottomNavigationAction, Paper, Avatar, Menu, MenuItem, Typography, Badge } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import CategoryIcon from '@mui/icons-material/Category';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import TestPaymentButton from './TestPaymentButton';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { isOrdersEnabled } from '../utils/featureFlags';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { totalCount, saveCart } = useCart();

  async function handleLogout() {
    setAnchor(null);
    await saveCart().catch(() => {});
    logout();
    navigate('/');
  }
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  const pathToValue: Record<string, number> = user
    ? { '/': 0, '/products': 1, '/contact': 2, '/cart': 3 }
    : { '/': 0, '/products': 1, '/contact': 2, '/login': 3 };
  const value = pathToValue[location.pathname] ?? false;

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? '';

  return (
    <>
      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1100, display: { xs: 'block', md: 'none' } }} elevation={4}>
        <BottomNavigation value={value} sx={{ bgcolor: '#ffffff' }}>
          <BottomNavigationAction
            label="Home"
            icon={<HomeIcon />}
            onClick={() => navigate('/')}
            sx={{ color: value === 0 ? '#1e3a8a' : '#64748b', '&.Mui-selected': { color: '#1e3a8a' } }}
          />
          <BottomNavigationAction
            label="Products"
            icon={<CategoryIcon />}
            onClick={() => navigate('/products')}
            sx={{ color: value === 1 ? '#1e3a8a' : '#64748b', '&.Mui-selected': { color: '#1e3a8a' } }}
          />
          <BottomNavigationAction
            label="Contact"
            icon={<PhoneIcon />}
            onClick={() => navigate('/contact')}
            sx={{ color: value === 2 ? '#1e3a8a' : '#64748b', '&.Mui-selected': { color: '#1e3a8a' } }}
          />
          {user && isOrdersEnabled(user.email) ? (
            <BottomNavigationAction
              label="Cart"
              icon={
                <Badge badgeContent={totalCount || null} color="error">
                  <ShoppingCartIcon />
                </Badge>
              }
              onClick={() => navigate('/cart')}
              sx={{ color: value === 3 ? '#1e3a8a' : '#64748b', '&.Mui-selected': { color: '#1e3a8a' } }}
            />
          ) : null}
          <BottomNavigationAction
            label={user ? '' : 'Sign In'}
            icon={
              user ? (
                <Avatar
                  src={user.avatar_url || undefined}
                  sx={{ width: 28, height: 28, bgcolor: '#1e3a8a', fontSize: '12px' }}
                >
                  {!user.avatar_url && initials}
                </Avatar>
              ) : (
                <PersonIcon />
              )
            }
            onClick={e => user ? setAnchor(e.currentTarget) : navigate('/login')}
            sx={{ color: '#64748b', '&.Mui-selected': { color: '#1e3a8a' } }}
          />
        </BottomNavigation>
      </Paper>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MenuItem disabled>
          <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
        </MenuItem>
        <TestPaymentButton onClose={() => setAnchor(null)} />
        <MenuItem onClick={() => { setAnchor(null); navigate('/orders'); }}>
          <ReceiptLongIcon fontSize="small" sx={{ mr: 1, color: '#1e3a8a' }} />
          My Orders
        </MenuItem>
        {user?.role === 'admin' && (
          <MenuItem onClick={() => { setAnchor(null); navigate('/admin'); }}>
            <AdminPanelSettingsIcon fontSize="small" sx={{ mr: 1, color: '#1e3a8a' }} />
            Admin Panel
          </MenuItem>
        )}
        <MenuItem onClick={handleLogout}>
          Sign out
        </MenuItem>
      </Menu>
    </>
  );
}
