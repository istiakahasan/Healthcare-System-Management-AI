import StatsCard from "@/components/shared/StatsCard";
import { useGetDashboardStatsQuery } from "@/redux/api/adminDashboardStats/adminDashboardStatsApi";
import { useGetRecentShiftsQuery } from "@/redux/api/shifts/shiftsApi";
import { useAppSelector } from "@/redux/hook";
import AdminDashboardSmoothAreaChart from "./Chart";
import RecentShiftTable from "./RecentShiftTable";
import TopRatedStaff from "./TopRatedStaff";

const AdminHome = () => {
  // token from store
  const token = useAppSelector((state) => state.auth.accessToken);

  //   Fetch admin home stats
  const { data: stats, isLoading: isStatsLoading } = useGetDashboardStatsQuery(
    undefined,
    {
      skip: !token,
    }
  );

  //   Get recent shifts data
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: recentShifts, isLoading: isRecentShiftsLoading } =
    useGetRecentShiftsQuery(undefined, {
      skip: !token,
    });

  //   console.log(recentShifts);

  return (
    <div>
      {/* Cards */}
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          icon="Users"
          value={stats?.data?.totalUsers || 0}
          valueText="Active Users"
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
          isLoading={isStatsLoading}
        />
        <StatsCard
          title="Active Staff"
          icon="HiMiniUserGroup"
          value={stats?.data?.activeStaff || 0}
          valueText="Active Staff"
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          isLoading={isStatsLoading}
        />

        <StatsCard
          title="Pending Verifications"
          icon="HiOutlineCheckBadge"
          value={stats?.data?.totalUsers || 0}
          valueText="Waiting Approval"
          iconBgColor="bg-orange-100"
          iconColor="text-orange-600"
          isLoading={isStatsLoading}
        />

        <StatsCard
          title="Ongoing Shifts"
          icon="LuClock"
          value={stats?.data?.totalUsers || 0}
          valueText="Active Shifts"
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
          isLoading={isStatsLoading}
        />
      </div>
      {/* Chart */}
      <div>
        <AdminDashboardSmoothAreaChart />
      </div>

      {/* Top Rated Staff */}
      <div>
        <TopRatedStaff />
      </div>
      {/* Top Rated Staff */}
      <div className="mt-10">
        <RecentShiftTable />
      </div>
    </div>
  );
};

export default AdminHome;
