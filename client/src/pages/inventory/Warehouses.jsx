import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Plus, Building2 } from "lucide-react";
import toast from "react-hot-toast";

import { inventoryAPI } from "@/api/inventory.api";

import DataTable from "@/components/shared/DataTable";
import FilterBar from "@/components/shared/FilterBar";
import FormModal from "@/components/shared/FormModal";
import Badge from "@/components/ui/Badge";

export default function Warehouses() {
  const queryClient = useQueryClient();

  const [params, setParams] = useState({
    page: 1,
    limit: 20,
    search: "",
  });

  const [modalOpen, setModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      code: "",
      location: "",
      phone: "",
      email: "",
      capacity: 0,
      description: "",
      isActive: true,
    },
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["warehouses"],
    queryFn: () =>
      inventoryAPI.getWarehouses().then((res) => res.data),
  });

  const createMutation = useMutation({
    mutationFn: inventoryAPI.createWarehouse,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["warehouses"],
      });

      toast.success("Warehouse created successfully");

      reset();
      setModalOpen(false);
    },

    onError: (err) => {
      toast.error(
        err.response?.data?.message ||
          "Failed to create warehouse"
      );
    },
  });

  const columns = [
    {
      key: "name",
      label: "Warehouse",
      render: (value) => (
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--primary-bg)" }}
          >
            <Building2
              size={15}
              style={{ color: "var(--primary)" }}
            />
          </div>

          <span>{value}</span>
        </div>
      ),
    },

    {
      key: "code",
      label: "Code",
    },

    {
      key: "location",
      label: "Location",
    },

    {
      key: "capacity",
      label: "Capacity",
    },

    {
      key: "isActive",
      label: "Status",
      render: (value) => (
        <Badge variant={value ? "success" : "gray"}>
          {value ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1
            className="text-[18px] font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Warehouses
          </h1>

          <p
            className="text-[12px] mt-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            {data?.length || 0} Warehouses
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setModalOpen(true)}
        >
          <Plus size={14} />
          Add Warehouse
        </button>
      </div>

      <FilterBar
        searchPlaceholder="Search Warehouse..."
        values={params}
        onChange={(key, value) =>
          setParams((prev) => ({
            ...prev,
            [key]: value,
          }))
        }
      />

      <div className="mx-6 mb-6 card overflow-hidden">
        <DataTable
          columns={columns}
          data={data || []}
          loading={isLoading}
          error={error}
          page={1}
          pageSize={20}
          total={data?.length || 0}
          onPageChange={() => {}}
        />
      </div>

      <FormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          reset();
        }}
        title="Add Warehouse"
        submitLabel="Create Warehouse"
        loading={createMutation.isPending}
        onSubmit={handleSubmit((formData) =>
          createMutation.mutate(formData)
        )}
      >
        <div className="grid grid-cols-2 gap-4">

          <div className="form-group col-span-2">
            <label className="form-label">
              Warehouse Name *
            </label>

            <input
              className="input"
              placeholder="Main Warehouse"
              {...register("name", {
                required: "Warehouse name is required",
              })}
            />

            {errors.name && (
              <p className="text-red-500 text-xs">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Warehouse Code *
            </label>

            <input
              className="input"
              placeholder="WH-001"
              {...register("code", {
                required: "Warehouse code is required",
              })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Location
            </label>

            <input
              className="input"
              placeholder="Kathmandu"
              {...register("location")}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Phone
            </label>

            <input
              className="input"
              {...register("phone")}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Email
            </label>

            <input
              type="email"
              className="input"
              {...register("email")}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Capacity
            </label>

            <input
              type="number"
              className="input"
              {...register("capacity")}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Status
            </label>

            <select
              className="input"
              {...register("isActive")}
            >
              <option value={true}>Active</option>
              <option value={false}>Inactive</option>
            </select>
          </div>

          <div className="form-group col-span-2">
            <label className="form-label">
              Description
            </label>

            <textarea
              rows={3}
              className="input"
              {...register("description")}
            />
          </div>

        </div>
      </FormModal>
    </div>
  );
}