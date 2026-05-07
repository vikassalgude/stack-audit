'use client';

import { useEffect } from 'react';
import { useWatch } from 'react-hook-form';
import type { Control, FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form';

import { TOOL_DEFINITIONS } from '../lib/pricing-data';
import type { ToolId } from '../lib/types';

type FormValues = {
  tools: Array<{
    toolId: ToolId;
    plan: string;
    monthlySpend: number;
    seats: number;
  }>;
  teamSize: number;
  useCase: string;
};

interface ToolOption {
  id: ToolId;
  name: string;
}

interface ToolRowProps {
  control: Control<FormValues>;
  index: number;
  register: UseFormRegister<FormValues>;
  remove: (index: number) => void;
  setValue: UseFormSetValue<FormValues>;
  toolOptions: ToolOption[];
  errors: FieldErrors<FormValues>;
}

export function ToolRow({
  control,
  index,
  register,
  remove,
  setValue,
  toolOptions,
  errors,
}: ToolRowProps) {
  const toolId = useWatch({
    control,
    name: `tools.${index}.toolId`,
  });

  const plans = toolId ? TOOL_DEFINITIONS[toolId]?.plans ?? [] : [];

  useEffect(() => {
    if (!toolId || plans.length === 0) return;
    setValue(`tools.${index}.plan`, plans[0]);
  }, [index, plans, setValue, toolId]);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="grid gap-4 md:grid-cols-[1.2fr,1fr,0.8fr,0.8fr,auto]">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
            Tool
          </label>
          <select
            className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900"
            {...register(`tools.${index}.toolId`)}
          >
            {toolOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
            Plan
          </label>
          <select
            className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900"
            {...register(`tools.${index}.plan`)}
          >
            {plans.map((plan) => (
              <option key={plan} value={plan}>
                {plan}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
            Monthly spend
          </label>
          <input
            type="number"
            min={0}
            step="0.01"
            className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900"
            {...register(`tools.${index}.monthlySpend`)}
          />
          {errors.tools?.[index]?.monthlySpend && (
            <p className="text-xs text-red-600">
              {errors.tools[index]?.monthlySpend?.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
            Seats
          </label>
          <input
            type="number"
            min={1}
            className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900"
            {...register(`tools.${index}.seats`)}
          />
          {errors.tools?.[index]?.seats && (
            <p className="text-xs text-red-600">{errors.tools[index]?.seats?.message}</p>
          )}
        </div>

        <div className="flex items-end">
          <button
            type="button"
            className="h-11 rounded-lg border border-zinc-200 px-3 text-sm font-semibold text-zinc-700"
            onClick={() => remove(index)}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
