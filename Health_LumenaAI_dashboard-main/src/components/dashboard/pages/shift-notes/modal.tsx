import { CheckCircle, X, XCircle } from "lucide-react";
import { StaffReport } from "./types";

interface ModalProps {
  report: StaffReport | null;
  onClose: () => void;
}

export const Modal = ({ report, onClose }: ModalProps) => {
  if (!report) return null;

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6 cursor-pointer" />
        </button>

        <h2 className="text-2xl font-bold mb-6">Report Details</h2>

        <div className="space-y-5">
          {/* Staffs Raw Report */}
          {report.rawNotes && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Staff&apos;s Raw Report
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed">
                {report.rawNotes}
              </div>
            </div>
          )}

          {/* Incident & Concern */}
          {(report.incident || report.concern) && (
            <div className="grid grid-cols-1 gap-4">
              {report.incident && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Incident</h3>
                  <div className="bg-red-50 rounded-lg p-4 text-sm text-red-700">
                    {report.incident}
                  </div>
                </div>
              )}
              {report.concern && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Concern</h3>
                  <div className="bg-orange-50 rounded-lg p-4 text-sm text-orange-700">
                    {report.concern}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI Summary */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">AI Summary</h3>
            <div className="bg-blue-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed">
              {report.aiSummary}
            </div>
          </div>

          {/* Admin Notes */}
          {report.adminNote && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Admin Notes</h3>
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed">
                {report.adminNote}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button className="flex items-center justify-center gap-2 flex-1 text-green-600 py-2.5  rounded-lg hover:bg-green-700 hover:text-white transition-colors font-medium border border-green-600 cursor-pointer">
              <CheckCircle className="w-4 h-4" />
              Approve
            </button>
            <button className="flex items-center justify-center gap-2 flex-1  text-red-600 py-2.5  rounded-lg hover:bg-red-700 hover:text-white transition-colors font-medium border border-red-600 cursor-pointer">
              <XCircle className="w-4 h-4" />
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
