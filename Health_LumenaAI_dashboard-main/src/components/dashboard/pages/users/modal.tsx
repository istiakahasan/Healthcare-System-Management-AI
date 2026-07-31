import { IUser } from "@/types/global";
import { formatStatusText } from "@/utils/formatStatusText";
import { parseISO } from "date-fns";
import { X } from "lucide-react";
import { useEffect } from "react";

interface ModalProps {
  user: IUser | null;
  onClose: () => void;
}

export const Modal = ({ user, onClose }: ModalProps) => {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);

  if (!user) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="User details"
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6 cursor-pointer" />
        </button>

        <h2 className="text-xl sm:text-2xl font-bold mb-4">User Details</h2>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">Name</p>
            <p className="font-medium">{user?.firstName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-medium">{user?.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Role</p>
            <p className="font-medium">{formatStatusText(user?.role)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <span
              className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                user?.status === "ACTIVE"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {formatStatusText(user.status)}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600">Joined Date</p>
            <p className="text-sm font-semibold">
              {parseISO(user?.createdAt).toDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
