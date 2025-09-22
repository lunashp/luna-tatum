"use client";
import React from "react";

/**
 * 토글 컴포넌트
 * - 단일 책임: boolean 상태를 버튼 UI로 토글하여 부모로 전달
 */
export function Toggle({
  checked,
  onChange,
  className,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  className?: string;
}) {
  return (
    <button
      className={`h-9 rounded-md border px-3 text-sm ${
        checked ? "bg-green-500 text-white" : "bg-white"
      } ${className ?? ""}`}
      onClick={() => onChange(!checked)}
      type="button"
    >
      {checked ? "ON" : "OFF"}
    </button>
  );
}

export default Toggle;
