"use client";

import { Search } from "lucide-react";
import type { ChangeEvent } from "react";

import { Input } from "@/components/ui/input";

export function SearchInput({
  value,
  onChange,
  placeholder = "ابحث...",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.target.value);
  }

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
      <Input
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="h-12 pr-11"
        type="search"
      />
    </div>
  );
}
