'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    // Điều hướng người dùng đến trang login ngay khi component được render
    router.push('/login');
  }, [router]);

  // Không cần render bất kỳ nội dung nào vì mục đích chính chỉ là điều hướng
  return null;
}
