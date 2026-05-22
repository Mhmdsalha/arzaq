"use client";

import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PortfolioLinksEditor({
  values,
  error,
  onChange,
}: {
  values: string[];
  error?: string;
  onChange: (values: string[]) => void;
}) {
  const links = values.length > 0 ? values : [""];

  function updateLink(index: number, value: string) {
    onChange(links.map((link, currentIndex) => (currentIndex === index ? value : link)));
  }

  function addLink() {
    if (links.length < 8) {
      onChange([...links, ""]);
    }
  }

  function removeLink(index: number) {
    const nextLinks = links.filter((_, currentIndex) => currentIndex !== index);
    onChange(nextLinks.length > 0 ? nextLinks : [""]);
  }

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <Label>روابط الأعمال</Label>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={addLink}
          disabled={links.length >= 8}
        >
          <Plus className="size-4" />
          إضافة رابط
        </Button>
      </div>
      <div className="space-y-2">
        {links.map((link, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={link}
              onChange={(event) => updateLink(index, event.target.value)}
              placeholder="https://example.com/work"
              inputMode="url"
              dir="ltr"
              className="text-left"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="حذف الرابط"
              onClick={() => removeLink(index)}
            >
              <X className="size-4" />
            </Button>
          </div>
        ))}
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
