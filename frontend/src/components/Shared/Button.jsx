import { forwardRef } from 'react';

const Button = forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  ...props 
}, ref) => {
  const baseClasses = 'font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'btn-primary focus:ring-accent-blue',
    secondary: 'btn-secondary focus:ring-gray-500',
    success: 'bg-accent-green hover:bg-green-600 text-white focus:ring-accent-green',
    danger: 'bg-error hover:bg-red-600 text-white focus:ring-error'
  };

  const sizes = {
    sm: 'py-2 px-4 text-sm rounded-input',
    md: 'py-3 px-6 rounded-control',
    lg: 'py-4 px-8 text-lg rounded-control'
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={classes}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;