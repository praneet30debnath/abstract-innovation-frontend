import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Box, Typography, Button, IconButton, Accordion, AccordionSummary, AccordionDetails,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Switch, FormControlLabel,
  Chip, CircularProgress, Alert, Tooltip, Table, TableBody, TableCell, TableHead,
  TableRow, Collapse, Divider, Stack,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import InventoryIcon from '@mui/icons-material/Inventory';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { api } from '../../services/api';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Product {
  id: number;
  slug: string;
  name: string;
  is_customizable: boolean;
  needs_size: boolean;
  is_visible: boolean;
  description: string | null;
  variant_count: number;
}

interface VariantImage { id: number; variant_id: number; image_url: string; sort_order: number; }
interface Color { id: number; variant_id: number; hex: string; name: string; image_url: string; sort_order: number; }
interface Variant {
  id: number; product_id: number; name: string; price: number; image_url: string;
  height: number | null; width: number | null; dimension_unit: string | null;
  sort_order: number; is_active: boolean;
  images: VariantImage[]; colors: Color[];
}
interface FullProduct extends Product { variants: Variant[]; }

// ── Image upload button ───────────────────────────────────────────────────────

function ImageUploadButton({ slug, onUploaded, previewUrl, label = 'Upload Image' }: {
  slug: string;
  onUploaded: (url: string) => void;
  previewUrl?: string;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('slug', slug);
      const { url } = await api.uploadFile<{ url: string; key: string }>('/api/products/admin/upload', fd);
      onUploaded(url);
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
      {previewUrl && (
        <Box component="img" src={previewUrl} alt="preview"
          sx={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 1, border: '1px solid #e2e8f0' }} />
      )}
      <Button
        size="small" variant="outlined" startIcon={uploading ? <CircularProgress size={14} /> : <UploadFileIcon />}
        disabled={uploading} onClick={() => inputRef.current?.click()}
        sx={{ textTransform: 'none', borderColor: '#cbd5e1', color: '#475569' }}
      >
        {uploading ? 'Uploading…' : label}
      </Button>
    </Box>
  );
}

// ── Product dialog ────────────────────────────────────────────────────────────

interface ProductFormState {
  slug: string; name: string; is_customizable: boolean;
  needs_size: boolean; is_visible: boolean; description: string;
}

