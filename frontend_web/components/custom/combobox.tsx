"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface Options {
    value: string;
    label: string;
}

export interface ComboboxProps {
    placeholder: string;
    options: Options[];
    name?: string;
}

export function Combobox({ placeholder, options, name }: ComboboxProps) {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState("");

    // Handle selection of an option
    const handleSelect = (selectedValue: string) => {
        setValue(selectedValue === value ? "" : selectedValue);
        setOpen(false);
    };

    // Find the label of the selected value from the options
    const selectedOptionLabel = options.find((option) => option.value === value)?.label;

    return (
        <>
            <input
                type="hidden"
                name={name || ""}
                value={value}
            />
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                    >
                        {selectedOptionLabel || placeholder}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                    <Command>
                        <CommandInput placeholder={placeholder} />
                        <CommandList>
                            <CommandEmpty>No option found.</CommandEmpty>
                            <CommandGroup>
                                {options.map((option) => (
                                    <CommandItem
                                        key={option.value}
                                        value={option.value}
                                        onSelect={() => handleSelect(option.value)}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === option.value ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {option.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </>
    );
}
