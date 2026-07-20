import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

import { accountsAPI } from "@/api/accounts.api";
import { settingsAPI } from "@/api/settings.api";
import { accountSchema } from "@/lib/validations";

export default function AccountEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      industry: "",
      website: "",
      email: "",
      phone: "",
      billingStreet: "",
      type: "",
      annualRevenue: 0,
      employees: "",
      assignedToId: "",
    },
  });

  const { data: account, isLoading } = useQuery({
    queryKey: ["account", id],
    queryFn: () => accountsAPI.getById(id).then((res) => res.data),
  });

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
    if (!account) return;

    reset({
      name: account.name || "",
      industry: account.industry || "",
      website: account.website || "",
      email: account.email || "",
      phone: account.phone || "",
      billingStreet: account.billingStreet || "",
      type: account.type || "",
      annualRevenue: account.annualRevenue || 0,
      employees: account.employees || "",
      assignedToId: account.assignedToId || "",
    });
  }, [account, reset]);

  const updateMutation = useMutation({
    mutationFn: (data) => {
      // Sequelize validators (isEmail) reject "" but accept null,
      // so blank optional fields must be sent as null.
      const clean = {};
      for (const [key, value] of Object.entries(data)) {
        clean[key] = value === "" ? null : value;
      }

      return accountsAPI.update(id, {
        ...clean,
        annualRevenue: Number(data.annualRevenue || 0),
        employees: data.employees ? Number(data.employees) : null,
        assignedToId: data.assignedToId || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["accounts"],
      });

      queryClient.invalidateQueries({
        queryKey: ["account", id],
      });

      toast.success("Account updated successfully");

      navigate(`/crm/accounts/${id}`);
    },

    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to update account");
    },
  });

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="animate-fade-in p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
        </button>

        <h1 className="text-xl font-bold">Edit Account</h1>
      </div>

      <form
        className="card p-4 sm:p-6 flex flex-col gap-5"
        onSubmit={handleSubmit((data) => updateMutation.mutate(data))}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label>Account Name *</label>

            <input className="input" {...register("name")} />

            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="form-group">
            <label>Industry</label>

            <input className="input" {...register("industry")} />
          </div>

          <div className="form-group">
            <label>Website</label>

            <input className="input" {...register("website")} />

            {errors.website && (
              <p className="text-xs text-red-500">{errors.website.message}</p>
            )}
          </div>

          <div className="form-group">
            <label>Email</label>

            <input type="email" className="input" {...register("email")} />

            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="form-group">
            <label>Phone</label>

            <input className="input" {...register("phone")} />
          </div>

          <div className="form-group">
            <label>Type</label>

            <select className="input" {...register("type")}>
              <option value="">Select Type</option>

              <option value="Customer">Customer</option>

              <option value="Partner">Partner</option>

              <option value="Prospect">Prospect</option>

              <option value="Competitor">Competitor</option>

              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Revenue</label>

            <input type="number" className="input" {...register("annualRevenue")} />
          </div>

          <div className="form-group">
            <label>Employees</label>

            <input type="number" className="input" {...register("employees")} />
          </div>

          <div className="form-group md:col-span-2">
            <label>Assigned To</label>

            <select className="input" {...register("assignedToId")}>
              <option value="">Unassigned</option>

              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group md:col-span-2">
            <label>Address</label>

            <textarea rows={3} className="input" {...register("billingStreet")} />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-end gap-3 mt-2">
          <button type="button" onClick={() => navigate(-1)}>
            Cancel
          </button>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
