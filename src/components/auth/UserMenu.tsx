import React, { useState } from 'react';
import { Avatar, Menu, MenuItem, IconButton, Typography, Box, Divider } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function UserMenu() {
  const { user, logout } = useAuth();
  const { saveCart } = useCart();
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  async function handleLogout() {
    setAnchor(null);
    await saveCart().catch(() => {});
    logout();
  }

  if (!user) {
    return (
      <Link to="/login" style={{ color: '#1e3a8a', fontWeight: 600, textDecoration: 'none', fontSize: '15px' }}>
        Sign In
      </Link>
    );
  }

  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email[0].toUpperCase();

  return (
    <Box>
      <IconButton onClick={e => setAnchor(e.currentTarget)} sx={{ p: 0 }}>
        <Avatar
          src={user.avatar_url || undefined}
          sx={{ width: 36, height: 36, bgcolor: '#1e3a8a', fontSize: '14px' }}
        >
          {!user.avatar_url && initials}
        </Avatar>
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem disabled>
          <Typography variant="body2" color="text.secondary">{user.email}</Typography>
        </MenuItem>
        {user.role === 'admin' && [
          <Divider key="div" />,
          <MenuItem key="admin" onClick={() => { setAnchor(null); navigate('/admin'); }}>
            <AdminPanelSettingsIcon fontSize="small" sx={{ mr: 1, color: '#1e3a8a' }} />
            Admin Panel
          </MenuItem>,
        ]}
        <Divider />
        <MenuItem onClick={handleLogout}>
          Sign out
        </MenuItem>
      </Menu>
    </Box>
  );
}
