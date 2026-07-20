import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import {
  Camera,
  Mail,
  Building2,
  Shield,
  Trash2,
  BadgeCheck,
  ShieldAlert,
} from "lucide-react";

import Avatar from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import Card, { CardContent } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

import { authAPI } from "@/api/auth.api";

export default function ProfileHeader({ user }) {
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: authAPI.uploadAvatar,
    onSuccess: () => {
      toast.success("Profile photo updated.");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to upload profile photo.");
    },
  });

  const removeMutation = useMutation({
    mutationFn: authAPI.removeAvatar,
    onSuccess: () => {
      toast.success("Profile photo removed.");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setConfirmRemoveOpen(false);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Unable to remove profile photo.");
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => authAPI.resendVerificationEmail(user?.email),
    onSuccess: () => toast.success("Verification email sent — check your inbox."),
    onError: (error) =>
      toast.error(error?.response?.data?.message || "Failed to send verification email."),
  });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image.");
      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2 MB.");
      e.target.value = "";
      return;
    }

    uploadMutation.mutate(file, {
      onSettled: () => {
        e.target.value = ""; // allow re-selecting the same file next time
      },
    });
  };

  const isActive = user?.isActive !== false;
  const isVerified = !!user?.isVerified;

  return (
    <>
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <Avatar
                name={user?.name}
                src={
                  user?.avatar
                    ? `${import.meta.env.VITE_API_URL}${user.avatar}`
                    : undefined
                }
                size="xl"
                className="border-4 border-white shadow-lg"
              />

              <button
                type="button"
                className="absolute bottom-0 right-0 w-9 h-9 rounded-full btn btn-primary flex items-center justify-center"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadMutation.isPending}
                aria-label="Change profile photo"
              >
                {uploadMutation.isPending ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <Camera size={16} />
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleFileChange}
              />
            </div>

            <h2
              className="text-xl sm:text-2xl font-bold mt-5 max-w-full break-words text-center"
              style={{ color: "var(--text-primary)" }}
            >
              {user?.name}
            </h2>

            <div className="mt-2 flex items-center gap-2 flex-wrap justify-center">
              <Badge>{user?.role}</Badge>

              <Badge variant={isActive ? "success" : "danger"} dot>
                {isActive ? "Active" : "Deactivated"}
              </Badge>

              <Badge variant={isVerified ? "info" : "warning"} className="flex items-center gap-1">
                {isVerified ? <BadgeCheck size={12} /> : <ShieldAlert size={12} />}
                {isVerified ? "Verified" : "Unverified"}
              </Badge>
            </div>

            {!isVerified && (
              <button
                type="button"
                className="text-[12px] mt-2 underline disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ color: "var(--primary)" }}
                disabled={resendMutation.isPending}
                onClick={() => resendMutation.mutate()}
              >
                {resendMutation.isPending ? "Sending…" : "Resend verification email"}
              </button>
            )}

            <div className="w-full mt-6 space-y-4">
              <div className="flex items-center gap-3 min-w-0" style={{ color: "var(--text-secondary)" }}>
                <Mail size={18} className="shrink-0" />
                <span className="truncate">{user?.email}</span>
              </div>

              <div className="flex items-center gap-3 min-w-0" style={{ color: "var(--text-secondary)" }}>
                <Building2 size={18} className="shrink-0" />
                <span className="truncate">
                  {user?.company?.name || user?.companyName || "No Company"}
                </span>
              </div>

              <div className="flex items-center gap-3 min-w-0" style={{ color: "var(--text-secondary)" }}>
                <Shield size={18} className="shrink-0" />
                <span className="truncate">{user?.role}</span>
              </div>
            </div>

            <div className="flex gap-3 mt-6 w-full">
              <Button
                variant="outline"
                className="flex-1"
                loading={uploadMutation.isPending}
                onClick={() => fileInputRef.current?.click()}
              >
                Change Photo
              </Button>

              <Button
                variant="destructive"
                size="icon"
                disabled={removeMutation.isPending || !user?.avatar}
                onClick={() => setConfirmRemoveOpen(true)}
                aria-label="Remove profile photo"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmRemoveOpen}
        onClose={() => setConfirmRemoveOpen(false)}
        onConfirm={() => removeMutation.mutate()}
        title="Remove profile photo?"
        description="This will delete your current profile photo. You can upload a new one anytime."
        confirmLabel="Remove"
        confirmVariant="danger"
        loading={removeMutation.isPending}
      />
    </>
  );
}