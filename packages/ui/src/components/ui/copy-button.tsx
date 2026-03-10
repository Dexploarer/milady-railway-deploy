import * as React from "react"
import { Check, Copy } from "lucide-react"
import { cn } from "../../lib/utils"

export interface CopyButtonProps
    extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
    /** Text to copy to clipboard */
    value: string
    /** Duration of the "copied" feedback in ms */
    feedbackDuration?: number
}

export const CopyButton = React.forwardRef<HTMLButtonElement, CopyButtonProps>(
    ({ value, feedbackDuration = 2000, className, children, ...props }, ref) => {
        const [copied, setCopied] = React.useState(false)

        const handleCopy = React.useCallback(() => {
            void navigator.clipboard.writeText(value)
            setCopied(true)
            setTimeout(() => setCopied(false), feedbackDuration)
        }, [value, feedbackDuration])

        return (
            <button
                ref={ref}
                type="button"
                onClick={handleCopy}
                className={cn(
                    "inline-flex items-center gap-1 rounded-md p-1.5 text-muted transition-colors hover:bg-bg-hover hover:text-txt",
                    className,
                )}
                aria-label={copied ? "Copied" : "Copy"}
                {...props}
            >
                {copied ? (
                    <Check className="h-3.5 w-3.5 text-ok" />
                ) : (
                    <Copy className="h-3.5 w-3.5" />
                )}
                {children}
            </button>
        )
    },
)
CopyButton.displayName = "CopyButton"
