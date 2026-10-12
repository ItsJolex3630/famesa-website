"use client";

import { useEffect, useRef, type ReactNode } from 'react';
import { X, ArrowUpRight, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFamesa } from '@/lib/famesa/provider';
import { usd, ves, labelStatus } from '@/lib/famesa/data';

export function Status({ status }: { status: string }) {
  return <span className={`status ${status}`}>{labelStatus(status)}</span>;
}

export function Money({ amount, rate }: { amount: number; rate?: number | undefined }) {
  const f = useFamesa();
  return (
    <span className="amount-cell">
      {usd(amount)}
      {f.mirror && <small>{ves(amount * (rate ?? f.rate))}</small>}
    </span>
  );
}

export function Modal({
  title,
  subtitle,
  children,
  footer,
  onClose,
  wide = false,
}: {
  title: string;
  subtitle?: string | undefined;
  children: ReactNode;
  footer?: ReactNode | undefined;
  onClose: () => void;
  wide?: boolean | undefined;
}) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    panel.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const elements = panel.current?.querySelectorAll<HTMLElement>(
          'button,input,select,textarea,a[href],[tabindex="0"]',
        );
        if (!elements?.length) return;
        const first = elements[0],
          last = elements[elements.length - 1];
        if (first && last) {
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    document.addEventListener('keydown', handler);
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = old;
      previous?.focus();
    };
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`modal ${wide ? 'wide' : ''}`}
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="modal-header">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <Button variant="sidebar" size="icon" onClick={onClose} aria-label="Cerrar">
            <X />
          </Button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export function Field({
  label,
  children,
  full = false,
}: {
  label: string;
  children: ReactNode;
  full?: boolean | undefined;
}) {
  return (
    <label className={`field ${full ? 'full' : ''}`}>
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}

export function KPI({
  label,
  value,
  mirror,
  foot,
  icon,
  featured = false,
  negative = false,
}: {
  label: string;
  value: string;
  mirror?: string | undefined;
  foot: string;
  icon: ReactNode;
  featured?: boolean | undefined;
  negative?: boolean | undefined;
}) {
  return (
    <div className={`kpi ${featured ? 'kpi-featured' : ''}`}>
      <div className="kpi-top">
        <span className="kpi-label">{label}</span>
        <span className="kpi-icon">{icon}</span>
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-mirror">{mirror ?? '\u00A0'}</div>
      <div className={`kpi-foot ${negative ? 'negative' : 'positive'}`}>
        <TrendingUp size={11} />
        <span>{foot}</span>
        <ArrowUpRight size={11} className="ml-auto" />
      </div>
    </div>
  );
}