function ProductDialog({ open, mode, initial, onClose, onSaved }: {
  open: boolean;
  mode: 'add' | 'edit';
  initial?: Partial<Product>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<ProductFormState>({
    slug: '', name: '', is_customizable: false, needs_size: false, is_visible: true, description: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm({
      slug: initial?.slug ?? '',
      name: initial?.name ?? '',
      is_customizable: initial?.is_customizable ?? false,
      needs_size: initial?.needs_size ?? false,
      is_visible: initial?.is_visible ?? true,
      description: initial?.description ?? '',
    });
  }, [open, initial]);

  async function handleSave() {
    if (!form.slug.trim() || !form.name.trim()) return;
    setSaving(true);
    try {
      if (mode === 'add') {
        await api.post('/api/products/admin', form);
      } else {
        await api.put(`/api/products/admin/${initial!.id}`, form);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  const set = (field: keyof ProductFormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle fontWeight={700}>{mode === 'add' ? 'Add Product' : 'Edit Product'}</DialogTitle>
      <Divider />
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2.5 }}>
        <TextField label="Slug" size="small" value={form.slug} onChange={set('slug')}
          disabled={mode === 'edit'}
          helperText={mode === 'edit' ? 'Slug cannot be changed (used in URLs and order history)' : 'e.g. customized-cup'}
          required />
        <TextField label="Name" size="small" value={form.name} onChange={set('name')} required />
        <TextField label="Description" size="small" value={form.description} onChange={set('description')}
          multiline rows={2} />
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <FormControlLabel control={<Switch checked={form.is_customizable} onChange={set('is_customizable')} />}
            label="Customizable" />
          <FormControlLabel control={<Switch checked={form.needs_size} onChange={set('needs_size')} />}
            label="Needs Size" />
          <FormControlLabel control={<Switch checked={form.is_visible} onChange={set('is_visible')} />}
            label="Visible" />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ color: '#64748b' }}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving || !form.slug || !form.name}
          sx={{ bgcolor: '#1e3a8a', '&:hover': { bgcolor: '#1e40af' }, textTransform: 'none' }}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Variant dialog ────────────────────────────────────────────────────────────

interface VariantFormState {
  name: string; price: string; image_url: string;
  height: string; width: string; dimension_unit: string; is_active: boolean;
}

function VariantDialog({ open, mode, productSlug, productId, initial, onClose, onSaved }: {
  open: boolean;
  mode: 'add' | 'edit';
  productSlug: string;
  productId: number;
  initial?: Partial<Variant>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<VariantFormState>({
    name: '', price: '', image_url: '', height: '', width: '', dimension_unit: '', is_active: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm({
      name: initial?.name ?? '',
      price: initial?.price?.toString() ?? '',
      image_url: initial?.image_url ?? '',
      height: initial?.height?.toString() ?? '',
      width: initial?.width?.toString() ?? '',
      dimension_unit: initial?.dimension_unit ?? '',
      is_active: initial?.is_active ?? true,
    });
  }, [open, initial]);

  async function handleSave() {
    if (!form.name.trim() || !form.price || !form.image_url) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        price: Number(form.price),
        image_url: form.image_url,
        height: form.height ? Number(form.height) : undefined,
        width: form.width ? Number(form.width) : undefined,
        dimension_unit: form.dimension_unit || undefined,
        is_active: form.is_active,
      };
      if (mode === 'add') {
        await api.post(`/api/products/admin/${productId}/variants`, payload);
      } else {
        await api.put(`/api/products/admin/variants/${initial!.id}`, payload);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  const set = (field: keyof VariantFormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle fontWeight={700}>{mode === 'add' ? 'Add Variant' : 'Edit Variant'}</DialogTitle>
      <Divider />
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2.5 }}>
        <TextField label="Name" size="small" value={form.name} onChange={set('name')} required />
        <TextField label="Price (₹)" type="number" size="small" value={form.price} onChange={set('price')} required />
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Primary Image *</Typography>
          <ImageUploadButton slug={productSlug} previewUrl={form.image_url || undefined}
            onUploaded={url => setForm(f => ({ ...f, image_url: url }))} />
        </Box>
        <Stack direction="row" spacing={1.5}>
          <TextField label="Height" type="number" size="small" value={form.height} onChange={set('height')} sx={{ flex: 1 }} />
          <TextField label="Width" type="number" size="small" value={form.width} onChange={set('width')} sx={{ flex: 1 }} />
          <TextField label="Unit" size="small" value={form.dimension_unit} onChange={set('dimension_unit')}
            placeholder="cm" sx={{ flex: 1 }} />
        </Stack>
        {mode === 'edit' && (
          <FormControlLabel control={<Switch checked={form.is_active} onChange={set('is_active')} />} label="Active" />
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ color: '#64748b' }}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}
          disabled={saving || !form.name || !form.price || !form.image_url}
          sx={{ bgcolor: '#1e3a8a', '&:hover': { bgcolor: '#1e40af' }, textTransform: 'none' }}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Color dialog ──────────────────────────────────────────────────────────────

interface ColorFormState { hex: string; name: string; image_url: string; }

function ColorDialog({ open, mode, productSlug, variantId, initial, onClose, onSaved }: {
  open: boolean;
  mode: 'add' | 'edit';
  productSlug: string;
  variantId: number;
  initial?: Partial<Color>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<ColorFormState>({ hex: '#000000', name: '', image_url: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm({ hex: initial?.hex ?? '#000000', name: initial?.name ?? '', image_url: initial?.image_url ?? '' });
  }, [open, initial]);

  async function handleSave() {
    if (!form.name.trim() || !form.image_url) return;
    setSaving(true);
    try {
      if (mode === 'add') {
        await api.post(`/api/products/admin/variants/${variantId}/colors`, form);
      } else {
        await api.put(`/api/products/admin/colors/${initial!.id}`, form);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle fontWeight={700}>{mode === 'add' ? 'Add Color' : 'Edit Color'}</DialogTitle>
      <Divider />
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2.5 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box component="input" type="color" value={form.hex}
            onChange={e => setForm(f => ({ ...f, hex: e.target.value }))}
            sx={{ width: 44, height: 44, border: '1px solid #e2e8f0', borderRadius: 1, cursor: 'pointer', p: 0.5 }} />
          <TextField label="Hex" size="small" value={form.hex}
            onChange={e => setForm(f => ({ ...f, hex: e.target.value }))} sx={{ flex: 1 }} />
        </Stack>
        <TextField label="Color Name" size="small" value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Color Image *</Typography>
          <ImageUploadButton slug={productSlug} previewUrl={form.image_url || undefined}
            onUploaded={url => setForm(f => ({ ...f, image_url: url }))} />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ color: '#64748b' }}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving || !form.name || !form.image_url}
          sx={{ bgcolor: '#1e3a8a', '&:hover': { bgcolor: '#1e40af' }, textTransform: 'none' }}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Confirm delete dialog ─────────────────────────────────────────────────────

function ConfirmDialog({ open, label, onClose, onConfirm }: {
  open: boolean; label: string; onClose: () => void; onConfirm: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  async function handle() {
    setDeleting(true);
    await onConfirm();
    setDeleting(false);
  }
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle fontWeight={700}>Confirm Delete</DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        <Typography>Delete <strong>{label}</strong>? This cannot be undone.</Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ color: '#64748b' }}>Cancel</Button>
        <Button variant="contained" color="error" onClick={handle} disabled={deleting}>
          {deleting ? 'Deleting…' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Variant row ───────────────────────────────────────────────────────────────

function VariantRow({ variant, productSlug, onRefresh, onEdit, onDelete }: {
  variant: Variant;
  productSlug: string;
  onRefresh: () => void;
  onEdit: (v: Variant) => void;
  onDelete: (v: Variant) => void;
}) {
  const [open, setOpen] = useState(false);
  const [colorDialog, setColorDialog] = useState<{ mode: 'add' | 'edit'; data?: Color } | null>(null);
  const [deleteColor, setDeleteColor] = useState<Color | null>(null);
  const [deleteImg, setDeleteImg] = useState<VariantImage | null>(null);
  const [addingImg, setAddingImg] = useState(false);

  async function handleDeleteColor() {
    await api.delete(`/api/products/admin/colors/${deleteColor!.id}`);
    setDeleteColor(null);
    onRefresh();
  }

  async function handleDeleteImage() {
    await api.delete(`/api/products/admin/variant-images/${deleteImg!.id}`);
    setDeleteImg(null);
    onRefresh();
  }

  async function handleAddCarouselImage(url: string) {
    await api.post(`/api/products/admin/variants/${variant.id}/images`, {
      image_url: url, sort_order: variant.images.length,
    });
    setAddingImg(false);
    onRefresh();
  }

  return (
    <>
      <TableRow sx={{ '& td': { borderBottom: open ? 'none' : undefined } }}>
        <TableCell sx={{ width: 56 }}>
          <Box component="img" src={variant.image_url} alt={variant.name}
            sx={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 1, border: '1px solid #e2e8f0' }} />
        </TableCell>
        <TableCell>
          <Typography variant="body2" fontWeight={600}>{variant.name}</Typography>
          {variant.height && (
            <Typography variant="caption" color="text.secondary">
              {variant.height} × {variant.width} {variant.dimension_unit}
            </Typography>
          )}
        </TableCell>
        <TableCell>
          <Typography variant="body2" fontWeight={700} color="#1e3a8a">₹{variant.price}</Typography>
        </TableCell>
        <TableCell>
          {variant.colors.length > 0 && (
            <Stack direction="row" spacing={0.5} flexWrap="wrap">
              {variant.colors.slice(0, 5).map(c => (
                <Tooltip key={c.id} title={c.name}>
                  <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: c.hex, border: '1px solid #e2e8f0' }} />
                </Tooltip>
              ))}
              {variant.colors.length > 5 && (
                <Typography variant="caption" color="text.secondary">+{variant.colors.length - 5}</Typography>
              )}
            </Stack>
          )}
          {variant.images.length > 0 && (
            <Typography variant="caption" color="text.secondary">{variant.images.length} carousel</Typography>
          )}
        </TableCell>
        <TableCell>
          <Chip
            label={variant.is_active ? 'Active' : 'Inactive'} size="small"
            sx={{
              bgcolor: variant.is_active ? '#dcfce7' : '#f1f5f9',
              color: variant.is_active ? '#14532d' : '#64748b',
              fontWeight: 600, fontSize: '0.7rem',
            }}
          />
        </TableCell>
        <TableCell align="right">
          <Stack direction="row" justifyContent="flex-end">
            <IconButton size="small" onClick={() => setOpen(o => !o)} sx={{ color: '#64748b' }}>
              {open ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
            </IconButton>
            <IconButton size="small" onClick={() => onEdit(variant)} sx={{ color: '#64748b' }}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => onDelete(variant)} sx={{ color: '#ef4444' }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        </TableCell>
      </TableRow>

      {/* Expanded: colors + carousel images */}
      <TableRow>
        <TableCell colSpan={6} sx={{ p: 0, border: 0 }}>
          <Collapse in={open} unmountOnExit>
            <Box sx={{ bgcolor: '#f8fafc', px: 3, py: 2, borderBottom: '1px solid #e2e8f0' }}>

              {/* Colors */}
              <Typography variant="caption" fontWeight={700} color="#64748b" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                Colors
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1} mt={1} mb={1.5}>
                {variant.colors.map(c => (
                  <Box key={c.id} sx={{ position: 'relative', '&:hover .color-actions': { opacity: 1 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, bgcolor: '#fff',
                      border: '1px solid #e2e8f0', borderRadius: 1.5, px: 1, py: 0.5 }}>
                      <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: c.hex, border: '1px solid #e2e8f0', flexShrink: 0 }} />
                      <Box component="img" src={c.image_url} alt={c.name}
                        sx={{ width: 28, height: 28, objectFit: 'cover', borderRadius: 0.5 }} />
                      <Typography variant="caption" fontWeight={500}>{c.name}</Typography>
                      <Box className="color-actions" sx={{ display: 'flex', opacity: 0, transition: 'opacity 0.15s' }}>
                        <IconButton size="small" onClick={() => setColorDialog({ mode: 'edit', data: c })}
                          sx={{ p: 0.25, color: '#64748b' }}><EditIcon sx={{ fontSize: 13 }} /></IconButton>
                        <IconButton size="small" onClick={() => setDeleteColor(c)}
                          sx={{ p: 0.25, color: '#ef4444' }}><DeleteIcon sx={{ fontSize: 13 }} /></IconButton>
                      </Box>
                    </Box>
                  </Box>
                ))}
                <Button size="small" startIcon={<AddIcon />}
                  onClick={() => setColorDialog({ mode: 'add' })}
                  sx={{ textTransform: 'none', color: '#1e3a8a', borderColor: '#1e3a8a', fontSize: '0.75rem' }}
                  variant="outlined">
                  Add Color
                </Button>
              </Stack>

              {/* Carousel images */}
              <Typography variant="caption" fontWeight={700} color="#64748b" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                Carousel Images
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1} mt={1}>
                {variant.images.map(img => (
                  <Box key={img.id} sx={{ position: 'relative', '&:hover .img-del': { opacity: 1 } }}>
                    <Box component="img" src={img.image_url} alt="carousel"
                      sx={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 1, border: '1px solid #e2e8f0', display: 'block' }} />
                    <IconButton className="img-del" size="small"
                      onClick={() => setDeleteImg(img)}
                      sx={{ position: 'absolute', top: -6, right: -6, bgcolor: '#fff', border: '1px solid #e2e8f0',
                        opacity: 0, transition: 'opacity 0.15s', p: 0.25, '&:hover': { bgcolor: '#fee2e2' } }}>
                      <DeleteIcon sx={{ fontSize: 13, color: '#ef4444' }} />
                    </IconButton>
                  </Box>
                ))}
                {addingImg ? (
                  <ImageUploadButton slug={productSlug} label="Choose Image"
                    onUploaded={url => handleAddCarouselImage(url)} />
                ) : (
                  <Button size="small" startIcon={<AddIcon />} onClick={() => setAddingImg(true)}
                    sx={{ textTransform: 'none', color: '#1e3a8a', borderColor: '#1e3a8a', fontSize: '0.75rem' }}
                    variant="outlined">
                    Add Image
                  </Button>
                )}
              </Stack>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>

      {/* Color dialogs */}
      {colorDialog && (
        <ColorDialog
          open={true} mode={colorDialog.mode}
          productSlug={productSlug} variantId={variant.id}
          initial={colorDialog.data}
          onClose={() => setColorDialog(null)}
          onSaved={() => { setColorDialog(null); onRefresh(); }}
        />
      )}
      <ConfirmDialog
        open={Boolean(deleteColor)} label={deleteColor?.name ?? ''}
        onClose={() => setDeleteColor(null)} onConfirm={handleDeleteColor}
      />
      <ConfirmDialog
        open={Boolean(deleteImg)} label="this carousel image"
        onClose={() => setDeleteImg(null)} onConfirm={handleDeleteImage}
      />
    </>
  );
}

