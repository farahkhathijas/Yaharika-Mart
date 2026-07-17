'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Mic, Sliders, Type, RotateCcw, LogOut, CheckCircle } from 'lucide-react';
import { api, queryKeys } from '@/lib/api-client';
import { useAccessibilityStore } from '@/stores/accessibilityStore';
import { useUIStore } from '@/stores/uiStore';
import { useCartStore } from '@/stores/cartStore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function AccountPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user, logout } = useUIStore();
  const { clearCart } = useCartStore();

  const {
    highContrast, setHighContrast,
    largeText, setLargeText,
    voiceEnabled, setVoiceEnabled,
    fontScale, setFontScale,
  } = useAccessibilityStore();

  const { data: notificationsRes } = useQuery({
    queryKey: queryKeys.notifications(),
    queryFn: () => api.get<{ notifications: any[] }>('/notifications'),
    enabled: !!user,
  });

  const readMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications() });
    },
  });

  const notifications = notificationsRes?.data?.notifications ?? [];

  const handleLogout = () => {
    logout();
    clearCart();
    toast.success('Logged out successfully.');
    router.push('/');
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl space-y-8">
      <div>
        <h1 className="font-display text-display-sm text-foreground mb-1">Account & Settings</h1>
        <p className="text-foreground/50">Manage your profile, preferences, and accessibility tools</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-1 space-y-4">
          <div className="card-premium p-6 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-3xl font-bold text-primary-700 mx-auto">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="font-semibold text-foreground text-lg">{user?.name}</h2>
              <p className="text-xs text-foreground/50 capitalize">{user?.role} account</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 border border-danger/20 text-danger rounded-xl hover:bg-danger/5 transition-colors text-sm font-semibold tap-target"
            >
              <LogOut size={14} />
              Log out
            </button>
          </div>
        </div>

        {/* Settings and Notifications */}
        <div className="md:col-span-2 space-y-6">
          {/* Accessibility Settings */}
          <div className="card-premium p-6 space-y-6">
            <h2 className="font-display text-lg font-semibold text-foreground">Accessibility Mode</h2>

            <div className="space-y-4">
              {/* High Contrast */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Eye size={18} className="text-primary-600" />
                  <div>
                    <p className="text-sm font-medium text-foreground">High Contrast Mode</p>
                    <p className="text-xs text-foreground/45">Increase visibility for easier reading</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={(e) => setHighContrast(e.target.checked)}
                  className="w-4 h-4 accent-primary-600 cursor-pointer"
                  aria-label="Toggle High Contrast Mode"
                />
              </div>

              {/* Large Text */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Type size={18} className="text-primary-600" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Large Font Size</p>
                    <p className="text-xs text-foreground/45">Increase the readability scale globally</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={largeText}
                  onChange={(e) => setLargeText(e.target.checked)}
                  className="w-4 h-4 accent-primary-600 cursor-pointer"
                  aria-label="Toggle Large Font Size"
                />
              </div>

              {/* Voice controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mic size={18} className="text-primary-600" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Voice Ordering</p>
                    <p className="text-xs text-foreground/45">Allows navigating and ordering by voice command</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={voiceEnabled}
                  onChange={(e) => setVoiceEnabled(e.target.checked)}
                  className="w-4 h-4 accent-primary-600 cursor-pointer"
                  aria-label="Toggle Voice Ordering"
                />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="card-premium p-6 space-y-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Notifications</h2>
            {notifications.length === 0 ? (
              <p className="text-sm text-foreground/45">No notifications yet.</p>
            ) : (
              <ul className="space-y-3" aria-label="Notifications list">
                {notifications.map((n) => (
                  <li
                    key={n._id}
                    className={cn(
                      'p-3 rounded-xl border flex justify-between items-start gap-4 transition-colors',
                      n.isRead ? 'bg-white border-primary-50/50' : 'bg-primary-50/30 border-primary-100'
                    )}
                  >
                    <div>
                      <p className="font-semibold text-sm text-foreground">{n.title}</p>
                      <p className="text-xs text-foreground/75 mt-0.5">{n.body}</p>
                    </div>
                    {!n.isRead && (
                      <button
                        onClick={() => readMutation.mutate(n._id)}
                        className="text-xs text-primary-600 font-semibold hover:underline"
                      >
                        Read
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
