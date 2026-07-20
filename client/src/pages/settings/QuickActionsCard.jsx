import {
  User,
  KeyRound,
  Download,
  PenTool,
} from "lucide-react";

import Card, {
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/Card";

import { Button } from "@/components/ui/Button";

export default function QuickActionsCard({
  onEdit,
  onPassword,
  onDownload,
  onSignature,
}) {
  return (
    <Card>

      <CardHeader>

        <CardTitle>
          Quick Actions
        </CardTitle>

      </CardHeader>

      <CardContent className="space-y-3">

        <Button
          className="w-full justify-start"
          variant="outline"
          onClick={onEdit}
        >
          <User size={18} className="mr-2" />
          Edit Profile
        </Button>

        <Button
          className="w-full justify-start"
          variant="outline"
          onClick={onPassword}
        >
          <KeyRound size={18} className="mr-2" />
          Change Password
        </Button>

        <Button
          className="w-full justify-start"
          variant="outline"
          onClick={onSignature}
        >
          <PenTool size={18} className="mr-2" />
          Upload Signature
        </Button>

        <Button
          className="w-full justify-start"
          variant="outline"
          onClick={onDownload}
        >
          <Download size={18} className="mr-2" />
          Download Profile
        </Button>

      </CardContent>

    </Card>
  );
}