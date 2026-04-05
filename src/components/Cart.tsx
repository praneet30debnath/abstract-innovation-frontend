import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Card, CardContent,
  Button, Divider, CircularProgress, Alert, IconButton,
  Radio, RadioGroup, FormControlLabel, TextField, Collapse,
  Chip, Skeleton,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface Address {
  id: number;
  name: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

interface AddressForm {
  name: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  pincode: string;
}

const emptyForm: AddressForm = {
  name: '', phone: '', address1: '', address2: '', city: '', state: '', pincode: '',
};

export default function Cart() {
  const { items, removeItem, clearCartFromServer } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [deliveryCharge, setDeliveryCharge] = useState<number | null>(null);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | 'new' | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newAddress, setNewAddress] = useState<AddressForm>({ ...emptyForm, name: user?.name || '' });
  const [saveNewAddress, setSaveNewAddress] = useState(true);
  const [addressLoading, setAddressLoading] = useState(true);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const cgm = totalQuantity * 500;

  // Derive current active pincode from selected address or new address form
  const activePincode =
    selectedAddressId === 'new' || selectedAddressId === null
      ? (newAddress.pincode.length === 6 ? newAddress.pincode : null)
      : (addresses.find(a => a.id === selectedAddressId)?.pincode ?? null);

  useEffect(() => {
    if (!activePincode) { setDeliveryCharge(null); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setDeliveryLoading(true);
      try {
        const result = await api.get<{ total_amount: number }>(
          `/api/shipments/charges?d_pin=${activePincode}&cgm=${cgm}`
        );
        setDeliveryCharge(result.total_amount);
      } catch {
        setDeliveryCharge(null);
      } finally {
        setDeliveryLoading(false);
      }
    }, 600);
  }, [activePincode, cgm]);

  useEffect(() => {
    if (!user) return;
    api.get<Address[]>('/api/addresses')
      .then(data => {
        setAddresses(data);
        const def = data.find(a => a.is_default) ?? data[0];
        if (def) setSelectedAddressId(def.id);
        else { setSelectedAddressId('new'); setShowNewForm(true); }
      })
      .catch(() => { setSelectedAddressId('new'); setShowNewForm(true); })
      .finally(() => setAddressLoading(false));
  }, [user]);

  function handleSelectAddress(id: number | 'new') {
    setSelectedAddressId(id);
    setShowNewForm(id === 'new');
  }

  function formField(label: string, field: keyof AddressForm, props?: object) {
    return (
      <TextField
        label={label}
        size="small"
        value={newAddress[field]}
        onChange={e => setNewAddress(prev => ({ ...prev, [field]: e.target.value }))}
        fullWidth
        {...props}
      />
    );
  }

  async function handlePlaceOrder() {
    if (!user) { navigate('/login'); return; }

    let shippingAddress: Omit<Address, 'id' | 'is_default'> & { addressId?: number };

    if (selectedAddressId === 'new' || selectedAddressId === null) {
      const { name, phone, address1, city, state, pincode } = newAddress;
      if (!name || !phone || !address1 || !city || !state || !pincode) {
        setError('Please fill in all required address fields');
        return;
      }
      if (saveNewAddress) {
        try {
          const saved = await api.post<Address>('/api/addresses', {
            ...newAddress,
            is_default: addresses.length === 0,
          });
          setAddresses(prev => [...prev, saved]);
          shippingAddress = { ...newAddress, addressId: saved.id };
        } catch {
          setError('Failed to save address');
          return;
        }
      } else {
        shippingAddress = { ...newAddress };
      }
    } else {
      const addr = addresses.find(a => a.id === selectedAddressId)!;
      shippingAddress = {
        addressId: addr.id,
        name: addr.name,
        phone: addr.phone,
        address1: addr.address1,
        address2: addr.address2,
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode,
      };
    }

    setLoading(true);
    setError('');

    try {
      const orderPayload = items.map(item => ({
        productSlug: item.productSlug,
        productName: item.productName,
        variantName: item.variantName,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        needsImage: !!(item.imageFile || item.pendingImageKey),
      }));

      const { orderId, itemIds } = await api.post<{ orderId: number; itemIds: number[] }>(
        '/api/orders',
        { items: orderPayload, shippingAddress }
      );

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.imageFile) {
          const formData = new FormData();
          formData.append('file', item.imageFile);
          formData.append('orderId', String(orderId));
          formData.append('itemId', String(itemIds[i]));
          formData.append('productSlug', item.productSlug);
          await api.uploadFile<{ url: string }>('/api/upload', formData);
        } else if (item.pendingImageKey) {
          await api.post('/api/cart/move-image', {
            pendingImageKey: item.pendingImageKey,
            orderId,
            itemId: itemIds[i],
            productSlug: item.productSlug,
          });
        }
      }

      await clearCartFromServer();
      navigate(`/order-success?orderId=${orderId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 6, textAlign: 'center' }}>
        <Typography variant="h5" color="text.secondary" gutterBottom>Your cart is empty</Typography>
        <Button variant="contained" onClick={() => navigate('/products')} sx={{ mt: 2 }}>
          Browse Products
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>Your Cart</Typography>

      {/* Cart items */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
        {items.map((item, index) => (
          <Card key={index} variant="outlined">
            <CardContent sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              {(item.imageFile || item.previewUrl) && (
                <Box
                  component="img"
                  src={item.imageFile ? URL.createObjectURL(item.imageFile) : item.previewUrl}
                  alt="upload preview"
                  sx={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 1, flexShrink: 0 }}
                />
              )}
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1" fontWeight={600}>{item.productName}</Typography>
                <Typography variant="body2" color="text.secondary">{item.variantName}</Typography>
                {item.size && (
                  <Typography variant="body2" color="text.secondary">Size: {item.size}</Typography>
                )}
                {(item.imageFile || item.pendingImageKey) && (
                  <Typography variant="body2" color="text.secondary">
                    Image: {item.imageFile ? item.imageFile.name : 'Saved image'}
                  </Typography>
                )}
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  ₹{item.price} × {item.quantity} = <strong>₹{item.price * item.quantity}</strong>
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => removeItem(index)} color="error">
                <DeleteOutlineIcon />
              </IconButton>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Delivery address */}
      <Typography variant="h6" fontWeight={600} gutterBottom>Delivery Address</Typography>

      {addressLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <RadioGroup
          value={selectedAddressId ?? ''}
          onChange={e => handleSelectAddress(e.target.value === 'new' ? 'new' : Number(e.target.value))}
        >
          {addresses.map(addr => (
            <Card
              key={addr.id}
              variant="outlined"
              sx={{
                mb: 1.5,
                borderColor: selectedAddressId === addr.id ? 'primary.main' : 'divider',
                cursor: 'pointer',
              }}
              onClick={() => handleSelectAddress(addr.id)}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, py: '12px !important' }}>
                <Radio value={addr.id} size="small" sx={{ mt: '-2px', p: 0.5 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2" fontWeight={600}>{addr.name}</Typography>
                    {addr.is_default && <Chip label="Default" size="small" color="primary" variant="outlined" sx={{ height: 18, fontSize: 10 }} />}
                  </Box>
                  <Typography variant="body2" color="text.secondary">{addr.phone}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {addr.address1}{addr.address2 ? `, ${addr.address2}` : ''}, {addr.city}, {addr.state} – {addr.pincode}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}

          {/* Add new address option */}
          <Card
            variant="outlined"
            sx={{
              mb: 1.5,
              borderColor: selectedAddressId === 'new' ? 'primary.main' : 'divider',
              cursor: 'pointer',
            }}
            onClick={() => handleSelectAddress('new')}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1, py: '12px !important' }}>
              <Radio value="new" size="small" sx={{ p: 0.5 }} />
              <AddIcon fontSize="small" color="primary" />
              <Typography variant="subtitle2" color="primary">Add new address</Typography>
            </CardContent>
          </Card>
        </RadioGroup>
      )}

      {/* New address form */}
      <Collapse in={showNewForm}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2, mt: 1 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {formField('Full Name *', 'name')}
            {formField('Phone *', 'phone')}
          </Box>
          {formField('Address Line 1 *', 'address1')}
          {formField('Address Line 2 (optional)', 'address2')}
          <Box sx={{ display: 'flex', gap: 2 }}>
            {formField('City *', 'city')}
            {formField('State *', 'state')}
            {formField('Pincode *', 'pincode', { inputProps: { maxLength: 6 } })}
          </Box>
          <FormControlLabel
            control={
              <Radio
                checked={saveNewAddress}
                onChange={e => setSaveNewAddress(e.target.checked)}
                size="small"
              />
            }
            label={<Typography variant="body2">Save this address for future orders</Typography>}
          />
        </Box>
      </Collapse>

      <Divider sx={{ mb: 2 }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body1" color="text.secondary">Subtotal</Typography>
          <Typography variant="body1">₹{subtotal}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body1" color="text.secondary">Delivery</Typography>
          {deliveryLoading ? (
            <Skeleton width={60} height={24} />
          ) : deliveryCharge !== null ? (
            <Typography variant="body1">₹{deliveryCharge.toFixed(2)}</Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {activePincode ? '—' : 'Select address'}
            </Typography>
          )}
        </Box>
        <Divider />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight={700}>Total</Typography>
          <Typography variant="h6" color="primary" fontWeight={700}>
            ₹{deliveryCharge !== null ? (subtotal + deliveryCharge).toFixed(2) : subtotal}
          </Typography>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Button
        variant="contained"
        size="large"
        fullWidth
        onClick={handlePlaceOrder}
        disabled={loading || addressLoading || deliveryLoading || deliveryCharge === null}
        startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
      >
        {loading ? 'Placing Order...' : 'Place Order'}
      </Button>
    </Container>
  );
}
