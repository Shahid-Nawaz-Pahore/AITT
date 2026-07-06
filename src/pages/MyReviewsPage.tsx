import { DataTable, type Column } from "@/components/shared/DataTable";
import { DecisionBadge } from "@/components/shared/DecisionBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { OnChainBadge } from "@/components/shared/OnChainBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import { ScoreBadge } from "@/components/shared/ScoreBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { ClipboardCheck } from "lucide-react";
import { useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useDocuments } from "../hooks/data";
import { DEMO_REVIEWER } from "../mock/identity";
import type { DocItem, Review } from "../mock/types";
import { formatDate } from "../mock/utils";

interface ReviewRow {
  key: string;
  doc: DocItem;
  review: Review;
}

export default function MyReviewsPage() {
  const navigate = useNavigate();
  const { isMock } = useAuth();
  const { data: documents, isLoading } = useDocuments();

  // TODO(integration): the backend exposes no current-user profile/name, so in
  // real mode we can't filter to "only my reviews" by reviewer name. We show all
  // reviews on documents the reviewer can access. Needs a /me or reviewer-id.
  const rows = useMemo<ReviewRow[]>(() => {
    const out: ReviewRow[] = [];
    for (const doc of documents ?? []) {
      doc.reviews.forEach((review, i) => {
        if (!isMock || review.reviewer === DEMO_REVIEWER) {
          out.push({ key: `${doc.id}-${i}`, doc, review });
        }
      });
    }
    return out.sort((a, b) => b.review.date.localeCompare(a.review.date));
  }, [documents, isMock]);

  const columns: Column<ReviewRow>[] = [
    {
      header: "Document",
      cell: (r) => <span className="font-medium break-words">{r.doc.filename}</span>,
    },
    { header: "Company", cell: (r) => r.doc.company },
    { header: "Decision", cell: (r) => <DecisionBadge decision={r.review.decision} /> },
    { header: "Score", cell: (r) => <ScoreBadge value={r.review.complianceScore} /> },
    {
      header: "Date",
      cell: (r) => (
        <span className="text-muted-foreground">{formatDate(r.review.date)}</span>
      ),
    },
    { header: "On-chain", cell: (r) => <OnChainBadge txHash={r.review.txHash} /> },
  ];

  return (
    <div className="container py-8 space-y-8">
      <PageHeader
        title="My Reviews"
        subtitle={
          isMock
            ? `Reviews recorded by ${DEMO_REVIEWER}.`
            : "Reviews recorded across the documents you can access."
        }
        icon={ClipboardCheck}
      />

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="No reviews yet"
          description="Reviews you record from the queue will appear here."
        />
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          rowKey={(r) => r.key}
          onRowClick={(r) => navigate({ to: `/certificate/${r.doc.id}` })}
        />
      )}
    </div>
  );
}
