/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ICarePlan, ICarePlanStatus } from "@/types/global";
import { formatStatusText } from "@/utils/formatStatusText";
import { Icons } from "@/utils/icons";

// tiny status map — easy to read & tweak
const STATUS = {
  ACTIVE: {
    wrap: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
    dot: "bg-blue-500",
    label: "Active",
  },
  ONGOING: {
    wrap: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200",
    dot: "bg-amber-500",
    label: "Ongoing",
  },
  COMPLETED: {
    wrap: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
    dot: "bg-emerald-500",
    label: "Completed",
  },
  ALL: {
    wrap: "bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-200",
    dot: "bg-slate-400",
    label: "All",
  },
  // soft fallback if status is unknown
  FALLBACK: {
    wrap: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
    dot: "bg-red-500",
    label: "Inactive",
  },
} as const;

function getBadge(status?: ICarePlanStatus | string) {
  if (!status) return STATUS.FALLBACK;
  return (STATUS as any)[status] ?? STATUS.FALLBACK;
}

function pluralWeeks(n?: number) {
  if (typeof n !== "number") return "—";
  return `${n} ${n === 1 ? "Week" : "Weeks"}`;
}

export function CarePlanCard({
  plan,
  onView,
  onDelete,
  isCarePlanDeleting,
}: {
  plan: ICarePlan;
  onView?: (planId: string) => void;
  onDelete?: (planId: string) => void;
  isCarePlanDeleting?: boolean;
}) {
  const title = plan?.title || "Untitled Care Plan";
  const type = plan?.carePlanType || "—";

  const patient =
    (plan as any)?.patientName ||
    (plan as any)?.patient?.firstName +
      " " +
      (plan as any)?.patient?.lastName ||
    plan?.patientId ||
    "—";

  const days = plan?.dayOfWeek?.length
    ? plan.dayOfWeek.map((d) => String(d).trim()).join(", ")
    : "—";

  const shifts = plan?.carePlanShift?.length
    ? plan.carePlanShift.map((s) => String(s).trim()).join(", ")
    : "—";

  const duration = pluralWeeks(plan?.durationOfWeek);
  const badge = getBadge(plan?.status as string);

  return (
    <article
      className="
        group flex flex-col justify-between
        rounded-2xl border border-slate-200 bg-white/80 p-5 sm:p-6"
      aria-label={title}
    >
      {/* header */}
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="min-w-0">
          <h3
            title={title}
            className="text-lg sm:text-xl font-semibold text-slate-900 truncate"
          >
            {title}
          </h3>
          <p className="mt-1 text-sm sm:text-base text-slate-500">
            {formatStatusText(type)}
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${badge.wrap}`}
          title={badge.label}
        >
          <span className={`h-2 w-2 rounded-full ${badge.dot}`} aria-hidden />
          {badge.label}
        </span>
      </div>

      {/* details */}
      <div className="mt-4 space-y-2.5 text-sm sm:text-base text-slate-800">
        <div className="flex flex-col xs:flex-row xs:items-center gap-1">
          <span className="text-slate-500 min-w-34">Patient Name:</span>
          <span>{patient}</span>
        </div>
        <div className="flex flex-col xs:flex-row xs:items-center gap-1">
          <span className="text-slate-500 min-w-34">Working Day:</span>
          <span className="capitalize">{formatStatusText(days)}</span>
        </div>
        <div className="flex flex-col xs:flex-row xs:items-center gap-1">
          <span className="text-slate-500 min-w-34">Shift:</span>
          <span className="capitalize">{formatStatusText(shifts)}</span>
        </div>
        <div className="flex flex-col xs:flex-row xs:items-center gap-1">
          <span className="text-slate-500 min-w-34">Duration:</span>
          <span>{duration}</span>
        </div>
      </div>

      {/* actions */}
      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={() => onView?.((plan?.id as string) || "")}
          className="
            w-full inline-flex items-center justify-center gap-2
            rounded-xl px-4 py-2.5 text-sm sm:text-base font-medium
            bg-primary text-white hover:bg-primary
            focus:outline-none focus-visible:ring-2 focus-visible:ring-primary
            transition-colors hover:cursor-pointer
          "
          title={`View details for ${title}`}
          aria-label={`View details for ${title}`}
        >
          View Details
        </button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              disabled={isCarePlanDeleting}
              variant="ghost"
              size="lg"
              className="
            shrink-0 inline-flex items-center justify-center
            rounded-xl border border-red-100 text-red-600
            hover:bg-red-50 hover:text-red-700
            transition-colors hover:cursor-pointer
          "
              title={`Delete ${title}`}
              aria-label={`Delete ${title}`}
            >
              <Icons.RiDeleteBinLine className="w-6 h-6 size-10" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this
                care plan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="hover:cursor-pointer">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={isCarePlanDeleting}
                onClick={() => onDelete?.((plan?.id as string) || "")}
                className="bg-red-700 text-white hover:bg-red-800 hover:cursor-pointer transition-colors duration-300"
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </article>
  );
}
