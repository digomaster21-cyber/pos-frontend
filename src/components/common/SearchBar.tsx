import React, { useState, useEffect } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSearch?: (value: string) => void;
  className?: string;
  debounceDelay?: number;
  showClearButton?: boolean;
  filters?: React.ReactNode;
  onFilterClick?: () => void;
  filterActive?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  onSearch,
  className,
  debounceDelay = 300,
  showClearButton = true,
  filters,
  onFilterClick,
  filterActive = false,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [isTyping, setIsTyping] = useState(false);

  // Debounce the input
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(inputValue);
      setIsTyping(false);
      if (onSearch && inputValue.trim()) {
        onSearch(inputValue);
      }
    }, debounceDelay);

    return () => clearTimeout(timer);
  }, [inputValue, debounceDelay, onChange, onSearch]);

  // Sync with external value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsTyping(true);
  };

  const handleClear = () => {
    setInputValue('');
    onChange('');
    if (onSearch) {
      onSearch('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChange(inputValue);
    if (onSearch) {
      onSearch(inputValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear();
    }
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className={cn('w-full', className)}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>

          <input
            type="search"
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg bg-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

          {showClearButton && inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-10 flex items-center"
              aria-label="Clear search"
            >
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}

          {onFilterClick && (
            <button
              type="button"
              onClick={onFilterClick}
              className={cn(
                'absolute inset-y-0 right-0 px-3 flex items-center border-l border-gray-300',
                filterActive && 'text-blue-600'
              )}
              aria-label="Open filters"
            >
              <Filter className="h-4 w-4" />
              {filterActive && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-blue-600" />
              )}
            </button>
          )}
        </div>

        {isTyping && (
          <div className="absolute top-full left-0 right-0 mt-1">
            <div className="flex items-center justify-center">
              <div className="text-xs text-gray-500 animate-pulse">
                Typing...
              </div>
            </div>
          </div>
        )}

        {filters && (
          <div className="mt-2">
            {filters}
          </div>
        )}
      </form>

      {/* Recent searches (optional feature) */}
      {inputValue && (
        <div className="mt-2 text-xs text-gray-500">
          Press Enter to search or Escape to clear
        </div>
      )}
    </div>
  );
};

interface AdvancedFiltersProps {
  filters: Array<{
    key: string;
    label: string;
    type: 'select' | 'date' | 'number' | 'text';
    options?: Array<{ value: string; label: string }>;
    value: any;
    onChange: (value: any) => void;
  }>;
  className?: string;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn('relative', className)}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        leftIcon={<Filter className="h-4 w-4" />}
        onClick={() => setIsOpen(!isOpen)}
        className="mb-2"
      >
        Advanced Filters
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filters.map((filter) => (
              <div key={filter.key} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {filter.label}
                </label>
                {filter.type === 'select' && filter.options ? (
                  <select
                    value={filter.value || ''}
                    onChange={(e) => filter.onChange(e.target.value || null)}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  >
                    <option value="">All</option>
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : filter.type === 'date' ? (
                  <input
                    type="date"
                    value={filter.value || ''}
                    onChange={(e) => filter.onChange(e.target.value || null)}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  />
                ) : filter.type === 'number' ? (
                  <input
                    type="number"
                    value={filter.value || ''}
                    onChange={(e) => filter.onChange(e.target.value ? Number(e.target.value) : null)}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  />
                ) : (
                  <input
                    type="text"
                    value={filter.value || ''}
                    onChange={(e) => filter.onChange(e.target.value || null)}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                filters.forEach((filter) => filter.onChange(null));
              }}
            >
              Clear All
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};