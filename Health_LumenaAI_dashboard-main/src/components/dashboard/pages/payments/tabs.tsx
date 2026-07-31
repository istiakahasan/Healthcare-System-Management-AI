import { TabValue } from "./types";

interface TabsProps {
  activeTab: TabValue;
  onTabChange: (tab: TabValue) => void;
}

export const Tabs = ({ activeTab, onTabChange }: TabsProps) => {
  const tabs: TabValue[] = ["Active", "Completed", "Cancelled", "Disputed"];

  return (
    <div className="flex gap-2 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
            activeTab === tab
              ? "bg-gray-300 text-gray-900"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};
