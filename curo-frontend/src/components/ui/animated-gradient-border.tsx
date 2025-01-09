import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function AnimatedGradientBorder({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("relative p-[1px] group", className)}>
            <motion.div
                className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600"
                animate={{
                    background: [
                        "linear-gradient(to right, #60A5FA, #3B82F6, #2563EB)",
                        "linear-gradient(to right, #2563EB, #60A5FA, #3B82F6)",
                        "linear-gradient(to right, #3B82F6, #2563EB, #60A5FA)",
                    ],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse",
                }}
            />
            <div className="relative bg-white dark:bg-gray-900 rounded-lg">{children}</div>
        </div>
    );
}