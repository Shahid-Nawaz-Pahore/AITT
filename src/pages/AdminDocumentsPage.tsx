import { DataTable, type Column } from "@/components/shared/DataTable";
import { OnChainBadge } from "@/components/shared/OnChainBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import { ScoreBadge } from "@/components/shared/ScoreBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { FileText, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useDocuments } from "../hooks/data";
import type { DocItem, DocStatus } from "../mock/types";
import { formatDate } from "../mock/utils";

const STATUS_OPTIONS: { value: DocStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under review" },
  { value: "requires_changes", label: "Requires changes" },
  { value: "approved", label: "Approved" },
  { value: "approved_with_recommendations", label: "Approved w/ rec." },
  { value: "issued", label: "Issued" },
  { value: "rejected", label: "Rejected" },
  { value: "revoked", label: "Revoked" },
  { value: "expired", label: "Expired" },
];

export default function AdminDocumentsPage() {
  const navigate = useNavigate();
  const { data: documents, isLoading } = useDocuments();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<DocStatus | "all">("all");

  const filtered = useMemo(() => {
    let docs = [...(documents ?? [])].sort((a, b) =>
      b.submittedAt.localeCompare(a.submittedAt),
    );
    if (status !== "all") docs = docs.filter((d) => d.status === status);
    const q = search.trim().toLowerCase();
    if (q) {
      docs = docs.filter(
        (d) =>
          d.company.toLowerCase().includes(q) ||
          d.subject.toLowerCase().includes(q) ||
          d.filename.toLowerCase().includes(q),
      );
    }
    return docs;
  }, [documents, search, status]);

  const columns: Column<DocItem>[] = [
    {
      header: "Document",
      cell: (d) => <span className="font-medium break-words">{d.filename}</span>,
    },
    { header: "Company", cell: (d) => d.company },
    { header: "Subject", cell: (d) => d.subject },
    { header: "Status", cell: (d) => <StatusBadge status={d.status} /> },
    {
      header: "Score",
      cell: (d) =>
        d.complianceScore != null ? (
          <ScoreBadge value={d.complianceScore} />
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      header: "Submitted",
      cell: (d) => (
        <span className="text-muted-foreground">{formatDate(d.submittedAt)}</span>
      ),
    },
    { header: "On-chain", cell: (d) => <OnChainBadge txHash={d.txHash} /> },
  ];

  return (
    <div className="container py-8 space-y-8">
      <PageHeader
        title="Documents"
        subtitle="Every document across the platform."
        icon={FileText}
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by company, subject or file…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as DocStatus | "all")}>
          <SelectTrigger className="sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          rowKey={(d) => d.id}
          onRowClick={(d) => navigate({ to: `/certificate/${d.id}` })}
          emptyMessage="No documents match your filters."
        />
      )}
    </div>
  );
}
