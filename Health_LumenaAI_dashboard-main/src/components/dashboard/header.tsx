"use client";
import { logout } from "@/redux/features/user/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { IRole } from "@/types/global";
import { formatStatusText } from "@/utils/formatStatusText";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Icons } from "../../utils/icons";
interface HeaderProps {
  onMenuClick: () => void;
  sidebarOpen: boolean;
  isCollapsed: boolean;
  onCollapseToggle: () => void;
}

export function Header({
  onMenuClick,
  sidebarOpen,
  isCollapsed,
  onCollapseToggle,
}: HeaderProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    // logout();
    dispatch(logout());
    router.replace("/login");
    router.refresh();
    toast.success("Logout successful!");
    // router.push("/login");
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {/* <div className="lg:hidden border border-gray-100 rounded-md px-2">
          <Link
            href={"/dashboard/admin"}
            className="rounded-lg text-blue-600 flex items-center justify-center font-bold"
          >
            LumenaAI
          </Link>
        </div> */}
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-500 p-2 rounded-md transition-all bg-gray-50 dark:bg-gray-800 hover:cursor-pointer transform  duration-300"
          aria-label="Toggle menu"
        >
          {/* <Icons.Menu className="w-5 h-5" /> */}
          {sidebarOpen ? (
            <Icons.TbLayoutSidebarLeftCollapseFilled />
          ) : (
            <Icons.TbLayoutSidebarRightCollapseFilled />
          )}
        </button>

        <button
          onClick={onCollapseToggle}
          className="hidden lg:flex -ml-7 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-500 p-2 rounded-r-lg transition-colors bg-gray-50 dark:bg-gray-800 hover:cursor-pointer"
          aria-label="Toggle sidebar collapse"
        >
          {/* <Icons.Menu className="w-5 h-5" /> */}

          {isCollapsed ? (
            <Icons.TbLayoutSidebarRightCollapseFilled />
          ) : (
            <Icons.TbLayoutSidebarLeftCollapseFilled />
          )}
        </button>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification & Message Icon Section */}
        <div className="flex items-center gap-x-7 mx-4">
          {/* Notification */}
          <div className="relative inline-block hover:cursor-pointer">
            {/* Notification icon */}
            {/* <Icons.IoNotificationsSharp className="w-7 h-7 text-gray-600 dark:text-[#abc2d3]" /> */}

            {/* Badge */}
            {/* <span
              className="
                    absolute -top-3 -right-3
                    flex h-7 w-7 items-center justify-center
                    rounded-full bg-red-500 text-[12px] font-semibold text-white
                    shadow-sm"
            >
              99+
            </span> */}
          </div>
          {/* Message */}
          <div className="relative inline-block hover:cursor-pointer">
            {/* Message icon */}
            {/* <Icons.AiFillMessage className="w-7 h-7 text-gray-600 dark:text-[#abc2d3]" /> */}

            {/* Badge */}
            {/* <span
              className="
                    absolute -top-3 -right-3
                    flex h-7 w-7 items-center justify-center
                    rounded-full bg-blue-500 text-[12px] font-semibold text-white
                    shadow-sm"
            >
              99+
            </span> */}
          </div>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-100 hover:bg-blue-200  dark:bg-slate-800 transition-colors duration-300 hover:cursor-pointer"
            aria-label="User menu"
          >
            {user?.profileImage ? (
              <Image
                width={200}
                height={200}
                src={user?.profileImage || "/placeholder.svg"}
                alt="profile"
                draggable={false}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <Image
                width={200}
                height={200}
                src={"/placeholder/avatar1.jpg"}
                alt="profile"
                draggable={false}
                className="w-8 h-8 rounded-full object-cover"
              />
            )}

            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {`${user?.firstName ?? "N/A"} ${user?.lastName ?? ""}`}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {user?.role ? formatStatusText(user.role) : ""}
              </p>
            </div>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {`${user?.firstName} ${user?.lastName}`}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>

              <div className="p-2 space-y-1">
                {user?.role === IRole.ADMIN ? (
                  <button
                    onClick={() => {
                      router.push("/dashboard/admin/settings");
                      setShowDropdown(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors hover:cursor-pointer"
                  >
                    <Icons.Settings className="w-4 h-4" />
                    Settings
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      router.push("/dashboard/admin");
                      setShowDropdown(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors hover:cursor-pointer"
                  >
                    <Icons.LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </button>
                )}
                {/* <button
                  onClick={() => {
                    router.push("/dashboard/admin/settings");
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors hover:cursor-pointer"
                >
                  <Icons.CiSettings className="w-5 h-5 text-sm font-medium" />
                  Settings
                </button> */}
              </div>

              <div className="p-2 border-t border-gray-200 dark:border-slate-700">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors hover:cursor-pointer"
                >
                  <Icons.LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
