import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProposalStatusBadge } from "@/components/shared/ProposalStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  Check,
  CheckCircle2,
  ExternalLink,
  PenLine,
  Scale,
  ShieldAlert,
} from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import {
  useDocument,
  useExecuteProposal,
  useGovernance,
  useProposal,
  useSignProposal,
} from "../hooks/useMockData";
import { PROPOSAL_TYPE_LABEL } from "../mock/labels";
import { fakeTxHash, formatDate, shortHash } from "../mock/utils";

export default function ProposalDetailPage() {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const id = (params as { id?: string }).id;
  const { data: proposal, isLoading } = useProposal(id);
  const { data: gov } = useGovernance();
  const { data: targetDoc } = useDocument(proposal?.targetRef);
  const signProposal = useSignProposal();
  const executeProposal = useExecuteProposal();

  const wallets = useMemo(() => {
    const roster = gov?.signerWallets ?? [];
    const signers = proposal?.signers ?? [];
    return Array.from(new Set([...roster, ...signers]));
  }, [gov, proposal]);

  if (isLoading) {
    return (
      <div className="container py-8 space-y-6">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="container py-8">
        <EmptyState
          icon={Scale}
          title="Proposal not found"
          description="This proposal does not exist."
          action={
            <Button variant="outline" onClick={() => navigate({ to: "/admin/governance" })}>
              Back to governance
            </Button>
          }
        />
      </div>
    );
  }

  const reached = proposal.approvals >= proposal.threshold;
  const isPending = proposal.status === "pending";
  const progress = Math.min(100, (proposal.approvals / proposal.threshold) * 100);
  const isRevocationTarget =
    proposal.type === "revocation" && targetDoc != null;

  const handleSign = async (wallet: string) => {
    await signProposal.mutateAsync({ id: proposal.id, wallet });
    toast.success(`Signed as ${shortHash(wallet)} ✓`);
  };

  const handleExecute = async () => {
    await executeProposal.mutateAsync({ id: proposal.id, txHash: fakeTxHash() });
    toast.success(
      proposal.type === "revocation"
        ? "Proposal executed — certificate revoked, anchored on-chain ✓"
        : "Proposal executed and anchored on-chain ✓",
    );
  };

  return (
    <div className="container py-8 space-y-8">
      <PageHeader
        title={proposal.title}
        subtitle={`Created by ${proposal.createdBy} · ${formatDate(proposal.createdAt)}`}
        icon={Scale}
        actions={
          <>
            <Badge variant="outline">{PROPOSAL_TYPE_LABEL[proposal.type]}</Badge>
            <ProposalStatusBadge status={proposal.status} />
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Description + target */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground break-words">
              {proposal.description}
            </p>

            {proposal.targetRef && (
              <div className="rounded-lg border p-3 text-sm">
                <p className="text-muted-foreground">Target</p>
                {isRevocationTarget ? (
                  <button
                    type="button"
                    className="mt-1 inline-flex items-center gap-1 font-medium text-primary hover:underline"
                    onClick={() => navigate({ to: `/certificate/${targetDoc.id}` })}
                  >
                    {targetDoc.filename} — {targetDoc.company}
                    <ExternalLink className="h-3 w-3" />
                  </button>
                ) : (
                  <p className="mt-1 font-mono text-xs break-all">{proposal.targetRef}</p>
                )}
              </div>
            )}

            {proposal.type === "revocation" && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
                <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <p>
                  When executed, this proposal revokes the target certificate.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Approval + execution */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Approvals</CardTitle>
            <CardDescription>
              {proposal.approvals} of {proposal.threshold} required signatures
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={progress} />
            {isPending ? (
              reached ? (
                <Button
                  className="w-full gap-2"
                  onClick={handleExecute}
                  disabled={executeProposal.isPending}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {executeProposal.isPending ? "Executing…" : "Execute proposal"}
                </Button>
              ) : (
                <p className="text-center text-sm text-muted-foreground">
                  {proposal.threshold - proposal.approvals} more signature(s) needed
                  to execute.
                </p>
              )
            ) : (
              <div className="flex items-center justify-center gap-2 text-sm font-medium text-primary">
                <CheckCircle2 className="h-4 w-4" />
                Proposal {proposal.status}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Signers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Signers</CardTitle>
          <CardDescription>
            Each authorised signer can approve once. (Demo: sign on behalf of any
            signer.)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {wallets.map((wallet) => {
            const signed = proposal.signers.includes(wallet);
            return (
              <div
                key={wallet}
                className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="font-mono text-xs break-all">{wallet}</span>
                {signed ? (
                  <Badge className="border-transparent bg-primary text-primary-foreground gap-1 self-start sm:self-auto">
                    <Check className="h-3 w-3" />
                    Signed
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 self-start sm:self-auto"
                    onClick={() => handleSign(wallet)}
                    disabled={!isPending || signProposal.isPending}
                  >
                    <PenLine className="h-4 w-4" />
                    Sign
                  </Button>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
