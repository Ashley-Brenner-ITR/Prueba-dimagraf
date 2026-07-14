import type { FormEvent, ReactNode } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { AppButton } from './AppButton';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  maxWidth?: number;
}

export function AppDialog({ open, onOpenChange, title, description, children, footer, onSubmit, maxWidth = 560 }: Props) {
  const body = <><DialogHeader><DialogTitle>{title}</DialogTitle>{description && <DialogDescription>{description}</DialogDescription>}</DialogHeader><div style={{ overflowY: 'auto', padding: '4px 1px', maxHeight: 'min(68vh,720px)' }}>{children}</div>{footer && <DialogFooter>{footer}</DialogFooter>}</>;
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent style={{ width: 'calc(100% - 32px)', maxWidth }} showCloseButton={false}>{onSubmit ? <form onSubmit={onSubmit}>{body}</form> : body}<AppButton aria-label="Cerrar" title="Cerrar" variant="ghost" size="xs" onClick={() => onOpenChange(false)} style={{ position: 'absolute', top: 14, right: 14, width: 30, padding: 0 }} icon={<X size={15} />} /></DialogContent></Dialog>;
}
