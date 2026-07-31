"use client";

import type React from "react";

import { SIDEBAR_ITEMS } from "@/lib/constants";
import { MessageCircleMore, NotebookPen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "../../utils/icons";
import { LogoutButton } from "./LogoutButton";

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, isCollapsed, onClose }: SidebarProps) {
  const pathname = usePathname();

  //   const user = useAppSelector((state) => state.auth.user);
  const user = {
    role: "ADMIN",
  };

  const visibleItems = SIDEBAR_ITEMS.filter((item) =>
    item.roles.includes(user?.role || ""),
  );

  const getIcon = (iconName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      LayoutDashboard: <Icons.LayoutDashboard className="w-5 h-5" />,
      Calendar: <Icons.TbCalendarMonth className="w-5 h-5" />,
      NotebookPen: <NotebookPen className="w-5 h-5" />,
      Users: <Icons.Users className="w-5 h-5" />,
      CircleDollarSign: <Icons.CircleDollarSign className="w-5 h-5" />,
      MessageCircle: <MessageCircleMore className="w-5 h-5" />,

      HiOutlineCheckBadge: (
        <Icons.HiOutlineCheckBadge className="w-5.5 h-5.5" />
      ),
      BarChart3: <Icons.LuNotebookPen className="w-5 h-5" />,
      Settings: <Icons.Settings className="w-5 h-5" />,

      VscLaw: <Icons.VscLaw className="w-5 h-5" />,
      LuHandHeart: <Icons.LuHandHeart className="w-5 h-5" />,
    };
    return iconMap[iconName];
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-sm lg:hidden z-30"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen bg-white dark:bg-slate-950 border-r border-gray-200 dark:border-slate-800 transition-all duration-300 z-40 lg:relative lg:z-0 ${
          isOpen ? "w-64" : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        <div className="flex flex-col h-full">
          {/* <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-slate-800">
            <div
              className={`flex items-center gap-2 ${
                isCollapsed ? "lg:justify-center lg:w-full" : ""
              }`}
            >
              <Link
                href={"/dashboard/admin"}
                className="flex items-center gap-4"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                  AAI
                </div>
                {!isCollapsed && (
                  <span className="font-bold text-gray-900 dark:text-white hidden lg:inline">
                    LumenaAI
                  </span>
                )}
              </Link>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              aria-label="Close sidebar"
            >
              <Icons.X className="w-5 h-5" />
            </button>
          </div> */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-slate-800">
            <div
              className={`flex items-center gap-2 ${
                isCollapsed ? "lg:justify-center lg:w-full" : ""
              }`}
            >
              <Link
                href={"/"}
                title="Go Homepage"
                className="flex items-center gap-4"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold">
                  {isCollapsed && (
                    <Image
                      src={"/placeholder/able_dash_logo.png"}
                      alt="LumenaAI"
                      width={130}
                      draggable={false}
                      height={130}
                    ></Image>
                  )}
                </div>
                {!isCollapsed && (
                  <Image
                    src={"/placeholder/able.png"}
                    alt="LumenaAI"
                    width={110}
                    draggable={false}
                    height={110}
                  ></Image>
                )}
              </Link>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              aria-label="Close sidebar"
            >
              <Icons.X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
            {visibleItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => onClose()}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                  } ${isCollapsed ? "lg:justify-center lg:px-2" : ""}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  {getIcon(item.icon)}
                  {!isCollapsed && (
                    <span className=" text-sm font-medium">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-slate-800">
            {/* <LogoutButton isCollapsed={isCollapsed} /> */}
            <LogoutButton isCollapsed={isCollapsed} />
          </div>
        </div>
      </aside>
    </>
  );
}
