import { useGetTopRatedStaffQuery } from "@/redux/api/staff/staffApi";
import { useAppSelector } from "@/redux/hook";
import { ITopRatedStaff } from "@/types/global";
import StarRating from "@/utils/StarRating";
import Image from "next/image";
import TopRatedStaffSkeleton from "./TopRatedStaffSkeleton";

const TopRatedStaff = () => {
  const token = useAppSelector((state) => state?.auth?.accessToken);

  // get all top rated staff
  const { data: topRatedStaff, isLoading: isTopRatedStaffLoading } =
    useGetTopRatedStaffQuery(undefined, {
      skip: !token,
    });
  //   console.log(topRatedStaff);

  if (isTopRatedStaffLoading) {
    return <TopRatedStaffSkeleton />;
  }

  return (
    <section
      className="mt-6 rounded-2xl   p-6 bg-white dark:bg-[#0e1116] dark:border-[#1f2937] transition-colors"
      aria-labelledby="top-rated-staff-heading"
    >
      <h3
        id="top-rated-staff-heading"
        className="text-base font-semibold text-zinc-900 dark:text-zinc-100"
      >
        Top Rated Staff
      </h3>

      <ul
        className="
          mt-4 grid gap-3
          grid-cols-1
        "
        role="list"
      >
        {topRatedStaff?.data?.map((item: ITopRatedStaff) => (
          <li
            key={item.id}
            className="
              rounded-xl bg-zinc-100/70 dark:bg-zinc-800/50
              px-4 py-3
              flex flex-col gap-3
              sm:flex-row sm:items-center sm:justify-between
            "
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative h-9 w-9 shrink-0">
                {item?.staffDetails?.profileImage ? (
                  <Image
                    src={item?.staffDetails?.profileImage || ""}
                    alt={
                      `${item?.staffDetails?.firstName} ${item?.staffDetails?.lastName}` ||
                      ""
                    }
                    fill
                    className="rounded-full object-cover"
                    sizes="36px"
                  />
                ) : (
                  <Image
                    src={"/placeholder/avatar2.jpg"}
                    alt={""}
                    fill
                    className="rounded-full object-cover"
                    sizes="36px"
                  />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {`${item?.staffDetails?.firstName} ${item?.staffDetails?.lastName}` ||
                    ""}
                </p>
                <p className="truncate text-xs text-zinc-600 dark:text-zinc-400">
                  {item?.staffDetails?.email || ""}
                </p>
              </div>
            </div>

            <div
              className="
                flex items-center gap-2 sm:gap-3
                text-sm text-zinc-800 dark:text-zinc-100
              "
              aria-label={`Rating ${
                item?.ratingStats?.totalReviews || 0
              } out of ${5}`}
            >
              {StarRating({ rating: item?.ratingStats?.totalReviews || 0 })}
              <span className="tabular-nums">
                {item?.ratingStats?.totalReviews || 0} / {5}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default TopRatedStaff;
