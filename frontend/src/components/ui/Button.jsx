import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/cn';
import Icon from './Icon';

/**
 * Button — the single source of truth for actions across SafarAI.
 * Variants map to intent, never to decoration.
 */
const base =
  'relative inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold ' +
  'transition-[transform,box-shadow,background-color,border-color,color,opacity] duration-200 ease-smooth ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ' +
  'focus-visible:ring-offset-canvas disabled:pointer-events-none disabled:opacity-55 active:translate-y-px';

const variants = {
  primary:
    'bg-brand-gradient bg-[length:180%_180%] text-white shadow-float hover:-translate-y-0.5 hover:shadow-glow hover:bg-[position:100%_50%] backdrop-blur-sm',
  secondary:
    'border border-line/80 dark:border-white/10 bg-surface/90 dark:bg-slate-900/80 text-fg shadow-sm backdrop-blur-md hover:-translate-y-0.5 hover:border-brand-400/50 hover:bg-surface dark:hover:bg-slate-800/90 hover:text-brand-600 dark:hover:text-cyan-300 hover:shadow-lift',
  soft:
    'bg-brand-50/80 text-brand-700 backdrop-blur-md hover:bg-brand-100 dark:bg-brand-500/15 dark:text-brand-200 dark:hover:bg-brand-500/25',
  ghost:
    'text-fg-muted backdrop-blur-sm hover:bg-surface-muted/80 hover:text-fg dark:hover:bg-white/10',
  outline:
    'border border-brand-300/80 dark:border-cyan-500/40 text-brand-700 dark:text-cyan-300 backdrop-blur-md hover:bg-brand-50/80 dark:hover:bg-cyan-500/15 hover:border-brand-400 dark:hover:border-cyan-400',
  danger:
    'bg-rose-500/90 text-white shadow-sm backdrop-blur-md hover:-translate-y-0.5 hover:bg-rose-600 hover:shadow-rose-500/30',
  dangerSoft:
    'border border-rose-200/80 bg-surface/80 text-rose-600 backdrop-blur-md hover:bg-rose-50 dark:border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/40',
  success:
    'bg-emerald-500/90 text-white shadow-sm backdrop-blur-md hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-emerald-500/30',
  glass:
    'border border-slate-200/70 dark:border-cyan-500/30 bg-white/80 dark:bg-slate-950/70 text-slate-900 dark:text-cyan-300 backdrop-blur-xl shadow-lg hover:border-cyan-400/50 hover:bg-white/95 dark:hover:bg-slate-900/90 hover:text-cyan-600 dark:hover:text-cyan-200 hover:shadow-[0_0_25px_rgba(6,182,212,0.25)] hover:-translate-y-0.5',
};

const sizes = {
  xs: 'h-8 px-3 text-xs',
  sm: 'h-9 px-4 text-[13px]',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-[15px]',
  xl: 'h-14 px-8 text-base',
};

const iconSizes = { xs: 'h-8 w-8', sm: 'h-9 w-9', md: 'h-11 w-11', lg: 'h-12 w-12', xl: 'h-14 w-14' };

const Button = forwardRef(function Button(
  {
    as,
    to,
    href,
    variant = 'primary',
    size = 'md',
    className,
    children,
    leadingIcon,
    trailingIcon,
    loading = false,
    iconOnly = false,
    fullWidth = false,
    type = 'button',
    ...rest
  },
  ref
) {
  const classes = cn(
    base,
    variants[variant] || variants.primary,
    iconOnly ? cn(iconSizes[size], 'px-0') : sizes[size],
    fullWidth && 'w-full',
    className
  );

  const content = (
    <>
      {loading ? (
        <Icon name="refresh" size="sm" className="animate-spin" />
      ) : (
        leadingIcon && <Icon name={leadingIcon} size={size === 'xs' || size === 'sm' ? 'sm' : 'md'} />
      )}
      {!iconOnly && children}
      {trailingIcon && !loading && (
        <Icon
          name={trailingIcon}
          size={size === 'xs' || size === 'sm' ? 'sm' : 'md'}
          className="transition-transform duration-200 group-hover/btn:translate-x-0.5"
        />
      )}
    </>
  );

  if (to) {
    return (
      <Link ref={ref} to={to} className={cn('group/btn', classes)} {...rest}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a ref={ref} href={href} className={cn('group/btn', classes)} {...rest}>
        {content}
      </a>
    );
  }

  const Component = as || 'button';

  return (
    <Component
      ref={ref}
      type={Component === 'button' ? type : undefined}
      className={cn('group/btn', classes)}
      aria-busy={loading || undefined}
      {...rest}
    >
      {content}
    </Component>
  );
});

export default Button;
