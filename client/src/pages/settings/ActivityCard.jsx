import {
  Activity,
  LogIn,
  KeyRound,
  UserCog,
  CalendarDays,
  Monitor,
  MapPin,
  Clock,
} from "lucide-react";

import Badge from "@/components/ui/Badge";

export default function ActivityCard({ user }) {
  const activities = [
    {
      icon: LogIn,
      title: "Last Login",
      value: user?.lastLogin
        ? new Date(user.lastLogin).toLocaleString()
        : "Never",
      badge: "Latest",
    },
    {
      icon: UserCog,
      title: "Profile Updated",
      value: "2 days ago",
      badge: "Profile",
    },
    {
      icon: KeyRound,
      title: "Password Changed",
      value: "28 days ago",
      badge: "Security",
    },
    {
      icon: CalendarDays,
      title: "Account Created",
      value: user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString()
        : "-",
      badge: "Account",
    },
    {
      icon: Monitor,
      title: "Last Device",
      value: "Windows • Chrome",
      badge: "Device",
    },
    {
      icon: MapPin,
      title: "Last Location",
      value: "Nepal",
      badge: "Location",
    },
  ];

  return (
    <div className="rounded-xl border bg-white dark:bg-gray-900 shadow-sm">
      <div className="border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />

          <h2 className="text-lg font-semibold">
            Recent Activity
          </h2>
        </div>

        <p className="mt-1 text-sm text-muted-foreground">
          Recent account activity and security history.
        </p>
      </div>

      <div className="divide-y">

        {activities.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 py-5"
            >
              <div className="flex items-start gap-4">

                <div className="rounded-lg bg-primary/10 p-3">
                  <Icon className="h-5 w-5 text-primary" />
                </div>

                <div>
                  <h4 className="font-medium">
                    {item.title}
                  </h4>

                  <p className="text-sm text-muted-foreground mt-1">
                    {item.value}
                  </p>
                </div>

              </div>

              <Badge>
                {item.badge}
              </Badge>

            </div>
          );
        })}

      </div>

      <div className="border-t px-6 py-4 flex items-center justify-between">

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          Activity history is retained for security auditing.
        </div>

        <button className="text-primary text-sm font-medium hover:underline">
          View Full Activity Log
        </button>

      </div>
    </div>
  );
}