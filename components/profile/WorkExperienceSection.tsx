"use client";

import { Plus } from "lucide-react";

import type { WorkExperience } from "@/types";

type Props = {
  experiences: WorkExperience[];
  onChange: (experiences: WorkExperience[]) => void;
};

const EMPTY_EXPERIENCE: WorkExperience = {
  company: "",
  title: "",
  startDate: "",
  endDate: "",
  isCurrent: false,
  responsibilities: "",
};

export function WorkExperienceSection({ experiences, onChange }: Props) {
  const update = (index: number, field: keyof WorkExperience, value: string | boolean): void => {
    const updated = experiences.map((exp, i) => {
      if (i !== index) return exp;
      if (field === "isCurrent" && value === true) {
        return { ...exp, isCurrent: true, endDate: "" };
      }
      return { ...exp, [field]: value };
    });
    onChange(updated);
  };

  const add = (): void => {
    if (experiences.length < 3) {
      onChange([...experiences, { ...EMPTY_EXPERIENCE }]);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">
          Work Experience
        </h3>
        {experiences.length < 3 && (
          <button
            type="button"
            onClick={add}
            className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-dark"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Role
          </button>
        )}
      </div>

      {experiences.map((exp, index) => (
        <div key={index} className="flex flex-col gap-3 rounded-xl border border-border p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-text-secondary">
                COMPANY NAME
              </label>
              <input
                type="text"
                value={exp.company}
                onChange={(e) => update(index, "company", e.target.value)}
                placeholder="Acme Inc."
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-text-secondary">
                JOB TITLE
              </label>
              <input
                type="text"
                value={exp.title}
                onChange={(e) => update(index, "title", e.target.value)}
                placeholder="Frontend Engineer"
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-text-secondary">
                START DATE
              </label>
              <input
                type="text"
                value={exp.startDate}
                onChange={(e) => update(index, "startDate", e.target.value)}
                placeholder="January 2021"
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-text-secondary">
                END DATE
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={exp.isCurrent ? "" : (exp.endDate ?? "")}
                  disabled={exp.isCurrent}
                  onChange={(e) => update(index, "endDate", e.target.value)}
                  placeholder="Present"
                  className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent disabled:bg-surface-secondary disabled:text-text-muted"
                />
                <label className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
                  <input
                    type="checkbox"
                    checked={exp.isCurrent}
                    onChange={(e) => update(index, "isCurrent", e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-border accent-accent"
                  />
                  Currently working here
                </label>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-text-secondary">
              KEY RESPONSIBILITIES
            </label>
            <textarea
              value={exp.responsibilities}
              onChange={(e) => update(index, "responsibilities", e.target.value)}
              placeholder="Built and maintained key product features, collaborated with cross-functional teams to deliver high quality software..."
              rows={3}
              className="resize-none rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>
      ))}

      {experiences.length === 0 && (
        <button
          type="button"
          onClick={add}
          className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border py-6 text-sm font-medium text-text-muted transition-colors hover:border-accent hover:text-accent"
        >
          <Plus className="h-4 w-4" />
          Add work experience
        </button>
      )}
    </div>
  );
}
