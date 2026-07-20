import { useNavigate } from "react-router-dom";
import {
  BadgeCheck,
  Briefcase,
  Calendar,
  Building2,
  UserCheck,
  ArrowRight,
  UserX,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-5 w-5 shrink-0" style={{ color: "var(--text-muted)" }} />
      <div className="min-w-0">
        <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>{label}</p>
        <p className="font-medium text-[13px] truncate" style={{ color: "var(--text-primary)" }}>{value}</p>
      </div>
    </div>
  );
}

export default function EmployeeSummary({ user }) {
  const navigate = useNavigate();
  const employee = user?.employee;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" style={{ color: "var(--primary)" }} />
          <CardTitle>Employee Summary</CardTitle>
        </div>
        <CardDescription>Overview of your employee information.</CardDescription>
      </CardHeader>

      <CardContent>
        {employee ? (
          <div className="space-y-5">
            <Row icon={BadgeCheck} label="Employee ID" value={employee.employeeId || "Not assigned"} />
            <Row icon={Building2} label="Department" value={employee.department || "—"} />
            <Row icon={Briefcase} label="Designation" value={employee.designation || "—"} />
            <Row
              icon={Calendar}
              label="Joining Date"
              value={employee.joinDate ? new Date(employee.joinDate).toLocaleDateString() : "—"}
            />
            <Row
              icon={UserCheck}
              label="Reporting Manager"
              value={
                employee.reportingManager
                  ? `${employee.reportingManager.firstName} ${employee.reportingManager.lastName}`
                  : "—"
              }
            />

            <div className="pt-4 border-t" style={{ borderColor: "var(--border)" }}>
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => navigate(`/hr/employees/${employee.id}`)}
              >
                View Full Employee Profile
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center py-8">
            <UserX className="h-8 w-8 mb-3" style={{ color: "var(--text-muted)" }} />
            <p className="font-medium text-[13px]" style={{ color: "var(--text-primary)" }}>
              No employee record linked
            </p>
            <p className="text-[12px] mt-1" style={{ color: "var(--text-muted)" }}>
              Contact your HR admin to link your account to an employee profile.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}