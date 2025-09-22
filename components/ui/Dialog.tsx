import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * UI Primitive: Dialog
 * - 단일 책임: 모달 컨테이너와 오버레이 (React Portal 사용)
 */
export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  if (!open || !mounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-6xl h-[95vh] rounded-lg bg-white flex flex-col shadow-xl overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default Dialog;
