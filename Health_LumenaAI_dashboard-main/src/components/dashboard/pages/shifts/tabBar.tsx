/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusEnum } from "@/types/global";

export const TabBar = ({ activeTab, onTabChange }: any) => {
  const tabs = [
    StatusEnum.ACTIVE,
    StatusEnum.COMPLETED,
    StatusEnum.CANCELLED,
    StatusEnum.DISPUTED,
  ];

  return (
    <div
      className="
        flex gap-2 mb-6 overflow-x-auto
        [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden
        md:flex-wrap
        mask-[linear-gradient(to_right,transparent,black_24px,black_calc(100%-24px),transparent)]
      "
      aria-label="Shift status tabs"
      role="tablist"
    >
      {tabs.map((tab) => (
        <button
          key={tab}
          role="tab"
          aria-selected={activeTab === tab}
          onClick={() => onTabChange(tab)}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
            activeTab === tab
              ? "bg-gray-300 text-gray-900"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};
