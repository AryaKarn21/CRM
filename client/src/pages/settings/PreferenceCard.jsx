import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Settings,
  Globe,
  Clock3,
  CalendarDays,
  DollarSign,
  Moon,
  Save,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { authAPI } from "@/api/auth.api";

const LANGUAGES = ["English", "Nepali", "Hindi"];
const DATE_FORMATS = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];
const CURRENCIES = ["NPR", "USD", "EUR", "INR", "GBP"];
const THEMES = ["system", "light", "dark"];
const TIMEZONES = [
  "Asia/Kathmandu",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
  "UTC",
];

function Select({ name, value, onChange, options, labels }) {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="input w-full"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {labels ? labels[opt] : opt}
        </option>
      ))}
    </select>
  );
}

export default function PreferenceCard({ user }) {
  const [preferences, setPreferences] = useState({
    language: "English",
    timezone: "Asia/Kathmandu",
    dateFormat: "DD/MM/YYYY",
    currency: "NPR",
    theme: "system",
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user) {
      setPreferences({
        language: user.language || "English",
        timezone: user.timezone || "Asia/Kathmandu",
        dateFormat: user.dateFormat || "DD/MM/YYYY",
        currency: user.currency || "NPR",
        theme: user.theme || "system",
      });
    }
  }, [user]);

  const savePrefsMutation = useMutation({
    mutationFn: authAPI.updateProfile,
    onSuccess: () => {
      toast.success("Preferences saved");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Failed to save preferences"),
  });

  const handleChange = (e) => {
    setPreferences((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    savePrefsMutation.mutate(preferences);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5" style={{ color: "var(--primary)" }} />
          <CardTitle>Preferences</CardTitle>
        </div>
        <CardDescription>Customize how the CRM behaves for your account.</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <form onSubmit={handleSubmit} className="space-y-5 flex-1 flex flex-col">
          <div>
            <Label className="flex items-center gap-2"><Globe className="h-4 w-4" />Language</Label>
            <Select name="language" value={preferences.language} onChange={handleChange} options={LANGUAGES} />
          </div>

          <div>
            <Label className="flex items-center gap-2"><Clock3 className="h-4 w-4" />Time Zone</Label>
            <Select name="timezone" value={preferences.timezone} onChange={handleChange} options={TIMEZONES} />
          </div>

          <div>
            <Label className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />Date Format</Label>
            <Select name="dateFormat" value={preferences.dateFormat} onChange={handleChange} options={DATE_FORMATS} />
          </div>

          <div>
            <Label className="flex items-center gap-2"><DollarSign className="h-4 w-4" />Currency</Label>
            <Select name="currency" value={preferences.currency} onChange={handleChange} options={CURRENCIES} />
          </div>

          <div>
            <Label className="flex items-center gap-2"><Moon className="h-4 w-4" />Theme</Label>
            <Select
              name="theme"
              value={preferences.theme}
              onChange={handleChange}
              options={THEMES}
              labels={{ system: "System", light: "Light", dark: "Dark" }}
            />
          </div>

          <div className="flex justify-end pt-2 border-t mt-auto" style={{ borderColor: "var(--border)" }}>
            <Button type="submit" loading={savePrefsMutation.isPending}>
              <Save className="mr-2 h-4 w-4" />
              Save Preferences
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}