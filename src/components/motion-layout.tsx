'use client';

/**
 * Menyederhanakan tata letak transisi.
 * MENGHAPUS h-full karena sering menyebabkan double scrollbar 
 * jika konten di dalamnya lebih tinggi dari layar.
 */
export function MotionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full">
      {children}
    </div>
  );
}
