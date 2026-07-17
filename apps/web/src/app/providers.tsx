'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { Toaster } from 'sonner';
import { VoiceAssistant } from '@/components/shared/VoiceAssistant';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 2, // 2 min
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'white',
            border: '1px solid #C7E4D5',
            color: '#1C2B22',
            fontFamily: 'Inter, system-ui, sans-serif',
          },
        }}
        richColors
      />
      <VoiceAssistant />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
