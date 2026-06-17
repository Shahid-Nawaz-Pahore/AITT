import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, UserPlus, Users, Wallet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useInviteSubAdmin,
  useRemoveSubAdmin,
  useSubAdmins,
} from "../hooks/useMockData";
import type { SubAdmin } from "../mock/types";
import { fakeWallet, shortHash } from "../mock/utils";

export default function AdminExpertsPage() {
  const { data: subAdmins, isLoading } = useSubAdmins();
  const inviteSubAdmin = useInviteSubAdmin();
  const removeSubAdmin = useRemoveSubAdmin();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [wallet, setWallet] = useState("");
  const [removeTarget, setRemoveTarget] = useState<SubAdmin | null>(null);

  const resetForm = () => {
    setName("");
    setEmail("");
    setWallet("");
  };

  const handleInvite = async () => {
    if (!name.trim() || !email.trim() || !wallet.trim()) {
      toast.error("Please fill in name, email and wallet");
      return;
    }
    await inviteSubAdmin.mutateAsync({
      name: name.trim(),
      email: email.trim(),
      wallet: wallet.trim(),
    });
    toast.success(`Invitation sent to ${name.trim()}`);
    resetForm();
    setInviteOpen(false);
  };

  const handleRemove = async () => {
    if (!removeTarget) return;
    const name = removeTarget.name;
    await removeSubAdmin.mutateAsync(removeTarget.id);
    setRemoveTarget(null);
    toast.success(`${name} removed`);
  };

  const columns: Column<SubAdmin>[] = [
    {
      header: "Legal expert",
      cell: (s) => (
        <div className="min-w-0">
          <p className="font-medium break-words">{s.name}</p>
          <p className="text-xs text-muted-foreground break-words">{s.email}</p>
        </div>
      ),
    },
    {
      header: "Wallet",
      cell: (s) => (
        <span className="font-mono text-xs text-muted-foreground">
          {shortHash(s.wallet)}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (s) =>
        s.status === "active" ? (
          <Badge className="border-transparent bg-primary text-primary-foreground">
            Active
          </Badge>
        ) : (
          <Badge className="border-transparent bg-blue-500 text-white">Invited</Badge>
        ),
    },
    { header: "Reviews", cell: (s) => s.reviewsDone },
    {
      header: "",
      headClassName: "text-right",
      className: "text-right",
      cell: (s) => (
        <Button
          size="sm"
          variant="outline"
          className="gap-1 text-destructive hover:text-destructive"
          onClick={() => setRemoveTarget(s)}
        >
          <Trash2 className="h-4 w-4" />
          Remove
        </Button>
      ),
    },
  ];

  return (
    <div className="container py-8 space-y-8">
      <PageHeader
        title="Sub-Admin Management"
        subtitle="Invite and manage legal experts who review submissions."
        icon={Users}
        actions={
          <Button className="gap-2" onClick={() => setInviteOpen(true)}>
            <UserPlus className="h-4 w-4" />
            Invite expert
          </Button>
        }
      />

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <DataTable
          columns={columns}
          data={subAdmins ?? []}
          rowKey={(s) => s.id}
          emptyMessage="No legal experts yet."
        />
      )}

      {/* Invite dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite legal expert</DialogTitle>
            <DialogDescription>
              The expert is added as “invited” until they accept.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="expert-name">Name</Label>
              <Input
                id="expert-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expert-email">Email</Label>
              <Input
                id="expert-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="j.doe@aitt-legal.example"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expert-wallet">Wallet</Label>
              <div className="flex gap-2">
                <Input
                  id="expert-wallet"
                  value={wallet}
                  onChange={(e) => setWallet(e.target.value)}
                  placeholder="G…"
                  className="font-mono text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="flex-shrink-0 gap-2"
                  onClick={() => setWallet(fakeWallet())}
                >
                  <Wallet className="h-4 w-4" />
                  Connect
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={inviteSubAdmin.isPending}>
              {inviteSubAdmin.isPending ? "Inviting…" : "Send invite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        title="Remove legal expert?"
        description={
          <>
            This will remove <strong>{removeTarget?.name}</strong> as a reviewer.
          </>
        }
        confirmLabel="Remove"
        destructive
        onConfirm={handleRemove}
      />
    </div>
  );
}
