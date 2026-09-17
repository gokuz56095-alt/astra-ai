// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const origin = request.headers.get('origin');
  const allowedOrigins = [
    'https://your-project-name.vercel.app', // Tên miền Vercel của bạn
    'http://localhost:5173', // Cho phép dev local
  ];

  // Kiểm tra Origin header
  if (origin && !allowedOrigins.includes(origin)) {
    return new NextResponse(
      JSON.stringify({ error: 'Forbidden: Invalid origin' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Nếu không có origin (ví dụ: truy cập trực tiếp), chặn luôn
  if (!origin) {
    return new NextResponse(
      JSON.stringify({ error: 'Forbidden: Missing origin' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return NextResponse.next();
}

// Chỉ áp dụng middleware cho các route /api/*
export const config = {
  matcher: '/api/:path*',
};