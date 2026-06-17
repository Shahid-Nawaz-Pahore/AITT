import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Layers, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAddFramework,
  useAddTemplate,
  useFrameworks,
  useRemoveFramework,
  useRemoveTemplate,
  useTemplates,
  useUpdateFramework,
  useUpdateTemplate,
} from "../hooks/useMockData";
import type { Framework, Template } from "../mock/types";

interface FrameworkForm {
  id?: string;
  name: string;
  description: string;
}
interface TemplateForm {
  id?: string;
  name: string;
  description: string;
  file: string;
}

export default function AdminFrameworksPage() {
  const { data: frameworks, isLoading: fwLoading } = useFrameworks();
  const { data: templates, isLoading: tplLoading } = useTemplates();
  const addFramework = useAddFramework();
  const updateFramework = useUpdateFramework();
  const removeFramework = useRemoveFramework();
  const addTemplate = useAddTemplate();
  const updateTemplate = useUpdateTemplate();
  const removeTemplate = useRemoveTemplate();

  const [fwForm, setFwForm] = useState<FrameworkForm | null>(null);
  const [tplForm, setTplForm] = useState<TemplateForm | null>(null);
  const [removeFw, setRemoveFw] = useState<Framework | null>(null);
  const [removeTpl, setRemoveTpl] = useState<Template | null>(null);

  const saveFramework = async () => {
    if (!fwForm) return;
    if (!fwForm.name.trim()) return toast.error("Please enter a name");
    const input = { name: fwForm.name.trim(), description: fwForm.description.trim() };
    if (fwForm.id) {
      await updateFramework.mutateAsync({ id: fwForm.id, input });
      toast.success("Framework updated");
    } else {
      await addFramework.mutateAsync(input);
      toast.success("Framework added");
    }
    setFwForm(null);
  };

  const saveTemplate = async () => {
    if (!tplForm) return;
    if (!tplForm.name.trim()) return toast.error("Please enter a name");
    if (!tplForm.file.trim()) return toast.error("Please enter a file name");
    const input = {
      name: tplForm.name.trim(),
      description: tplForm.description.trim(),
      file: tplForm.file.trim(),
    };
    if (tplForm.id) {
      await updateTemplate.mutateAsync({ id: tplForm.id, input });
      toast.success("Template updated");
    } else {
      await addTemplate.mutateAsync(input);
      toast.success("Template added");
    }
    setTplForm(null);
  };

  return (
    <div className="container py-8 space-y-8">
      <PageHeader
        title="Frameworks & Templates"
        subtitle="Manage compliance frameworks and the blank Word templates companies download."
        icon={Layers}
      />

      <Tabs defaultValue="frameworks" className="space-y-6">
        <TabsList>
          <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* Frameworks */}
        <TabsContent value="frameworks" className="space-y-4">
          <div className="flex justify-end">
            <Button
              className="gap-2"
              onClick={() => setFwForm({ name: "", description: "" })}
            >
              <Plus className="h-4 w-4" />
              Add framework
            </Button>
          </div>
          {fwLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : !frameworks || frameworks.length === 0 ? (
            <EmptyState icon={Layers} title="No frameworks" description="Add a compliance framework to get started." />
          ) : (
            <div className="space-y-3">
              {frameworks.map((f) => (
                <div
                  key={f.id}
                  className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium break-words">{f.name}</p>
                    <p className="text-sm text-muted-foreground break-words">
                      {f.description}
                    </p>
                  </div>
                  <div className="flex flex-shrink-0 gap-2">
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => setFwForm(f)}>
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 text-destructive hover:text-destructive"
                      onClick={() => setRemoveFw(f)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Templates */}
        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-end">
            <Button
              className="gap-2"
              onClick={() => setTplForm({ name: "", description: "", file: "" })}
            >
              <Plus className="h-4 w-4" />
              Add template
            </Button>
          </div>
          {tplLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : !templates || templates.length === 0 ? (
            <EmptyState icon={Layers} title="No templates" description="Add a blank Word template for companies to download." />
          ) : (
            <div className="space-y-3">
              {templates.map((t) => (
                <div
                  key={t.id}
                  className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium break-words">{t.name}</p>
                    <p className="text-sm text-muted-foreground break-words">
                      {t.description}
                    </p>
                    <p className="mt-1 font-mono text-xs text-muted-foreground break-all">
                      {t.file}
                    </p>
                  </div>
                  <div className="flex flex-shrink-0 gap-2">
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => setTplForm(t)}>
                      <Pencil className="h-4 w-4" />
                      Replace
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 text-destructive hover:text-destructive"
                      onClick={() => setRemoveTpl(t)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Framework add/edit dialog */}
      <Dialog open={!!fwForm} onOpenChange={(open) => !open && setFwForm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{fwForm?.id ? "Edit framework" : "Add framework"}</DialogTitle>
            <DialogDescription>
              Frameworks appear as compliance subjects when companies submit.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="fw-name">Name</Label>
              <Input
                id="fw-name"
                value={fwForm?.name ?? ""}
                onChange={(e) =>
                  setFwForm((f) => (f ? { ...f, name: e.target.value } : f))
                }
                placeholder="e.g. EU AI Act"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fw-desc">Description</Label>
              <Textarea
                id="fw-desc"
                value={fwForm?.description ?? ""}
                onChange={(e) =>
                  setFwForm((f) => (f ? { ...f, description: e.target.value } : f))
                }
                placeholder="Short description of the framework"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFwForm(null)}>
              Cancel
            </Button>
            <Button onClick={saveFramework}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template add/edit dialog */}
      <Dialog open={!!tplForm} onOpenChange={(open) => !open && setTplForm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tplForm?.id ? "Replace template" : "Add template"}</DialogTitle>
            <DialogDescription>
              Templates are the blank .docx files companies download to fill out.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="tpl-name">Name</Label>
              <Input
                id="tpl-name"
                value={tplForm?.name ?? ""}
                onChange={(e) =>
                  setTplForm((t) => (t ? { ...t, name: e.target.value } : t))
                }
                placeholder="e.g. EU AI Act Conformity Declaration"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tpl-desc">Description</Label>
              <Textarea
                id="tpl-desc"
                value={tplForm?.description ?? ""}
                onChange={(e) =>
                  setTplForm((t) => (t ? { ...t, description: e.target.value } : t))
                }
                placeholder="Short description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tpl-file">File name (.docx)</Label>
              <Input
                id="tpl-file"
                value={tplForm?.file ?? ""}
                onChange={(e) =>
                  setTplForm((t) => (t ? { ...t, file: e.target.value } : t))
                }
                placeholder="Template_Name.docx"
                className="font-mono text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTplForm(null)}>
              Cancel
            </Button>
            <Button onClick={saveTemplate}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!removeFw}
        onOpenChange={(open) => !open && setRemoveFw(null)}
        title="Remove framework?"
        description={
          <>
            This removes <strong>{removeFw?.name}</strong> from the list of
            compliance subjects.
          </>
        }
        confirmLabel="Remove"
        destructive
        onConfirm={async () => {
          if (!removeFw) return;
          await removeFramework.mutateAsync(removeFw.id);
          setRemoveFw(null);
          toast.success("Framework removed");
        }}
      />

      <ConfirmDialog
        open={!!removeTpl}
        onOpenChange={(open) => !open && setRemoveTpl(null)}
        title="Remove template?"
        description={
          <>
            This removes <strong>{removeTpl?.name}</strong> from the download
            center.
          </>
        }
        confirmLabel="Remove"
        destructive
        onConfirm={async () => {
          if (!removeTpl) return;
          await removeTemplate.mutateAsync(removeTpl.id);
          setRemoveTpl(null);
          toast.success("Template removed");
        }}
      />
    </div>
  );
}
