import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        className: 'text-sm',
        style: {
          borderRadius: '6px',
          background: '#0f1b31',
          color: '#fff',
        },
      }}
    />
  );
}
