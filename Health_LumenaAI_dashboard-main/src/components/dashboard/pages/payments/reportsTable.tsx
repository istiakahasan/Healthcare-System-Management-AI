import { ReportStatus, StaffReport } from "./types";

interface ReportsTableProps {
  data: StaffReport[];
  onView: (report: StaffReport) => void;
}

const getStatusColor = (status: ReportStatus) => {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-700";
    case "Pending":
      return "bg-yellow-100 text-yellow-700";
    case "Completed":
      return "bg-blue-100 text-blue-700";
    case "Cancelled":
      return "bg-red-100 text-red-700";
    case "Disputed":
      return "bg-orange-100 text-orange-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export const ReportsTable = ({ data, onView }: ReportsTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-blue-600 text-white">
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
        <tbody>
          {data.map((report) => (
            <tr
              key={report.id}
              className="border-b border-gray-200 hover:bg-gray-50"
            >
              <td className="px-6 py-4 text-sm font-medium">{report.staff}</td>
              <td className="px-6 py-4 text-sm">{report.date}</td>
              <td className="px-6 py-4 text-sm">{report.summary}</td>
              <td className="px-6 py-4">
                <span
                  className={`inline-block px-3 py-1 rounded text-sm font-medium ${getStatusColor(
                    report.status
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
    </div>
  );
};
