'use client';

import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export function MultiSelect({
  values,
  options,
  onChange,
  placeholder,
  creatable = false,
  createLabel = '새로 만들기',
}: {
  values: string[];
  options: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  creatable?: boolean;
  createLabel?: string;
}) {
  const [inputValue, setInputValue] = useState('');
  const [open, setOpen] = useState(false);

  const isNewOption =
    inputValue.trim() &&
    !options.some((opt) => opt.toLowerCase() === inputValue.toLowerCase());

  const handleSelect = (value: string) => {
    const selected = values.includes(value);
    onChange(selected ? values.filter((v) => v !== value) : [...values, value]);
  };

  const handleCreate = () => {
    if (isNewOption) {
      const newValue = inputValue.trim();
      onChange([...values, newValue]);
      setInputValue('');
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex min-h-[36px] w-full items-center justify-between rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50">
        {values.length ? (
          <div className="flex flex-wrap gap-1">
            {values.map((value) => (
              <Badge key={value} variant="secondary" className="text-xs">
                {value}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput
            placeholder="태그 검색..."
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty>
              {creatable && inputValue ? (
                <div className="py-2 text-center text-sm">
                  태그를 찾을 수 없습니다
                </div>
              ) : (
                '검색 결과가 없습니다'
              )}
            </CommandEmpty>
            {creatable && isNewOption && (
              <CommandGroup>
                <CommandItem onSelect={handleCreate} className="cursor-pointer">
                  <Plus className="mr-2 h-4 w-4" />
                  <span className="font-medium">{createLabel}:</span>
                  <span className="text-muted-foreground ml-1">
                    {inputValue}
                  </span>
                </CommandItem>
              </CommandGroup>
            )}
            <CommandGroup heading="기존 태그">
              {options
                .filter((opt) =>
                  opt.toLowerCase().includes(inputValue.toLowerCase()),
                )
                .map((opt) => {
                  const selected = values.includes(opt);
                  return (
                    <CommandItem
                      key={opt}
                      onSelect={() => handleSelect(opt)}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          selected ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      {opt}
                    </CommandItem>
                  );
                })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
