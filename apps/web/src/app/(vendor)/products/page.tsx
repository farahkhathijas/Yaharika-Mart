'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Plus, Edit2, Trash2, Shield, Settings, Sliders } from 'lucide-react';
import { api, queryKeys } from '@/lib/api-client';
import { IProduct, IShop } from '@yaharika/shared-types';
import { formatCurrency, getStockStatus, cn } from '@/lib/utils';
import { toast } from 'sonner';

function ProductRow({ product }: { product: IProduct }) {
  const queryClient = useQueryClient();
  const [reserve, setReserve] = useState(product.walkInReserve || 0);

  const reserveMutation = useMutation({
    mutationFn: (val: number) =>
      api.patch(`/products/${product._id}/walkin-reserve`, { walkInReserve: val }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shopProducts(product.shopId as any) });
      toast.success('Walk-in reserve updated!');
    },
    onError: () => toast.error('Failed to update reserve.'),
  });

  const stockStatus = getStockStatus(product.stock, product.lowStockThreshold);

  return (
    <motion.tr layout className="border-b border-primary-50 hover:bg-primary-50/20 transition-colors">
      <td className="py-4 px-6 font-medium text-foreground">
        <div>
          <div className="font-semibold">{product.name}</div>
          <div className="text-xs text-foreground/40">{product.unit}</div>
        </div>
      </td>
      <td className="py-4 px-6 text-sm text-foreground/70 capitalize">{product.category}</td>
      <td className="py-4 px-6 font-semibold text-primary-600">{formatCurrency(product.price)}</td>
      <td className="py-4 px-6">
        <div className="flex items-center gap-2">
          <span className={cn(
            'w-2 h-2 rounded-full',
            stockStatus === 'out' ? 'bg-danger' : stockStatus === 'low' ? 'bg-warning' : 'bg-success'
          )} />
          <span className="font-semibold text-sm tabular-nums">{product.stock}</span>
        </div>
      </td>
      <td className="py-4 px-6">
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0"
            max={product.stock}
            value={reserve}
            onChange={(e) => setReserve(parseInt(e.target.value))}
            onMouseUp={() => reserveMutation.mutate(reserve)}
            onTouchEnd={() => reserveMutation.mutate(reserve)}
            className="w-24 accent-accent-gold"
            aria-label={`Reserve stock for in-store customers of ${product.name}`}
          />
          <span className="text-xs font-bold text-accent-gold min-w-[20px] tabular-nums">{reserve}</span>
        </div>
      </td>
      <td className="py-4 px-6 text-right">
        <div className="flex items-center justify-end gap-3">
          <button className="text-foreground/40 hover:text-primary-600 transition-colors tap-target" aria-label={`Edit ${product.name}`}>
            <Edit2 size={14} />
          </button>
        </div>
      </td>
    </motion.tr>
  );
}

export default function VendorProductsPage() {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'grocery', price: '', stock: '', unit: '1 kg', lowStockThreshold: '10' });

  // Get vendor's own shop first
  const { data: shopRes } = useQuery({
    queryKey: queryKeys.myShop(),
    queryFn: () => api.get<IShop>('/shops/my'),
  });

  const shop = shopRes?.data;

  const { data: productsRes, isLoading } = useQuery({
    queryKey: queryKeys.shopProducts(shop?._id ?? ''),
    queryFn: () => api.get<IProduct[]>(`/shops/${shop?._id}/products`),
    enabled: !!shop?._id,
  });

  const createMutation = useMutation({
    mutationFn: () => api.post('/products', {
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      lowStockThreshold: parseInt(form.lowStockThreshold),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shopProducts(shop?._id ?? '') });
      setShowAddForm(false);
      setForm({ name: '', category: 'grocery', price: '', stock: '', unit: '1 kg', lowStockThreshold: '10' });
      toast.success('Product added successfully!');
    },
    onError: () => toast.error('Failed to create product.'),
  });

  const products = productsRes?.data ?? [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-display-sm text-foreground mb-1">Products Management</h1>
          <p className="text-foreground/50">Manage your inventory, pricing, and walk-in stock reserves</p>
        </div>
        <button
          onClick={() => setShowAddForm((o) => !o)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card-premium p-6 overflow-hidden space-y-4"
          >
            <h2 className="font-display font-semibold text-foreground">Add New Product</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground/75 mb-1 block" htmlFor="prodName">Product Name</label>
                <input
                  id="prodName"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-primary-100 text-sm focus:outline-none"
                  placeholder="e.g. Basmati Rice"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground/75 mb-1 block" htmlFor="prodCat">Category</label>
                <select
                  id="prodCat"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-primary-100 text-sm focus:outline-none bg-white"
                >
                  <option value="grocery">Grocery</option>
                  <option value="dairy">Dairy</option>
                  <option value="bakery">Bakery</option>
                  <option value="vegetables">Vegetables</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground/75 mb-1 block" htmlFor="prodPrice">Price (₹)</label>
                <input
                  id="prodPrice"
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-primary-100 text-sm focus:outline-none"
                  placeholder="120"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground/75 mb-1 block" htmlFor="prodStock">Initial Stock</label>
                <input
                  id="prodStock"
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-primary-100 text-sm focus:outline-none"
                  placeholder="50"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground/75 mb-1 block" htmlFor="prodUnit">Unit</label>
                <input
                  id="prodUnit"
                  type="text"
                  value={form.unit}
                  onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-primary-100 text-sm focus:outline-none"
                  placeholder="1 kg"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending || !form.name || !form.price || !form.stock}
                className="btn-primary py-2 disabled:opacity-50"
              >
                Save Product
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-xl border border-primary-100 text-sm hover:bg-primary-50 text-foreground/60"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="card-premium overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" aria-label="Products table">
            <thead>
              <tr className="bg-primary-50/50 border-b border-primary-100">
                <th className="py-3 px-6 text-xs font-bold text-primary-800 uppercase tracking-wider">Product</th>
                <th className="py-3 px-6 text-xs font-bold text-primary-800 uppercase tracking-wider">Category</th>
                <th className="py-3 px-6 text-xs font-bold text-primary-800 uppercase tracking-wider">Price</th>
                <th className="py-3 px-6 text-xs font-bold text-primary-800 uppercase tracking-wider">Stock</th>
                <th className="py-3 px-6 text-xs font-bold text-primary-800 uppercase tracking-wider">Walk-in Reserve</th>
                <th className="py-3 px-6 text-xs font-bold text-primary-800 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="p-4"><div className="skeleton h-8 rounded" /></td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-foreground/45">
                    No products added yet.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <ProductRow key={product._id} product={product} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
