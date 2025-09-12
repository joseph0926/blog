'use client';

import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from '@joseph0926/ui/components/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function MultiSelect({
  values,
  options,
  onChange,
  placeholder,
}: {
  values: string[];
  options: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger className="flex items-center gap-1 rounded border px-2 py-1 text-sm">
        {values.length ? values.join(', ') : placeholder}
        <ChevronsUpDown size={14} className="opacity-60" />
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search route…" />
          <CommandList>
            {options.map((opt) => {
              const selected = values.includes(opt);
              return (
                <CommandItem
                  key={opt}
                  onSelect={() =>
                    onChange(
                      selected
                        ? values.filter((v) => v !== opt)
                        : [...values, opt],
                    )
                  }
                >
                  <Check
                    size={14}
                    className={`mr-2 ${selected ? 'opacity-100' : 'opacity-0'}`}
                  />
                  {opt}
                </CommandItem>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
