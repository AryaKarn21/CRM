import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { financeAPI } from "@/api/finance.api";
import { expenseSchema } from "@/lib/validations";
import ExpenseForm from "@/components/finance/ExpenseForm";

export default function EditExpense() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["expense", id],
    queryFn: () => financeAPI.getExpense(id).then((r) => r.data),
    enabled: !!id,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(expenseSchema),
  });

  useEffect(() => {
    if (data) {
      reset({
        title: data.title || "",
        amount: data.amount || "",
        category: data.category || "",
        date: data.date ? data.date.split("T")[0] : "",
        paymentMethod: data.paymentMethod || "Cash",
        vendor: data.vendor || "",
        description: data.description || "",
      });
    }
  }, [data, reset]);

  const updateMutation = useMutation({
    mutationFn: (values) => financeAPI.updateExpense(id, values),
    onSuccess: () => {
      toast.success("Expense updated successfully");
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense", id] });
      navigate(`/finance/expenses/${id}`);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to update expense");
    },
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <h2 className="text-lg font-semibold">Loading Expense...</h2>
      </div>
    );
  }

  const onSubmit = (values) => {
    updateMutation.mutate(values);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="text-[18px] font-bold" style={{ color: "var(--text-primary)" }}>Edit Expense</h1>
          <p className="text-[12px] mt-1" style={{ color: "var(--text-muted)" }}>Update expense information</p>
        </div>
      </div>

      <div className="p-6">
        <ExpenseForm
          register={register}
          errors={errors}
          handleSubmit={handleSubmit}
          onSubmit={onSubmit}
          loading={updateMutation.isPending}
          submitLabel="Update Expense"
        />
      </div>
    </div>
  );
}