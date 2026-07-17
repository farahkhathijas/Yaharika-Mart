'use client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Store, User, MapPin, Mail, Phone, Calendar } from 'lucide-react';
import { api, queryKeys } from '@/lib/api-client';
import { IUser } from '@yaharika/shared-types';
import { formatDate } from '@/lib/utils';

export default function AdminVendorsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-vendors'],
    queryFn: () => api.get<{ items: any[]; total: number }>('/admin/vendors'),
  });

  const vendors = data?.data?.items ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-display-sm text-foreground mb-1">Vendor Directory</h1>
        <p className="text-foreground/50">Manage registered merchants and shop listings across the network</p>
      </div>

      <div className="card-premium overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" aria-label="Vendors table">
            <thead>
              <tr className="bg-primary-50/50 border-b border-primary-100">
                <th className="py-3 px-6 text-xs font-bold text-primary-800 uppercase tracking-wider">Merchant</th>
                <th className="py-3 px-6 text-xs font-bold text-primary-800 uppercase tracking-wider">Shop name</th>
                <th className="py-3 px-6 text-xs font-bold text-primary-800 uppercase tracking-wider">Contact</th>
                <th className="py-3 px-6 text-xs font-bold text-primary-800 uppercase tracking-wider">Area</th>
                <th className="py-3 px-6 text-xs font-bold text-primary-800 uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="p-4"><div className="skeleton h-10 rounded" /></td>
                  </tr>
                ))
              ) : vendors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-foreground/45">
                    No vendors registered yet.
                  </td>
                </tr>
              ) : (
                vendors.map((vendor) => (
                  <tr key={vendor._id} className="border-b border-primary-50 hover:bg-primary-50/20 transition-colors">
                    <td className="py-4 px-6 font-medium text-foreground">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-bold">
                          {vendor.name[0]}
                        </div>
                        <div>
                          <p className="font-semibold">{vendor.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-foreground/80">
                      <div className="flex items-center gap-2">
                        <Store size={14} className="text-primary-600" />
                        <span>{vendor.shop?.name ?? 'No shop listed'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-foreground/75">
                      <div className="space-y-0.5">
                        <p className="flex items-center gap-1.5"><Mail size={12} className="text-foreground/40" /> {vendor.email}</p>
                        <p className="flex items-center gap-1.5"><Phone size={12} className="text-foreground/40" /> {vendor.phone}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-foreground/70">
                      <span className="inline-flex items-center gap-1"><MapPin size={12} /> {vendor.address?.area ?? 'Bengaluru'}</span>
                    </td>
                    <td className="py-4 px-6 text-sm text-foreground/50">
                      <span className="flex items-center gap-1.5"><Calendar size={12} /> {formatDate(vendor.createdAt)}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
