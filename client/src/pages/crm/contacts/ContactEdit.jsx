import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

import { contactsAPI } from "@/api/contacts.api";
import { accountsAPI } from "@/api/accounts.api";
import { settingsAPI } from "@/api/settings.api";
import { contactSchema } from "@/lib/validations";

export default function ContactEdit() {
  const { id } = useParams();

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contactSchema),

    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      jobTitle: "",
      department: "",
      accountId: "",
      assignedToId: "",
      notes: "",
    },
  });

  // Contact Details
  const { data: contact, isLoading } = useQuery({
    queryKey: ["contact", id],

    queryFn: () =>
      contactsAPI.getById(id).then((res) => res.data),
  });

  // Accounts Dropdown
  const { data: accountsData } = useQuery({
    queryKey: ["accounts-dropdown"],

    queryFn: () =>
      accountsAPI
        .getAll({
          page: 1,
          limit: 1000,
        })
        .then((res) => res.data),
  });

  const accounts = accountsData?.accounts || [];

  // Users Dropdown
  const { data: usersData } = useQuery({
    queryKey: ["users"],

    queryFn: () =>
      settingsAPI
        .getUsers({
          page: 1,
          limit: 1000,
        })
        .then((res) => res.data),
  });

  const users = usersData?.users || usersData || [];

  useEffect(() => {
    if (!contact) return;

    reset({
      firstName: contact.firstName || "",
      lastName: contact.lastName || "",
      email: contact.email || "",
      phone: contact.phone || "",
      jobTitle: contact.jobTitle || "",
      department: contact.department || "",
      accountId: contact.accountId || "",
      assignedToId: contact.assignedToId || "",
      notes: contact.notes || "",
    });
  }, [contact, reset]);

  const updateMutation = useMutation({
    mutationFn: (data) =>
      contactsAPI.update(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contacts"],
      });

      queryClient.invalidateQueries({
        queryKey: ["contact", id],
      });

      toast.success("Contact updated successfully");

      navigate("/crm/contacts");
    },

    onError: (err) => {
      toast.error(
        err?.response?.data?.message ||
          "Failed to update contact"
      );
    },
  });

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
  <div className="animate-fade-in p-4 sm:p-6 max-w-4xl mx-auto">
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
      <button
        className="btn btn-secondary"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={16} />
      </button>

      <h1 className="text-xl font-bold">
        Edit Contact
      </h1>
    </div>

    <form
      className="card p-4 sm:p-6 flex flex-col gap-5"
      onSubmit={handleSubmit((data) =>
        updateMutation.mutate(data)
      )}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* First Name */}
        <div className="form-group">
          <label>First Name *</label>

          <input
            className="input"
            {...register("firstName")}
          />

          {errors.firstName && (
            <p className="text-xs text-red-500">
              {errors.firstName.message}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div className="form-group">
          <label>Last Name *</label>

          <input
            className="input"
            {...register("lastName")}
          />

          {errors.lastName && (
            <p className="text-xs text-red-500">
              {errors.lastName.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="form-group">
          <label>Email</label>

          <input
            type="email"
            className="input"
            {...register("email")}
          />

          {errors.email && (
            <p className="text-xs text-red-500">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Phone */}
        <div className="form-group">
          <label>Phone</label>

          <input
            className="input"
            {...register("phone")}
          />
        </div>

        {/* Job Title */}
        <div className="form-group">
          <label>Job Title</label>

          <input
            className="input"
            {...register("jobTitle")}
          />
        </div>

        {/* Department */}
        <div className="form-group">
          <label>Department</label>

          <select
            className="input"
            {...register("department")}
          >
            <option value="">Select Department</option>
            <option value="Sales">Sales</option>
            <option value="Marketing">Marketing</option>
            <option value="HR">HR</option>
            <option value="Finance">Finance</option>
            <option value="Technology">Technology</option>
            <option value="Operations">Operations</option>
            <option value="Support">Support</option>
            <option value="Management">Management</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Account */}
        <div className="form-group md:col-span-2">
          <label>Account</label>

          <select
            className="input"
            {...register("accountId")}
          >
            <option value="">
              Select Account
            </option>

            {accounts.map((account) => (
              <option
                key={account.id}
                value={account.id}
              >
                {account.name}
              </option>
            ))}
          </select>
        </div>

        {/* Assigned To */}
        <div className="form-group md:col-span-2">
          <label>Assigned To</label>

          <select
            className="input"
            {...register("assignedToId")}
          >
            <option value="">
              Unassigned
            </option>

            {users.map((user) => (
              <option
                key={user.id}
                value={user.id}
              >
                {user.name}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div className="form-group md:col-span-2">
          <label>Notes</label>

          <textarea
            rows={4}
            className="input"
            {...register("notes")}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-end gap-3 mt-2">

        <button
          type="button"
          className="btn btn-secondary w-full sm:w-auto"
          onClick={() => navigate(-1)}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="btn btn-primary w-full sm:w-auto"
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending
            ? "Saving..."
            : "Save Changes"}
        </button>

      </div>
    </form>
  </div>
);
}