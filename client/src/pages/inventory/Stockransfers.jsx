import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRightLeft, Plus } from "lucide-react";

import { inventoryAPI } from "@/api/inventory.api";

import DataTable from "@/components/shared/DataTable";
import FilterBar from "@/components/shared/FilterBar";
import Badge from "@/components/ui/Badge";

export default function StockTransfers() {
  const [params, setParams] = useState({
    search: "",
    status: "",
  });

  const { data = [], isLoading, error } = useQuery({
    queryKey: ["stock-transfers", params],
    queryFn: () =>
      inventoryAPI.getTransfers(params).then((r) => r.data),
  });

  const columns = [
    {
      key: "referenceNo",
      label: "Reference",
    },

    {
      key: "item",
      label: "Item",
      render: (_, row) => row.item?.name || "—",
    },

    {
      key: "fromWarehouse",
      label: "From",
      render: (_, row) => row.fromWarehouse?.name || "—",
    },

    {
      key: "toWarehouse",
      label: "To",
      render: (_, row) => row.toWarehouse?.name || "—",
    },

    {
      key: "quantity",
      label: "Qty",
    },

    {
      key: "status",
      label: "Status",
      render: (value) => (
        <Badge variant={value === "Completed" ? "success" : "gray"}>
          {value}
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
            Stock Transfers
          </h1>

          <p
            className="text-[12px]"
            style={{ color: "var(--text-muted)" }}
          >
            {data.length} Transfers
          </p>

        </div>

        <button className="btn btn-primary">
          <Plus size={15} />
          New Transfer
        </button>

      </div>

      <FilterBar
        searchPlaceholder="Search Transfer..."
        values={params}
        onChange={(k, v) =>
          setParams((prev) => ({
            ...prev,
            [k]: v,
          }))
        }
      />

      <div className="mx-6 mb-6 card overflow-hidden">

        <DataTable
          columns={columns}
          data={data}
          loading={isLoading}
          error={error}
          page={1}
          total={data.length}
          pageSize={20}
          onPageChange={() => {}}
          emptyTitle="No Transfers"
          emptyDescription="Create your first stock transfer."
        />

      </div>

    </div>
  );
}