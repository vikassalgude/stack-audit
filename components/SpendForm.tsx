'use client';

import { useEffect, useMemo } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { TOOL_DEFINITIONS } from '../lib/pricing-data';
import type { FormInput, ToolId } from '../lib/types';
import { ToolRow } from './ToolRow';

const STORAGE_KEY = 'credex-audit-form';

const toolIds = Object.keys(TOOL_DEFINITIONS) as [ToolId, ...ToolId[]];

const toolSchema = z.object({
  toolId: z.enum([
    'cursor',
    'github-copilot',
    'claude',
    'chatgpt',
    'anthropic-api',
    'openai-api',
    'gemini',
    'windsurf',
  ]),
  plan: z.string().min(1),
  monthlySpend: z.coerce.number().min(0, 'Spend must be at least $0'),
  seats: z.coerce.number().int().min(1, 'Seats must be at least 1'),
});

const formSchema = z.object({
  tools: z.array(toolSchema).min(1, 'Add at least one tool'),
  teamSize: z.coerce.number().int().min(1, 'Team size must be at least 1'),
  useCase: z.enum(['coding', 'writing', 'data', 'research', 'mixed']),
});

type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
  tools: [
    {
      toolId: 'cursor',
      plan: 'Hobby',
      monthlySpend: 0,
      seats: 1,
    },
  ],
  teamSize: 1,
  useCase: 'coding',
};

interface SpendFormProps {
  onAudit: (input: FormInput) => void;
}

export function SpendForm({ onAudit }: SpendFormProps) {
  const {
    control,
    handleSubmit,
    register,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tools',
  });

  const watchedValues = useWatch({ control });

  const toolOptions = useMemo(
    () =>
      toolIds.map((toolId) => ({
        id: toolId,
        name: TOOL_DEFINITIONS[toolId].name,
      })),
    []
  );

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    try {
      const parsed = formSchema.parse(JSON.parse(stored));
      reset(parsed);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [reset]);

  useEffect(() => {
    if (!watchedValues) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watchedValues));
  }, [watchedValues]);

  const onSubmit = (values: FormValues) => {
    const tools = values.tools.map((tool) => ({
      toolId: tool.toolId,
      toolName: TOOL_DEFINITIONS[tool.toolId].name,
      plan: tool.plan,
      monthlySpend: tool.monthlySpend,
      seats: tool.seats,
    }));

    onAudit({
      tools,
      teamSize: values.teamSize,
      useCase: values.useCase,
    });
  };

  return (
    <form className="flex w-full flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <label className="text-sm font-semibold uppercase tracking-wide text-zinc-600">
          Team size
        </label>
        <input
          type="number"
          min={1}
          className="h-12 w-full rounded-lg border border-zinc-200 bg-white px-4 text-base text-zinc-900"
          {...register('teamSize')}
        />
        {errors.teamSize && (
          <p className="text-sm text-red-600">{errors.teamSize.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold uppercase tracking-wide text-zinc-600">
          Primary use case
        </label>
        <select
          className="h-12 w-full rounded-lg border border-zinc-200 bg-white px-4 text-base text-zinc-900"
          {...register('useCase')}
        >
          <option value="coding">Coding</option>
          <option value="writing">Writing</option>
          <option value="data">Data Analysis</option>
          <option value="research">Research</option>
          <option value="mixed">Mixed</option>
        </select>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-900">AI tools</h3>
          <button
            type="button"
            className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700"
            onClick={() =>
              append({
                toolId: 'cursor',
                plan: 'Hobby',
                monthlySpend: 0,
                seats: 1,
              })
            }
          >
            Add tool
          </button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <ToolRow
              key={field.id}
              control={control}
              index={index}
              register={register}
              remove={remove}
              setValue={setValue}
              toolOptions={toolOptions}
              errors={errors}
            />
          ))}
        </div>
        {errors.tools && <p className="text-sm text-red-600">{errors.tools.message}</p>}
      </div>

      <button
        type="submit"
        className="h-12 w-full rounded-full bg-zinc-900 text-base font-semibold text-white"
      >
        Run my audit
      </button>
    </form>
  );
}
