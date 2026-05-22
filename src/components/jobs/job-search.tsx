"use client";

import { useEffect, useState } from "react";

import { SearchInput } from "@/components/shared/search-input";

export function JobSearch({ onSearch }: { onSearch: (value: string) => void }) {
  const [value, setValue] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => onSearch(value), 250);
    return () => window.clearTimeout(timeout);
  }, [onSearch, value]);

  return (
    <SearchInput value={value} onChange={setValue} placeholder="ابحث بعنوان الطلب أو المهارة..." />
  );
}
