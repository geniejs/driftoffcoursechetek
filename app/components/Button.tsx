import { PropsWithChildren, ReactElement } from "react";

type ButtonType = 'submit' | 'button' | 'reset'
type ButtonVariant =
	| 'primary'
	| 'secondary'
	| 'accent'
	| 'info'
	| 'success'
	| 'warning'
	| 'error'
	| 'ghost'
	| 'link';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

type ButtonProps = {
	type?: ButtonType;
	variant?: ButtonVariant;
	size?: ButtonSize;
	disabled?: boolean;
	loading?: boolean;
	wide?: boolean;
	circle?: boolean;
	outline?: boolean;
	noAnimation?: boolean;
	className?: string;
};


function Button({
	className = '',
	type = 'submit',
	variant = 'primary',
	size = 'md',
	disabled = false,
	loading = false,
	wide = false,
	circle = false,
	outline = false,
	noAnimation = false,
	children,
}: PropsWithChildren<ButtonProps>): ReactElement {
	return (
		<button
			type={type}
			className={`${className} btn btn-${variant} btn-${size}${
				loading ? ' loading' : ''
			}${wide ? ' btn-wide' : ''}${circle ? ' btn-circle' : ''}${
				outline ? ' btn-outline' : ''
			}${noAnimation ? ' no-animation' : ''}`}
			disabled={disabled}
		>
			{children}
		</button>
	);
}

export default Button
