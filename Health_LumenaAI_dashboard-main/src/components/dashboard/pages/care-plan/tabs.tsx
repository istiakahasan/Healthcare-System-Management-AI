// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Tabs = ({ activeTab, onTabChange }: any) => {
  const tabs = [
    { name: "All", value: "All" },
    { name: "Active", value: "Active" },
    { name: "Pending", value: "Pending" },
    { name: "Completed", value: "Completed" },
    { name: "Newest First", value: "Newest First" },
  ];

  return (
    <div className="flex gap-2 mb-8">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onTabChange(tab.value)}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
            activeTab === tab.value
              ? "bg-gray-300 text-gray-900"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {tab.name}
        </button>
      ))}
    </div>
  );
};
