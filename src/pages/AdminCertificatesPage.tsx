import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { ScoreBadge } from "@/components/shared/ScoreBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { Award, BadgeCheck, Ban, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  useCreateProposal,
  useDocuments,
  useIssueCertificate,
} from "../hooks/useMockData";
import { DEMO_ADMIN } from "../mock/identity";
import type { DocItem } from "../mock/types";
import { fakeTxHash } from "../mock/utils";

const ISSUABLE = ["approved", "approved_with_recommendations"];

export default function AdminCertificatesPage() {
  const navigate = useNavigate();
  const { data: documents, isLoading } = useDocuments();
  const issueCertificate = useIssueCertificate();
  const createProposal = useCreateProposal();
  const [search, setSearch] = useState("");
  const [revokeTarget, setRevokeTarget] = useState<DocItem | null>(null);

  const filtered = useMemo(() => {
    const docs = [...(documents ?? [])].sort((a, b) =>
      b.submittedAt.localeCompare(a.submittedAt),
    );
    const q = search.trim().toLowerCase();
    if (!q) return docs;
    return docs.filter(
      (d) =>
        d.company.toLowerCase().includes(q) ||
        d.subject.toLowerCase().includes(q) ||
        d.filename.toLowerCase().includes(q),
    );
  }, [documents, search]);

  // Main-Admin direct action — issuance is NOT a vote (§3).
  const handleIssue = async (doc: DocItem) => {
    await issueCertificate.mutateAsync({ docId: doc.id, txHash: fakeTxHash() });
    toast.success(`Certificate issued for ${doc.filename} — anchored on-chain ✓`);
  };

  // Revocation is an exceptional action — it opens a multi-sig proposal,
  // it does NOT change the document status directly (§3).
  const handleRevoke = async () => {
    if (!revokeTarget) return;
    const doc = revokeTarget;
    await createProposal.mutateAsync({
      type: "revocation",
      title: `Revoke certificate for ${doc.filename}`,
      description: `Proposal to revoke the issued certificate for ${doc.company} (${doc.subject}). Requires multi-signature approval before it takes effect.`,
      createdBy: DEMO_ADMIN,
      targetRef: doc.id,
    });
    setRevokeTarget(null);
    toast.success("Revocation proposal opened — pending multi-sig approval");
  };

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
      header: "",
      headClassName: "text-right",
      className: "text-right",
      cell: (d) => (
        <div className="flex justify-end gap-2">
          {ISSUABLE.includes(d.status) && (
            <Button
              size="sm"
              className="gap-1"
              onClick={() => handleIssue(d)}
              disabled={issueCertificate.isPending}
            >
              <BadgeCheck className="h-4 w-4" />
              Issue
            </Button>
          )}
          {d.status === "issued" && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1 text-destructive hover:text-destructive"
              onClick={() => setRevokeTarget(d)}
            >
              <Ban className="h-4 w-4" />
              Revoke
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate({ to: `/certificate/${d.id}` })}
          >
            View
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container py-8 space-y-8">
      <PageHeader
        title="Certificates / Issuance"
        subtitle="Issue certificates directly; revocation goes through multi-sig governance."
        icon={Award}
      />

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search documents…"
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          rowKey={(d) => d.id}
          emptyMessage="No documents found."
        />
      )}

      <ConfirmDialog
        open={!!revokeTarget}
        onOpenChange={(open) => !open && setRevokeTarget(null)}
        title="Open a revocation proposal?"
        description={
          <>
            Revoking <strong>{revokeTarget?.filename}</strong> is an exceptional
            action. It will create a <strong>multi-signature governance
            proposal</strong> and only takes effect once the required signers
            approve and it is executed — it does not revoke the certificate
            immediately.
          </>
        }
        confirmLabel="Open proposal"
        onConfirm={handleRevoke}
      />
    </div>
  );
}
