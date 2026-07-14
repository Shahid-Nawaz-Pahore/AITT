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
import { BadgeCheck, Trash2, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ApiError } from "../api/types";
import {
  useActivateSubAdmin,
  useInviteSubAdmin,
  useRemoveSubAdmin,
  useSubAdmins,
} from "../hooks/data";
import type { SubAdmin } from "../mock/types";
import { shortHash } from "../mock/utils";

export default function AdminExpertsPage() {
  const { data: subAdmins, isLoading } = useSubAdmins();
  const inviteSubAdmin = useInviteSubAdmin();
  const activateSubAdmin = useActivateSubAdmin();
  const removeSubAdmin = useRemoveSubAdmin();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [removeTarget, setRemoveTarget] = useState<SubAdmin | null>(null);

  const resetForm = () => {
    setName("");
    setEmail("");
  };

  const handleInvite = async () => {
    if (!name.trim() || !email.trim()) {
      toast.error("Please fill in name and email");
      return;
    }
    try {
      await inviteSubAdmin.mutateAsync({
        name: name.trim(),
        email: email.trim(),
      });
      toast.success(`Invitation sent to ${name.trim()}`);
      resetForm();
      setInviteOpen(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not invite expert");
    }
  };

  const handleActivate = async (sub: SubAdmin) => {
    try {
      await activateSubAdmin.mutateAsync(sub.id);
      toast.success(`${sub.name} activated — can now review`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not activate expert");
    }
  };

  const handleRemove = async () => {
    if (!removeTarget) return;
    const name = removeTarget.name;
    try {
      await removeSubAdmin.mutateAsync(removeTarget.id);
      setRemoveTarget(null);
      toast.success(`${name} removed`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not remove expert");
    }
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
      cell: (s) => {
        // Only the row being activated shows the pending state (not every button).
        const activating =
          activateSubAdmin.isPending && activateSubAdmin.variables === s.id;
        return (
          <div className="flex justify-end gap-2">
            {s.status === "invited" && (
              <Button
                size="sm"
                className="gap-1"
                onClick={() => handleActivate(s)}
                disabled={activating}
              >
                <BadgeCheck className="h-4 w-4" />
                {activating ? "Activating…" : "Activate"}
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="gap-1 text-destructive hover:text-destructive"
              onClick={() => setRemoveTarget(s)}
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </Button>
          </div>
        );
      },
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
