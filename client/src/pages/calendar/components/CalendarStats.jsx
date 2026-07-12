import { CalendarDays, Clock3, Video, Users } from "lucide-react";

export default function CalendarStats({
  today = 0,
  upcoming = 0,
  online = 0,
  attendees = 0,
}) {
  const cards = [
    {
      title: "Today's Meetings",
      value: today,
      icon: CalendarDays,
      color: "bg-blue-500",
    },
    {
      title: "Upcoming",
      value: upcoming,
      icon: Clock3,
      color: "bg-green-500",
    },
    {
      title: "Online",
      value: online,
      icon: Video,
      color: "bg-purple-500",
    },
    {
      title: "Participants",
      value: attendees,
      icon: Users,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="rounded-2xl border p-5 shadow-sm"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <div className="flex justify-between">
              <div>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  {card.title}
                </p>

                <h2
                  className="text-3xl font-bold mt-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  {card.value}
                </h2>
              </div>

              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}
              >
                <Icon className="text-white" size={22} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}