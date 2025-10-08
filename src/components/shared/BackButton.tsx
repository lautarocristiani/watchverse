'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface BackButtonProps {
  href?: string;
}

export default function BackButton({ href }: BackButtonProps) {
  const router = useRouter();

  // Clases actualizadas para posicionamiento absoluto
  const commonClasses = "absolute top-4 left-4 z-20 flex items-center gap-2 text-sm font-semibold text-text-main-light bg-background-light/50 backdrop-blur-sm border border-border-light hover:bg-hover-light dark:text-text-main-dark dark:bg-background-dark/50 dark:border-border-dark dark:hover:bg-hover-dark px-4 py-2 rounded-full transition-colors";

  if (href) {
    return (
      <Link href={href} className={commonClasses}>
        <ArrowLeft size={16} />
        <span>Back</span>
      </Link>
    );
  }

  return (
    <button
      onClick={() => router.back()}
      className={commonClasses}
    >
      <ArrowLeft size={16} />
      <span>Back</span>
    </button>
  );
}