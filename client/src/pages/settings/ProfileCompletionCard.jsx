import Card, {
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/Card";

export default function ProfileCompletionCard({ user }) {
  const items = [
    {
      label: "Profile Photo",
      completed: !!user?.avatar,
    },
    {
      label: "Email",
      completed: !!user?.email,
    },
    {
      label: "Phone",
      completed: !!user?.phone,
    },
    {
      label: "Company",
      completed: !!(
        user?.company?.name ||
        user?.companyName
      ),
    },
    {
      label: "Department",
      completed: !!user?.department,
    },
    {
      label: "Emergency Contact",
      completed: !!user?.emergencyContact,
    },
    {
      label: "Signature",
      completed: !!user?.signature,
    },
  ];

  const completed = items.filter(
    (item) => item.completed
  ).length;

  const percentage = Math.round(
    (completed / items.length) * 100
  );

  return (
    <Card>

      <CardHeader>

        <CardTitle>
          Profile Completion
        </CardTitle>

      </CardHeader>

      <CardContent>

        <div className="flex justify-between mb-2">

          <span
            style={{
              color: "var(--text-secondary)",
            }}
          >
            Completion
          </span>

          <span className="font-semibold">
            {percentage}%
          </span>

        </div>

        <div className="w-full h-3 rounded-full bg-gray-700 overflow-hidden">

          <div
            className="h-full bg-blue-600 transition-all duration-500"
            style={{
              width: `${percentage}%`,
            }}
          />

        </div>

        <div className="mt-6 space-y-3">

          {items.map((item) => (

            <div
              key={item.label}
              className="flex justify-between items-center"
            >

              <span
                style={{
                  color: "var(--text-secondary)",
                }}
              >
                {item.label}
              </span>

              <span
                className={
                  item.completed
                    ? "text-green-500"
                    : "text-red-500"
                }
              >
                {item.completed ? "Completed" : "Missing"}
              </span>

            </div>

          ))}

        </div>

      </CardContent>

    </Card>
  );
}