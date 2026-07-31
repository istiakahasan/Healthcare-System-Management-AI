import Image from "next/image";
import { StaffReport } from "./types";

interface ReportsTableProps {
  data: StaffReport[];
  onView: (report: StaffReport) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-700";
    case "COMPLETED":
      return "bg-blue-100 text-blue-700";
    case "CANCELLED":
      return "bg-red-100 text-red-700";
    case "DISPUTED":
      return "bg-orange-100 text-orange-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export const ShiftnotesTable = ({ data, onView }: ReportsTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-primary text-white">
            <th className="px-6 py-3 text-left text-sm font-semibold">Staff</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">
              Summary Snippet
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold">
              Status
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((report) => (
            <tr key={report.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                    {report.staff.profileImage ? (
                      <Image
                        src={report.staff.profileImage}
                        alt=""
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-medium text-gray-500">
                        {report.staff.firstName[0]}
                        {report.staff.lastName[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">
                      {report.staff.firstName} {report.staff.lastName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {report.staff.email}
                    </span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {report.createdAt}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                {report.aiSummary}
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    report.status,
                  )}`}
                >
                  {report.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <button
                  onClick={() => onView(report)}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm underline cursor-pointer"
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          No shift notes found.
        </div>
      )}
    </div>
  );
};
