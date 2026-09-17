import React from 'react';

/**
 * Logo Astra — ngôi sao 4 cánh với gradient xanh→tím
 * - Sắc nét ở mọi kích thước (vector)
 * - Nhẹ (~700 bytes)
 * - Có thể đổi size qua prop
 */
export default function AstraLogo({ size = 24, className = '' }) {
  // Sử dụng unique ID để tránh conflict nếu có nhiều instance
  const gradientId = `astra-grad-${size}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Astra AI"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="50%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
      </defs>
      <path
        d="M12 2 C12 8 8 12 2 12 C8 12 12 16 12 22 C12 16 16 12 22 12 C16 12 12 8 12 2 Z"
        fill={`url(#${gradientId})`}
      />
    </svg>
  );
}