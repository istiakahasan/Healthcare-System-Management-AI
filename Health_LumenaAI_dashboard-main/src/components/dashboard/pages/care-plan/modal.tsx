/* eslint-disable @typescript-eslint/no-explicit-any */
import { ICarePlan } from "@/types/global";
import { formatStatusText } from "@/utils/formatStatusText";
import { parseISO } from "date-fns";
import { X } from "lucide-react";
import { useEffect } from "react";

interface ModalProps {
  careplan: ICarePlan;
  onClose: () => void;
}

export const Modal = ({ careplan: careplan, onClose }: ModalProps) => {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);

  if (!careplan) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Care plan details"
    >
      {/* Panel: flex column + capped height + hide outer overflow */}
      <div className="w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-xl ring-1 ring-black/5 relative flex flex-col overflow-hidden">
        {/* header (fixed area) */}
        <div className="flex items-start justify-between gap-4 p-6 border-b border-slate-200">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">
              {careplan?.title || "Care Plan"}
            </h2>
            <p className="mt-1 text-slate-600">
              {careplan?.description || "No description provided."}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-slate-500 hover:cursor-pointer hover:text-slate-700 rounded-lg p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* body (scrollable area) */}
        <div className="p-6 flex-1 overflow-auto overflow-x-auto">
          {/* top meta: 1 col on mobile, 2 cols on md+ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 mb-6">
            <div>
              <div className="text-slate-500 text-sm">Patient</div>
              <div className="text-slate-900">
                {`${careplan?.patient?.firstName} ${careplan?.patient?.lastName}` ||
                  "—"}
              </div>
            </div>
            <div>
              <div className="text-slate-500 text-sm">Type</div>
              <div className="text-slate-900">
                {formatStatusText(careplan?.carePlanType || "—")}
              </div>
            </div>
            <div>
              <div className="text-slate-500 text-sm">Duration</div>
              <div className="text-slate-900">
                {typeof careplan?.durationOfWeek === "number"
                  ? `${careplan?.durationOfWeek} ${
                      careplan?.durationOfWeek === 1 ? "week" : "weeks"
                    }`
                  : "—"}
              </div>
            </div>
            <div>
              <div className="text-slate-500 text-sm">Start Date</div>
              <div className="text-slate-900">
                {careplan?.startDate
                  ? parseISO(careplan.startDate as any).toDateString()
                  : "—"}
              </div>
            </div>
          </div>

          {/* simple sections */}
          <div className="space-y-5">
            <Section
              title="Days of Week"
              value={formatStatusText(careplan?.dayOfWeek?.join(", ") || "—")}
            />
            <Section
              title="Service Categories"
              value={
                careplan?.serviceCategory
                  ?.join(", ")
                  .split("_")
                  .join(" ")
                  .toLowerCase() || "—"
              }
            />
            <Section
              title="Shifts"
              value={careplan?.carePlanShift?.join(", ").toLowerCase() || "—"}
            />
            <Section
              title="Care Goals"
              value={careplan?.careGoals?.join(", ") || "—"}
            />
            <Section
              title="Support Activities"
              value={
                careplan?.supportActivity
                  ?.join(", ")
                  .split("_")
                  .join(" ")
                  .toLowerCase() || "—"
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// small, readable section block
function Section({ title, value }: { title: string; value: string }) {
  return (
    <div>
      <div className="text-slate-500 font-medium">{title}</div>
      <div className="text-slate-900 mt-1 capitalize">{value}</div>
    </div>
  );
}
