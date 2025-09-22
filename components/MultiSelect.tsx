"use client";
import React from "react";

/**
 * 다중 선택 컴포넌트
 * - 단일 책임: 다중 옵션 선택과 선택값 관리 로직 캡슐화
 */
export function MultiSelect({
  options,
  values,
  onChange,
  className,
  ensureIncludes,
  id,
}: {
  options: readonly string[];
  values: string[];
  onChange: (vals: string[]) => void;
  className?: string;
  /** 특정 값이 항상 포함되도록 강제 (예: 'global') */
  ensureIncludes?: string;
  id?: string;
}) {
  function applyEnsureIncludes(next: string[]) {
    if (!ensureIncludes) return next;
    return next.includes(ensureIncludes) ? next : [ensureIncludes, ...next];
  }

  function toggleValue(val: string) {
    const has = values.includes(val);
    const next = has ? values.filter((v) => v !== val) : [...values, val];
    const ensured = applyEnsureIncludes(next);
    onChange(Array.from(new Set(ensured)));
  }

  return (
    <div id={id} className={`rounded-md border p-2 ${className ?? ""}`}>
      <div className="mb-2 flex flex-wrap gap-2">
        {values.map((v) => (
          <span key={v} className="rounded bg-secondary px-2 py-1 text-xs">
            {v}
          </span>
        ))}
      </div>
      <div className="max-h-40 w-full overflow-auto rounded-md border border-input bg-white p-2 text-sm">
        <ul className="space-y-1">
          {options.map((opt) => {
            const checked = values.includes(opt);
            const checkboxId = `${id || "multiselect"}-${opt}-checkbox`;
            return (
              <li key={opt} className="flex items-center gap-2">
                <input
                  id={checkboxId}
                  type="checkbox"
                  className="h-4 w-4"
                  checked={checked}
                  onChange={() => toggleValue(opt)}
                />
                <label
                  htmlFor={checkboxId}
                  className="cursor-pointer select-none"
                >
                  {opt}
                </label>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default MultiSelect;
