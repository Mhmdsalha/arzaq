"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { SkillOption } from "@/types/profile";

export function SkillsSelector({
  skills,
  selectedSkillIds,
  error,
  onChange,
}: {
  skills: SkillOption[];
  selectedSkillIds: string[];
  error?: string;
  onChange: (skillIds: string[]) => void;
}) {
  const [query, setQuery] = useState("");
  const selectedSet = useMemo(() => new Set(selectedSkillIds), [selectedSkillIds]);
  const filteredSkills = skills.filter((skill) => skill.name.includes(query.trim()));

  function toggleSkill(skillId: string) {
    if (selectedSet.has(skillId)) {
      onChange(selectedSkillIds.filter((selectedSkillId) => selectedSkillId !== skillId));
      return;
    }

    onChange([...selectedSkillIds, skillId]);
  }

  return (
    <div className="grid gap-3">
      <Label htmlFor="skills-search">المهارات</Label>
      <div className="relative">
        <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          id="skills-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="pr-10"
          placeholder="ابحث عن مهارة"
        />
      </div>
      <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3">
        {filteredSkills.length > 0 ? (
          filteredSkills.map((skill) => {
            const isSelected = selectedSet.has(skill.id);

            return (
              <button
                key={skill.id}
                type="button"
                onClick={() => toggleSkill(skill.id)}
                className={cn(
                  "min-h-10 rounded-full border px-4 text-sm font-medium transition-all",
                  isSelected
                    ? "border-primary bg-primary text-white"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-primary/60",
                )}
              >
                {skill.name}
              </button>
            );
          })
        ) : (
          <p className="w-full py-4 text-center text-sm text-slate-500">لا توجد مهارات مطابقة</p>
        )}
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
