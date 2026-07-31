// ShiftModal.tsx
import { IShift } from "@/types/global";
import { formatStatusText } from "@/utils/formatStatusText";
import { Icons } from "@/utils/icons";
import { parseISO } from "date-fns";
import { useEffect } from "react";

const ShiftModal = ({
  shift,
  onClose,
  markComplete,
  markReject,
}: {
  shift: IShift | null;
  onClose: () => void;
  markComplete: (shiftId: string) => void;
  markReject: (shiftId: string) => void;
}) => {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);

  if (!shift) return null;

  const shiftDate = shift.createdAt
    ? parseISO(shift.createdAt).toDateString()
    : "N/A";

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Shift details"
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <Icons.X className="w-6 h-6 cursor-pointer" />
        </button>

        <h2 className="text-xl sm:text-2xl font-bold mb-4">Shift Details</h2>

        <div className="space-y-4">
          {/* Shift Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Shift Summary</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex gap-3">
                <dt className="text-gray-600">Shift ID:</dt>
                <dd className="font-medium">{shift.id}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="text-gray-600">Client:</dt>
                <dd className="font-medium">
                  {shift.customer?.firstName} {shift.customer?.lastName}
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="text-gray-600">Staff:</dt>
                <dd className="font-medium">
                  {shift.staff?.firstName} {shift.staff?.lastName}
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="text-gray-600">Service:</dt>
                <dd className="font-medium">
                  {formatStatusText(shift.serviceCategory?.join(", ")) || "N/A"}
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="text-gray-600">Date:</dt>
                <dd className="font-medium">{shiftDate}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="text-gray-600">Status:</dt>
                <dd className="font-medium">
                  {formatStatusText(shift.status || "-")}
                </dd>
              </div>
            </dl>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 hidden">
            <button
              onClick={() => markComplete(shift?.id ?? "")}
              className="flex-1 bg-primary text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer"
            >
              Mark Completed
            </button>
            <button
              onClick={() => markReject(shift?.id ?? "")}
              className="flex-1 bg-red-500 border  text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors font-medium cursor-pointer"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftModal;
