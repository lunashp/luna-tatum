import { ReactNode } from "react";

/**
 * UI Primitive: DialogFooter
 * - 단일 책임: 다이얼로그 버튼 영역 레이아웃
 */
export function DialogFooter({ children }: { children: ReactNode }) {
  return (
    <div className="p-4 border-t flex justify-end gap-2 flex-shrink-0">
      {children}
    </div>
  );
}

export default DialogFooter;
