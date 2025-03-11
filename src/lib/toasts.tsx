import { toast } from 'react-toastify';

const defaultToastConfig = {
  position: "top-center" as const,
  autoClose: 2000,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: false,
  draggable: false,
  closeButton: false,
};

export const showSuccessToast = (message: string) => {
  toast.success(message, {
    ...defaultToastConfig,
    className: "!bg-emerald-500 !text-white !rounded-lg",
    icon: () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  });
};

export const showDeleteToast = (message: string) => {
  toast.error(message, {
    ...defaultToastConfig,
    className: "!bg-red-500 !text-white !rounded-lg",
    icon: () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
  });
};

export const showCreateToast = (message: string) => {
  toast.success(message, {
    ...defaultToastConfig,
    className: "!bg-emerald-500 !text-white !rounded-lg",
    icon: () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
  });
};

export const showErrorToast = (message: string) => {
  toast.error(message, {
    ...defaultToastConfig,
    className: "!bg-red-500 !text-white !rounded-lg",
    icon: () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  });
}; 