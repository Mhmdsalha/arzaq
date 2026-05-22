"use client";

import { useEffect, useState } from "react";

import { SearchInput } from "@/components/shared/search-input";

export function JobSearch({
  value: initialValue = "",
  onSearch,
}: {
  value?: string;
  onSearch: (value: string) => void;
}) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const timeout = window.setTimeout(() => onSearch(value), 300);
    return () => window.clearTimeout(timeout);
  }, [onSearch, value]);

  return (
    <SearchInput value={value} onChange={setValue} placeholder="ابحث بعنوان الطلب أو المهارة..." />
  );
}
