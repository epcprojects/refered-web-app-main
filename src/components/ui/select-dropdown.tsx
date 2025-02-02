import { cn } from '@/utils/cn.utils';
import React, { useEffect, useRef, useState } from 'react';
import { FieldError } from 'react-hook-form';
import { FaChevronDown } from 'react-icons/fa';
import { RiErrorWarningFill } from 'react-icons/ri';

export interface SelectProps {
  error?: FieldError | string;
  noErrorIcon?: boolean;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  containerClassName?: string;
  options: { label: string; value: string }[];
  placeholder?: string;
  onChange?: (value: string) => void;
}

const SelectStyles = {
  base: (hasError: boolean, isDisabled: boolean) => cn('relative flex cursor-pointer items-center gap-2 w-full rounded-md h-9 px-3 border-1 focus-within:border-secondary bg-background border-transparent', hasError && '!border-destructive focus-visible:ring-0', isDisabled && 'opacity-50 pointer-events-none'),
  selectedValue: 'w-full bg-transparent text-sm p-0 !m-0 placeholder:opacity-80 ring-offset-background focus-visible:outline-none',
  dropdown: 'absolute left-0 top-full mt-1 w-full h-[200px] overflow-auto bg-white border border-gray-200 rounded-md shadow-md z-10',
  option: (isActive: boolean) => cn('px-3 py-2 text-sm cursor-pointer', isActive ? 'bg-gray-200' : 'hover:bg-gray-100'),
};

const Select: React.FC<SelectProps> = ({ containerClassName, error, noErrorIcon = false, leftElement, rightElement, options, placeholder, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null);
  const [lastKey, setLastKey] = useState<string | null>(null);
  const [cycleIndex, setCycleIndex] = useState(0);
  const selectRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const handleSelect = (value: string) => {
    setSelected(value);
    onChange?.(value);
    setIsOpen(false);
    setHighlightIndex(null);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isOpen) return;

    const key = event.key.toLowerCase();

    if (key === 'enter' && highlightIndex !== null) {
      event.preventDefault();
      handleSelect(options[highlightIndex].value);
      return;
    }

    if (key === 'arrowdown' || key === 'arrowup') {
      event.preventDefault();
      setHighlightIndex((prev) => {
        if (prev === null) return key === 'arrowdown' ? 0 : options.length - 1;
        const nextIndex = key === 'arrowdown' ? prev + 1 : prev - 1;
        return nextIndex < 0 ? options.length - 1 : nextIndex >= options.length ? 0 : nextIndex;
      });
      return;
    }

    if (/^[a-z]$/.test(key)) {
      event.preventDefault();
      const matches = options.map((option, index) => ({ index, label: option.label.toLowerCase() })).filter(({ label }) => label.startsWith(key));

      if (matches.length > 0) {
        if (lastKey === key) {
          setCycleIndex((prev) => (prev + 1) % matches.length);
        } else {
          setCycleIndex(0);
        }
        setHighlightIndex(matches[cycleIndex].index);
        dropdownRef.current?.children[matches[cycleIndex].index]?.scrollIntoView({ block: 'nearest' });
        setLastKey(key);
      }
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, highlightIndex, lastKey, cycleIndex]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn(SelectStyles.base(!!error, false), containerClassName)} ref={selectRef} onClick={toggleDropdown}>
      {!!leftElement && leftElement}
      <div
        className={cn(
          SelectStyles.selectedValue,
          !selected && 'text-gray-400', // Ensures the placeholder has a lighter color when nothing is selected
        )}
      >
        {selected ? options.find((o) => o.value === selected)?.label : placeholder}
      </div>
      <FaChevronDown size={14} className="ml-auto text-gray-500" />
      {isOpen && (
        <div className={SelectStyles.dropdown} ref={dropdownRef}>
          {options.map((option, index) => (
            <div
              key={option.value}
              className={SelectStyles.option(index === highlightIndex)}
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(option.value);
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
      {!!rightElement ? rightElement : !!error && noErrorIcon === false ? <RiErrorWarningFill size={20} className="flex-shrink-0 self-center text-destructive" /> : null}
    </div>
  );
};

export { Select };
