"use client";

import NextLink from 'next/link';
import type { ComponentProps } from 'react';

/**
 * Enlace del panel: traduce las rutas internas del ERP (por ejemplo `/leads`)
 * a rutas reales de Next bajo `/admin` (`/admin/leads`).
 */
export function Link({
  to,
  ...props
}: { to: string } & Omit<ComponentProps<typeof NextLink>, 'href'>) {
  const href = to === '/' ? '/admin' : `/admin${to}`;
  return <NextLink href={href} {...props} />;
}
