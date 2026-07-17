import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Edit,
  DollarSign,
  Calendar,
  Building2,
  User,
  TrendingUp,
} from "lucide-react";

import { opportunitiesAPI } from "@/api/opportunities.api";
import { formatDate } from "@/lib/utils";

export default function OpportunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: opportunity,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["opportunity", id],
    queryFn: () =>
      opportunitiesAPI.getById(id).then((res) => res.data),
  });

  if (isLoading) {
    return <div className="p-6">Loading Opportunity...</div>;
  }

  if (error || !opportunity) {
    return <div className="p-6">Opportunity not found.</div>;
  }

  return (
    <div className="animate-fade-in p-4 md:p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">

        <div className="flex items-center gap-3">
          <button
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} />
          </button>

          <div>
            <h1 className="text-2xl font-bold">
              {opportunity.name}
            </h1>

            <p className="text-sm text-gray-500">
              Opportunity Details
            </p>
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={() =>
            navigate(`/crm/opportunities/${opportunity.id}/edit`)
          }
        >
          <Edit size={16} />
          Edit
        </button>

      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* Left */}
        <div className="lg:col-span-2 card p-6">

          <h2 className="text-xl font-semibold mb-6">
            Opportunity Information
          </h2>

          <div className="grid md:grid-cols-2 gap-6">

            <div>
              <label className="text-sm text-gray-500">
                Opportunity Name
              </label>

              <p className="font-medium mt-1">
                {opportunity.name}
              </p>
            </div>

            <div>
              <label className="text-sm text-gray-500">
                Stage
              </label>

              <div className="mt-2">
                <span className="badge badge-primary">
                  {opportunity.stage}
                </span>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-500 flex items-center gap-2">
                <Building2 size={16} />
                Account
              </label>

              <p className="mt-1">
                {opportunity.account?.name || "-"}
              </p>
            </div>

            <div>
              <label className="text-sm text-gray-500 flex items-center gap-2">
                <User size={16} />
                Owner
              </label>

              <p className="mt-1">
                {opportunity.assignedTo?.name || "Unassigned"}
              </p>
            </div>

            <div>
              <label className="text-sm text-gray-500 flex items-center gap-2">
                <DollarSign size={16} />
                Value
              </label>

              <p className="mt-1 font-semibold">
                NPR {Number(opportunity.value || 0).toLocaleString()}
              </p>
            </div>

            <div>
              <label className="text-sm text-gray-500 flex items-center gap-2">
                <TrendingUp size={16} />
                Probability
              </label>

              <p className="mt-1">
                {opportunity.probability || 0}%
              </p>
            </div>

            <div>
              <label className="text-sm text-gray-500 flex items-center gap-2">
                <Calendar size={16} />
                Close Date
              </label>

              <p className="mt-1">
                {formatDate(opportunity.closeDate)}
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-gray-500">
                Description
              </label>

              <p className="mt-2 whitespace-pre-wrap">
                {opportunity.description || "No description available"}
              </p>
            </div>

          </div>
        </div>

        {/* Right */}
        <div className="card p-6 h-fit">

          <h2 className="text-xl font-semibold mb-6">
            Opportunity Details
          </h2>

          <div className="space-y-5">

            <div>
              <label className="text-sm text-gray-500">
                Created
              </label>

              <p className="mt-1">
                {formatDate(opportunity.createdAt)}
              </p>
            </div>

            <div>
              <label className="text-sm text-gray-500">
                Updated
              </label>

              <p className="mt-1">
                {formatDate(opportunity.updatedAt)}
              </p>
            </div>

            <div>
              <label className="text-sm text-gray-500">
                Opportunity ID
              </label>

              <p className="mt-1 break-all">
                {opportunity.id}
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}