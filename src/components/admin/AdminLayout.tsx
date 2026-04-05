import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  AppBar, Toolbar, IconButton, Typography, Avatar, Divider, Tooltip,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import InventoryIcon from '@mui/icons-material/Inventory';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../../context/AuthContext';

const SIDEBAR_WIDTH = 220;

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/admin', icon: <DashboardIcon /> },
  { label: 'Orders', path: '/admin/orders', icon: <ShoppingBagIcon /> },
  { label: 'Inventory', path: '/admin/inventory', icon: <InventoryIcon /> },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? '';

  const sidebarContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#0f172a' }}>
      {/* Logo area */}
      <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.4)', letterSpacing: 1.5, fontSize: '0.65rem', textTransform: 'uppercase', mb: 0.5 }}>
          Abstract Innovation
        </Typography>
        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, fontSize: '1rem', lineHeight: 1.2 }}>
          Admin Panel
        </Typography>
      </Box>

      {/* Nav items */}
      <List sx={{ px: 1.5, py: 1.5, flexGrow: 1 }}>
        {NAV_ITEMS.map(item => {
          const active = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.path}
              onClick={() => { navigate(item.path); setMobileOpen(false); }}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                px: 1.5,
                py: 1,
                bgcolor: active ? 'rgba(99,102,241,0.2)' : 'transparent',
                '&:hover': { bgcolor: active ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.06)' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: active ? '#818cf8' : 'rgba(255,255,255,0.45)' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: active ? 600 : 400,
                  color: active ? '#e2e8f0' : 'rgba(255,255,255,0.55)',
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      {/* Back to site */}
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
      <Box sx={{ px: 1.5, py: 1.5 }}>
        <ListItemButton
          component={Link}
          to="/"
          sx={{ borderRadius: 2, px: 1.5, py: 1, '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' } }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: 'rgba(255,255,255,0.35)' }}>
            <ArrowBackIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Back to Site"
            primaryTypographyProps={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)' }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* Desktop sidebar */}
      <Box sx={{ width: SIDEBAR_WIDTH, flexShrink: 0, display: { xs: 'none', md: 'block' } }}>
        <Box sx={{ width: SIDEBAR_WIDTH, position: 'fixed', top: 0, bottom: 0 }}>
          {sidebarContent}
        </Box>
      </Box>

      {/* Mobile sidebar drawer */}
      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH, border: 'none' } }}
      >
        {sidebarContent}
      </Drawer>

      {/* Main content area */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#fff', borderBottom: '1px solid #e2e8f0' }}>
          <Toolbar sx={{ gap: 1 }}>
            <IconButton
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ display: { md: 'none' }, color: '#64748b' }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="subtitle1" fontWeight={600} color="#0f172a" sx={{ flexGrow: 1 }}>
              {NAV_ITEMS.find(i => i.path === location.pathname)?.label ?? 'Admin'}
            </Typography>
            <Tooltip title={user?.email ?? ''}>
              <Avatar
                src={user?.avatar_url || undefined}
                sx={{ width: 32, height: 32, bgcolor: '#1e3a8a', fontSize: '12px', cursor: 'default' }}
              >
                {!user?.avatar_url && initials}
              </Avatar>
            </Tooltip>
          </Toolbar>
        </AppBar>

        {/* Page content */}
        <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
