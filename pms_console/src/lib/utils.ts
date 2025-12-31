import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, isValid } from "date-fns"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const safeFormatDate = (date: any, formatStr: string) => {
    try {
        const d = new Date(date)
        if (!isValid(d)) return "N/A"
        return format(d, formatStr)
    } catch (e) {
        return "N/A"
    }
}
