import {
  BadgeCheck,
  Briefcase,
  Calendar,
  Building2,
  UserCheck,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EmployeeSummary({ user }) {
  const employee = user?.employee;

  return (
    <div className="rounded-xl border bg-white dark:bg-gray-900 shadow-sm">
      <div className="border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">
            Employee Summary
          </h2>
        </div>

        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your employee information.
        </p>
      </div>

      <div className="p-6 space-y-5">

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BadgeCheck className="h-5 w-5 text-muted-foreground" />

            <div>
              <p className="text-sm text-muted-foreground">
                Employee ID
              </p>

              <p className="font-medium">
                {employee?.employeeId || "Not Assigned"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-muted-foreground" />

            <div>
              <p className="text-sm text-muted-foreground">
                Department
              </p>

              <p className="font-medium">
                {employee?.department || "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Briefcase className="h-5 w-5 text-muted-foreground" />

            <div>
              <p className="text-sm text-muted-foreground">
                Designation
              </p>

              <p className="font-medium">
                {employee?.designation || "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />

            <div>
              <p className="text-sm text-muted-foreground">
                Joining Date
              </p>

              <p className="font-medium">
                {employee?.joinDate
                  ? new Date(employee.joinDate).toLocaleDateString()
                  : "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserCheck className="h-5 w-5 text-muted-foreground" />

            <div>
              <p className="text-sm text-muted-foreground">
                Reporting Manager
              </p>

              <p className="font-medium">
                {employee?.reportingManager?.name || "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button
            variant="outline"
            className="w-full justify-between"
          >
            View Full Employee Profile

            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

      </div>
    </div>
  );
}