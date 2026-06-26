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
 * Memformat durasi menit ke string yang mudah dibaca (Hari/Jam/Menit)
 */
export const formatDuration = (minutes: number) => {
  if (!minutes || minutes < 0) return '0 Menit';
  
  // Konversi ke Hari jika >= 1440 menit (24 Jam)
  if (minutes >= 1440) {
    const days = minutes / 1440;
    if (Number.isInteger(days)) return `${days} Hari`;
    return `${days.toFixed(1).replace('.', ',')} Hari`;
  }
  
  // Konversi ke Jam jika >= 60 menit
  if (minutes >= 60) {
    const hours = minutes / 60;
    if (Number.isInteger(hours)) return `${hours} Jam`;
    return `${hours.toFixed(1).replace('.', ',')} Jam`;
  }
  
  return `${minutes} Menit`;
};
