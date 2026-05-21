import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Memformat angka ke mata uang Rupiah (IDR)
 */
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount || 0);
};

/**
 * Memformat durasi menit ke string yang mudah dibaca (Jam/Menit)
 */
export const formatDuration = (minutes: number) => {
  if (!minutes || minutes < 0) return '0 Menit';
  if (minutes < 60) return `${minutes} Menit`;
  const hours = minutes / 60;
  if (Number.isInteger(hours)) return `${hours} Jam`;
  return `${hours.toFixed(1).replace('.', ',')} Jam`;
};
