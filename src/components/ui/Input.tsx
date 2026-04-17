import React, { forwardRef } from 'react';
import clsx from 'clsx';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  leftIcon?: React.ReactNode;
  as?: 'input' | 'textarea';
  rows?: number;
  error?: string;
}

export const Input = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  InputProps
>((props, ref) => {
  const {
    label,
    leftIcon,
    as = 'input',
    rows,
    className,
    ...rest
  } = props;

  const baseStyles =
    'block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500';

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            {leftIcon}
          </div>
        )}

        {as === 'textarea' ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            rows={rows}
            className={clsx(
              baseStyles,
              leftIcon && 'pl-10',
              className
            )}
            {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            className={clsx(
              baseStyles,
              leftIcon && 'pl-10',
              className
            )}
            {...rest}
          />
        )}
      </div>
    </div>
  );
});

Input.displayName = 'Input';
