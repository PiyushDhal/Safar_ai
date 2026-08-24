import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/cn';
import Icon from './Icon';

/**
 * Button — the single source of truth for actions across VibeVoyage.
 * Variants map to intent, never to decoration.
 */
const base =
  'relative inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold ' +
  'transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.96] ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ' +
  'focus-visible:ring-offset-canvas disabled:pointer-events-none disabled:opacity-50';

const variants = {
  primary:
    'bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-500/25 backdrop-blur-md border-t border-white/30',
  secondary:
    'border border-white/40 dark:border-white/12 bg-white/70 dark:bg-slate-900/70 text-fg shadow-sm backdrop-blur-2xl hover:-translate-y-0.5 hover:border-cyan-500/40 hover:bg-white/90 dark:hover:bg-slate-800/90 hover:text-cyan-600 dark:hover:text-cyan-300 hover:shadow-md',
  soft:
    'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 backdrop-blur-xl border border-cyan-500/20 hover:bg-cyan-500/20',
  ghost:
    'text-fg-muted backdrop-blur-sm hover:bg-white/60 dark:hover:bg-white/10 hover:text-fg',
  outline:
    'border border-cyan-500/40 text-cyan-700 dark:text-cyan-300 backdrop-blur-xl hover:bg-cyan-500/15 hover:border-cyan-400',
  danger:
    'bg-rose-500/90 text-white shadow-sm backdrop-blur-md border-t border-white/30 hover:-translate-y-0.5 hover:bg-rose-600 hover:shadow-rose-500/30',
  dangerSoft:
    'border border-rose-200/80 bg-white/70 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 backdrop-blur-xl hover:bg-rose-50 dark:hover:bg-rose-900/40',
  success:
    'bg-emerald-500/90 text-white shadow-sm backdrop-blur-md border-t border-white/30 hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-emerald-500/30',
  glass:
    'border border-white/40 dark:border-white/15 bg-white/60 dark:bg-slate-900/65 text-slate-900 dark:text-cyan-300 backdrop-blur-3xl shadow-md hover:border-cyan-400/50 hover:bg-white/85 dark:hover:bg-slate-900/90 hover:text-cyan-600 dark:hover:text-cyan-200 hover:shadow-[0_8px_30px_rgba(6,182,212,0.25)] hover:-translate-y-0.5',
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
