import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
          {
            'bg-primary-500 hover:bg-primary-600 text-white': variant === 'primary',
            'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white': variant === 'secondary',
            'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300': variant === 'outline',
            'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300': variant === 'ghost',
            'bg-red-500 hover:bg-red-600 text-white': variant === 'danger',
          },
          {
            'h-8 px-3 text-sm': size === 'sm',
            'h-10 px-4 py-2': size === 'md',
            'h-12 px-6 text-lg': size === 'lg',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export default Button 