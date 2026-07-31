import { cn } from "@/utils";
import { Icons } from "@/utils/icons";
import { Skeleton } from "../ui/skeleton";

interface StatsCardProps {
  title: string;
  icon: keyof typeof Icons;
  value?: string | number;
  valueText?: string;
  iconColor?: string;
  iconBgColor?: string;
  cardClass?: string;

  isLoading?: boolean;
}

const StatsCard = ({
  title,
  icon,
  value,
  valueText,
  iconColor,
  iconBgColor,
  cardClass,
  isLoading,
}: StatsCardProps) => {
  const DynamicIcon = Icons[icon];
  const hasValue = value !== undefined && value !== null;

  return (
    <div
      className={cn(
        // border shadow-sm
        "min-w-0 flex flex-col rounded-xl border bg-white dark:bg-[#0e1116] dark:border-[#1f2937] p-4 sm:p-5",
        cardClass
      )}
      aria-busy={isLoading ? true : undefined}
    >
      <div className="flex items-center justify-between">
        {isLoading ? (
          <>
            <Skeleton className="h-4 w-28 sm:w-36 rounded-md" aria-hidden />
            <Skeleton
              className={cn(
                "h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 rounded-lg",
                iconBgColor
              )}
              aria-hidden
            />
          </>
        ) : (
          <>
            <h3
              title={title}
              className="text-sm sm:text-base font-semibold text-zinc-800 dark:text-zinc-100 line-clamp-1"
            >
              {title}
            </h3>

            <div className={cn("rounded-lg border-none", iconBgColor)}>
              <DynamicIcon
                className={cn(
                  "p-2 rounded-md size-8 sm:size-9 md:size-10",
                  iconColor
                )}
              />
            </div>
          </>
        )}
      </div>

      <div className="mt-4 sm:mt-5">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton
              className="h-6 w-32 sm:h-7 sm:w-40 md:h-8 md:w-48"
              aria-hidden
            />
            <Skeleton className="h-4 w-24 sm:w-28" aria-hidden />
          </div>
        ) : hasValue || valueText ? (
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-50 wrap-break-word">
            {hasValue ? value : null}
            {valueText ? (
              <span className="ml-1 text-sm sm:text-base font-medium text-zinc-500">
                {valueText}
              </span>
            ) : null}
          </p>
        ) : (
          // Fallback skeleton when value is truly missing and not loading
          <Skeleton className="h-6 w-32" aria-hidden />
        )}
      </div>
    </div>
  );
};

export default StatsCard;
