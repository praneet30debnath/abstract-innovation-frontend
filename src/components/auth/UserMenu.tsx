import React, { useState } from 'react';
import { Avatar, Menu, MenuItem, IconButton, Typography, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

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
        <MenuItem onClick={() => { setAnchor(null); logout(); }}>
          Sign out
        </MenuItem>
      </Menu>
    </Box>
  );
}
