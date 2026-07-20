import { useState, useEffect } from "react";
import { User, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { authAPI } from "@/api/auth.api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AccountCard({ user }) {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", jobTitle: "" });
  const [errors, setErrors] = useState({});
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        jobTitle: user.jobTitle || "",
      });
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: authAPI.updateProfile,
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to update profile");
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!formData.name.trim()) next.name = "Name is required";
    if (!formData.email.trim()) next.email = "Email is required";
    else if (!EMAIL_RE.test(formData.email)) next.email = "Enter a valid email address";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    updateProfileMutation.mutate(formData);
  };

  const handleReset = () => {
    if (!user) return;
    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      jobTitle: user.jobTitle || "",
    });
    setErrors({});
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <User className="h-5 w-5" style={{ color: "var(--primary)" }} />
          <CardTitle>Account Information</CardTitle>
        </div>
        <CardDescription>Update your personal account information.</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <Label required>Full Name</Label>
              <Input name="name" value={formData.name} onChange={handleChange} placeholder="Enter your name" />
              {errors.name && <p className="text-[12px] text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label required>Email Address</Label>
              <Input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" />
              {errors.email && <p className="text-[12px] text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <Label>Phone Number</Label>
              <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="Enter phone number" />
            </div>

            <div>
              <Label>Job Title</Label>
              <Input name="jobTitle" value={formData.jobTitle} onChange={handleChange} placeholder="e.g. Software Engineer" />
            </div>

            <div>
              <Label>Role</Label>
              <Input value={user?.role || ""} disabled />
            </div>

            <div>
              <Label>Company</Label>
              <Input value={user?.company?.name || "No company"} disabled />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
            <Button type="button" variant="outline" onClick={handleReset} disabled={updateProfileMutation.isPending}>
              Reset
            </Button>
            <Button type="submit" loading={updateProfileMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}