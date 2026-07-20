import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { financeAPI } from "@/api/finance.api";

import LedgerHeader from "./LedgerHeader";
import LedgerFilters from "./LedgerFilters";
import LedgerSummary from "./LedgerSummary";
import LedgerTable from "./LedgerTable";
import LedgerModal from "./LedgerModal";
import LedgerDtails from "./LedgerDtails";

export default function GeneralLedger() {
  const queryClient = useQueryClient();
  const [params, setParams] = useState({
    page: 1,
    limit: 25,
    search: "",
    type: "",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null); // entry being edited, or null = "add" mode
  const [selectedEntry, setSelectedEntry] = useState(null); // entry shown in the details panel

  const { data, isLoading, error } = useQuery({
    queryKey: ["ledger", params],
    queryFn: () => financeAPI.getLedgerEntries(params).then((r) => r.data),
  });

  // The /finance/ledger endpoint returns { entries, total }. Guard against
  // any legacy/bare-array response shape so this never crashes again.
  const entries = Array.isArray(data) ? data : data?.entries || [];
  const total = Array.isArray(data)
    ? entries.length
    : (data?.total ?? entries.length);

  const createMutation = useMutation({
    mutationFn: financeAPI.createEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ledger"] });
      closeModal();
      toast.success("Ledger entry created");
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to create entry"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }) => financeAPI.updateEntry(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ledger"] });
      closeModal();
      toast.success("Ledger entry updated");
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to update entry"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => financeAPI.deleteEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ledger"] });
      toast.success("Ledger entry deleted");
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to delete entry"),
  });

  const openAddModal = () => {
    setEditingEntry(null);
    setModalOpen(true);
  };

  const openEditModal = (entry) => {
    setEditingEntry(entry);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingEntry(null);
  };

  const handleModalSubmit = (values) => {
    if (editingEntry) {
      updateMutation.mutate({ id: editingEntry.id, values });
    } else {
      createMutation.mutate(values);
    }
  };

  return (
    <div className="animate-fade-in">
      <LedgerHeader total={total} onAddEntry={openAddModal} />

      <LedgerFilters
        values={params}
        onChange={(k, v) => setParams((p) => ({ ...p, [k]: v, page: 1 }))}
      />

      <LedgerSummary entries={entries} />

      <LedgerTable
        entries={entries}
        total={total}
        page={params.page}
        pageSize={params.limit}
        loading={isLoading}
        error={error}
        onPageChange={(page) => setParams((p) => ({ ...p, page }))}
        onView={(row) => setSelectedEntry(row)}
        onEdit={openEditModal}
        onDelete={(id) => deleteMutation.mutate(id)}
      />

      <LedgerModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
        entry={editingEntry}
      />

      <LedgerDtails
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
        onEdit={openEditModal}
        onDelete={(id) => deleteMutation.mutate(id)}
      />
    </div>
  );
}
