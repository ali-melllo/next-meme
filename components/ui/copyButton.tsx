'use client';

import * as React from 'react';
import { Tooltip, TooltipTrigger } from './tooltip';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { Check, Copy } from 'lucide-react';
import { TooltipContent, TooltipProvider } from '@radix-ui/react-tooltip';


interface CopyButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
	value: string
	src?: string
	variant?: any
}

export default function CopyButton({
	value,
	className,
	variant,
	...props
}: CopyButtonProps) {
	const [hasCopied, setHasCopied] = React.useState(false);

	React.useEffect(() => {
		setTimeout(() => {
			setHasCopied(false);
		}, 2000);
	}, [hasCopied]);

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						size="icon"
						variant={variant || 'default'}
						className={cn(
							'relative z-10 h-8 w-8',
							className,
						)}
						onClick={e => {
							e.stopPropagation();
							navigator.clipboard.writeText(value);
							setHasCopied(true);
						}}
						{...props}
					>
						<span className="sr-only">Copy</span>
						{hasCopied ? <Check className="size-4" /> : <Copy className="size-4" />}
					</Button>
				</TooltipTrigger>

				<TooltipContent>Copy</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
