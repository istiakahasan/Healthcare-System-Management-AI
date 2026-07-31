import { cn } from "@/lib/utils";
import { IShiftStatus, StatusEnum } from "@/types/global";
import { formatStatusText } from "@/utils/formatStatusText";

type StatusMakerProps = {
  statusName?: StatusEnum | IShiftStatus;
  customClass?: string;
};

export default function StatusMaker({
  statusName = StatusEnum.UNKNOWN,
  customClass = "",
}: StatusMakerProps) {
  const baseClass =
    "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium";

  const statusColorClass = (() => {
    switch (statusName) {
      // GREEN
      case StatusEnum.ACTIVE:
      case StatusEnum.SUCCESS:
      case StatusEnum.COMPLETED:
      case IShiftStatus.COMPLETED:
        return "bg-green-100 text-green-800";

      // YELLOW
      case StatusEnum.PENDING:
      case StatusEnum.IN_PROGRESS:
        return "bg-yellow-100 text-yellow-800";

      // GRAY
      case StatusEnum.INACTIVE:
      case StatusEnum.DISABLED:
        return "bg-gray-100 text-gray-800";

      // AMBER
      case StatusEnum.SCHEDULED:
        return "bg-amber-100 text-amber-800";

      // RED
      case StatusEnum.ERROR:
      case StatusEnum.FAILED:
      case StatusEnum.CANCELLED:
      case IShiftStatus.CANCELLED:
        return "bg-red-100 text-red-800";

      // DEFAULT
      default:
        return "bg-blue-100 text-blue-800";
    }
  })();

  return (
    <span className={cn(baseClass, statusColorClass, customClass)}>
      {formatStatusText(String(statusName))}
    </span>
  );
}
