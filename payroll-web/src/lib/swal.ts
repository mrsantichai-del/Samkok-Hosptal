import Swal from 'sweetalert2';

export const showConfirm = async ({
  title,
  text,
  icon = 'warning',
  confirmButtonText = 'ยืนยัน',
  cancelButtonText = 'ยกเลิก',
  confirmButtonColor = '#1877f2',
}: {
  title: string;
  text?: string;
  icon?: 'warning' | 'error' | 'success' | 'info' | 'question';
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonColor?: string;
}) => {
  return await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonColor,
    cancelButtonColor: '#6b7280',
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    focusCancel: false,
    customClass: {
      popup: 'rounded-2xl shadow-2xl font-sans p-6',
      title: 'text-xl font-bold text-gray-800 mb-2',
      htmlContainer: 'text-sm text-gray-600 mb-4 leading-relaxed',
      confirmButton: 'px-6 py-2.5 rounded-lg text-sm font-semibold shadow-md',
      cancelButton: 'px-5 py-2.5 rounded-lg text-sm font-semibold',
    },
  });
};

export const showSuccess = (title: string, text?: string) => {
  return Swal.fire({
    icon: 'success',
    title,
    text,
    confirmButtonColor: '#10b981',
    confirmButtonText: 'ตกลง',
    timer: 2500,
    timerProgressBar: true,
    customClass: {
      popup: 'rounded-2xl shadow-2xl font-sans p-6',
      title: 'text-lg font-bold text-gray-800',
      confirmButton: 'px-6 py-2.5 rounded-lg text-sm font-semibold',
    },
  });
};

export const showError = (title: string, text?: string) => {
  return Swal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonColor: '#ef4444',
    confirmButtonText: 'ตกลง',
    customClass: {
      popup: 'rounded-2xl shadow-2xl font-sans p-6',
      title: 'text-lg font-bold text-gray-800',
      confirmButton: 'px-6 py-2.5 rounded-lg text-sm font-semibold',
    },
  });
};

export default Swal;
