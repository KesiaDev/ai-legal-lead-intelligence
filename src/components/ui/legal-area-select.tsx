import { useState } from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { LegalArea, LEGAL_AREAS, getLegalAreasGrouped } from '@/types/legalAreas';

interface LegalAreaSelectProps {
  value?: LegalArea | 'outra';
  onValueChange: (value: LegalArea | 'outra') => void;
  placeholder?: string;
  allowCustom?: boolean;
  showCustomInput?: boolean;
  customValue?: string;
  onCustomValueChange?: (value: string) => void;
}

export function LegalAreaSelect({
  value,
  onValueChange,
  placeholder = 'Selecione a área do Direito...',
  allowCustom = true,
  showCustomInput = false,
  customValue = '',
  onCustomValueChange,
}: LegalAreaSelectProps) {
  const [open, setOpen] = useState(false);
  const groupedAreas = getLegalAreasGrouped();

  const selectedLabel = value 
    ? (value === 'outra' && customValue ? customValue : LEGAL_AREAS[value as LegalArea] || value)
    : placeholder;

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <span className="truncate">{selectedLabel}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar área do Direito..." />
            <CommandList>
              <CommandEmpty>Nenhuma área encontrada.</CommandEmpty>
              {groupedAreas.map((group) => (
                <CommandGroup key={group.category} heading={group.label}>
                  {group.areas.map((area) => (
                    <CommandItem
                      key={area.value}
                      value={area.value}
                      onSelect={() => {
                        onValueChange(area.value as LegalArea);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === area.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {area.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
              {allowCustom && (
                <CommandGroup>
                  <CommandItem
                    value="outra"
                    onSelect={() => {
                      onValueChange('outra');
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === 'outra' ? "opacity-100" : "opacity-0"
                      )}
                    />
                    Outra área / Especialização
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {value === 'outra' && showCustomInput && onCustomValueChange && (
        <input
          type="text"
          value={customValue}
          onChange={(e) => onCustomValueChange(e.target.value)}
          placeholder="Digite a especialização..."
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      )}
    </div>
  );
}