// ── Variants panel ────────────────────────────────────────────────────────────

function VariantsPanel({ product, onRefresh }: { product: FullProduct; onRefresh: () => void }) {
  const [variantDialog, setVariantDialog] = useState<{ mode: 'add' | 'edit'; data?: Variant } | null>(null);
  const [deleteVariant, setDeleteVariant] = useState<Variant | null>(null);

  async function handleDeleteVariant() {
    await api.delete(`/api/products/admin/variants/${deleteVariant!.id}`);
    setDeleteVariant(null);
    onRefresh();
  }

  return (
    <Box>
      {product.variants.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
          No variants yet.
        </Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8fafc' }}>
              {['Image', 'Name / Dimensions', 'Price', 'Colors / Images', 'Status', ''].map(h => (
                <TableCell key={h} sx={{ fontWeight: 600, fontSize: '0.7rem', color: '#64748b',
                  textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {product.variants.map(v => (
              <VariantRow
                key={v.id} variant={v} productSlug={product.slug}
                onRefresh={onRefresh}
                onEdit={v => setVariantDialog({ mode: 'edit', data: v })}
                onDelete={v => setDeleteVariant(v)}
              />
            ))}
          </TableBody>
        </Table>
      )}

      <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
        <Button size="small" startIcon={<AddIcon />} variant="outlined"
          onClick={() => setVariantDialog({ mode: 'add' })}
          sx={{ textTransform: 'none', borderColor: '#1e3a8a', color: '#1e3a8a' }}>
          Add Variant
        </Button>
      </Box>

      {variantDialog && (
        <VariantDialog
          open={true} mode={variantDialog.mode}
          productSlug={product.slug} productId={product.id}
          initial={variantDialog.data}
          onClose={() => setVariantDialog(null)}
          onSaved={() => { setVariantDialog(null); onRefresh(); }}
        />
      )}
      <ConfirmDialog
        open={Boolean(deleteVariant)} label={deleteVariant?.name ?? ''}
        onClose={() => setDeleteVariant(null)} onConfirm={handleDeleteVariant}
      />
    </Box>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fullProducts, setFullProducts] = useState<Record<number, FullProduct>>({});
  const [loadingFull, setLoadingFull] = useState<Record<number, boolean>>({});
  const [expanded, setExpanded] = useState<number | false>(false);
  const [productDialog, setProductDialog] = useState<{ mode: 'add' | 'edit'; data?: Product } | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [togglingVisible, setTogglingVisible] = useState<number | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      const data = await api.get<Product[]>('/api/products/admin/all');
      setProducts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  async function loadFullProduct(id: number) {
    if (fullProducts[id]) return;
    setLoadingFull(prev => ({ ...prev, [id]: true }));
    try {
      const data = await api.get<FullProduct>(`/api/products/admin/${id}/full`);
      setFullProducts(prev => ({ ...prev, [id]: data }));
    } finally {
      setLoadingFull(prev => ({ ...prev, [id]: false }));
    }
  }

  function refreshFullProduct(id: number) {
    setFullProducts(prev => { const copy = { ...prev }; delete copy[id]; return copy; });
    loadFullProduct(id);
  }

  function handleAccordionChange(id: number) {
    const newExpanded = expanded === id ? false : id;
    setExpanded(newExpanded);
    if (newExpanded) loadFullProduct(newExpanded);
  }

  async function handleToggleVisible(product: Product) {
    setTogglingVisible(product.id);
    try {
      await api.put(`/api/products/admin/${product.id}`, { is_visible: !product.is_visible });
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_visible: !p.is_visible } : p));
    } catch (err: any) {
      alert(err.message || 'Failed to update');
    } finally {
      setTogglingVisible(null);
    }
  }

  async function handleDeleteProduct() {
    await api.delete(`/api/products/admin/${deleteProduct!.id}`);
    setDeleteProduct(null);
    loadProducts();
    setExpanded(false);
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <InventoryIcon sx={{ color: '#1e3a8a' }} />
          <Typography variant="h5" fontWeight={700} color="#0f172a">Inventory</Typography>
          <Chip label={`${products.length} products`} size="small" sx={{ bgcolor: '#f1f5f9', color: '#64748b' }} />
        </Box>
        <Button variant="contained" startIcon={<AddIcon />}
          onClick={() => setProductDialog({ mode: 'add' })}
          sx={{ bgcolor: '#1e3a8a', '&:hover': { bgcolor: '#1e40af' }, textTransform: 'none' }}>
          Add Product
        </Button>
      </Box>

      {/* Product list */}
      {products.map(product => (
        <Accordion
          key={product.id}
          expanded={expanded === product.id}
          onChange={() => handleAccordionChange(product.id)}
          elevation={0}
          sx={{
            mb: 1.5, border: '1px solid #e2e8f0', borderRadius: '12px !important',
            '&:before': { display: 'none' },
            '&.Mui-expanded': { borderColor: '#bfdbfe' },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: '#64748b' }} />}
            sx={{ px: 2.5, py: 1, '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 2, flexWrap: 'wrap' } }}
          >
            {/* Visibility toggle */}
            <Switch
              size="small"
              checked={product.is_visible}
              disabled={togglingVisible === product.id}
              onClick={e => { e.stopPropagation(); handleToggleVisible(product); }}
              sx={{ mr: -1 }}
            />

            {/* Name */}
            <Typography fontWeight={600} color="#0f172a" sx={{ minWidth: 160 }}>{product.name}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
              {product.slug}
            </Typography>

            {/* Flags */}
            <Stack direction="row" spacing={0.75} sx={{ ml: 'auto', mr: 1 }} onClick={e => e.stopPropagation()}>
              {product.is_customizable && (
                <Chip label="Customizable" size="small" sx={{ bgcolor: '#dbeafe', color: '#1e40af', fontSize: '0.7rem', height: 20 }} />
              )}
              {product.needs_size && (
                <Chip label="Needs Size" size="small" sx={{ bgcolor: '#fef3c7', color: '#92400e', fontSize: '0.7rem', height: 20 }} />
              )}
              {!product.is_visible && (
                <Chip label="Hidden" size="small" sx={{ bgcolor: '#fee2e2', color: '#991b1b', fontSize: '0.7rem', height: 20 }} />
              )}
              <Chip label={`${product.variant_count} variants`} size="small"
                sx={{ bgcolor: '#f1f5f9', color: '#64748b', fontSize: '0.7rem', height: 20 }} />
            </Stack>

            {/* Actions */}
            <Box onClick={e => e.stopPropagation()}>
              <IconButton size="small" onClick={() => setProductDialog({ mode: 'edit', data: product })}
                sx={{ color: '#64748b' }}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => setDeleteProduct(product)} sx={{ color: '#ef4444' }}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </AccordionSummary>

          <AccordionDetails sx={{ p: 0, borderTop: '1px solid #e2e8f0' }}>
            {loadingFull[product.id] ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={24} />
              </Box>
            ) : fullProducts[product.id] ? (
              <VariantsPanel
                product={fullProducts[product.id]}
                onRefresh={() => refreshFullProduct(product.id)}
              />
            ) : null}
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Product dialog */}
      {productDialog && (
        <ProductDialog
          open={true} mode={productDialog.mode} initial={productDialog.data}
          onClose={() => setProductDialog(null)}
          onSaved={() => { setProductDialog(null); loadProducts(); }}
        />
      )}

      {/* Delete product */}
      <ConfirmDialog
        open={Boolean(deleteProduct)} label={deleteProduct?.name ?? ''}
        onClose={() => setDeleteProduct(null)} onConfirm={handleDeleteProduct}
      />
    </Box>
  );
}
