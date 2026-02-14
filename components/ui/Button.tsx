import { ComponentProps } from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends ComponentProps<"button"> {
    variant?: "default" | "outline" | "ghost" | "link"
    size?: "default" | "sm" | "lg" | "icon"
}

export default function Button({ className, variant = "default", size = "default", ...props }: ButtonProps) {
    const variants = {
        default: "bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 hover:shadow-primary/25 transition-all duration-300",
        outline: "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
    }

    const sizes = {
        default: "h-11 px-6 py-2", // Taller, more premium feel
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-md px-8 text-base",
        icon: "h-10 w-10",
    }

    return (
        <button
            className={cn(
                "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        />
    )
}
