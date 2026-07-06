import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "@tanstack/react-router";
import { FileCheck2, Upload } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { ApiError } from "../api/types";
import { useFrameworks, useSubmitDocument } from "../hooks/data";

function isAcceptedFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return name.endsWith(".pdf") || name.endsWith(".docx");
}

export default function SubmitDocumentPage() {
  const navigate = useNavigate();
  const { data: frameworks } = useFrameworks();
  const submitDocument = useSubmitDocument();

  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((f: File) => {
    if (!isAcceptedFile(f)) {
      toast.error("Only PDF or Word (.docx) files are accepted");
      return;
    }
    setFile(f);
    if (!name.trim()) setName(f.name);
  }, [name]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Please enter a document name");
    if (!subject) return toast.error("Please select a compliance subject");
    if (!file) return toast.error("Please attach a PDF or .docx file");

    try {
      await submitDocument.mutateAsync({
        file,
        subject,
        filename: name.trim(),
      });
      toast.success("Document submitted for review");
      navigate({ to: "/company/documents" });
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not submit the document",
      );
    }
  };

  const isBusy = submitDocument.isPending;

  return (
    <div className="container py-8 space-y-8">
      <PageHeader
        title="Submit Document"
        subtitle="Submit a compliance document for legal review."
        icon={FileCheck2}
      />

      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Document details</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="doc-name">Document name</Label>
                <Input
                  id="doc-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. EU AI Act Conformity Declaration"
                  disabled={isBusy}
                />
              </div>

              <div className="space-y-2">
                <Label>Compliance subject</Label>
                <Select value={subject} onValueChange={setSubject} disabled={isBusy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a framework / subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {(frameworks ?? []).map((f) => (
                      <SelectItem key={f.id} value={f.name}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>File (PDF or .docx)</Label>
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-primary/50"
                  } ${isBusy ? "pointer-events-none opacity-50" : ""}`}
                >
                  <input
                    type="file"
                    accept=".pdf,.docx,application/pdf"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFile(f);
                      e.target.value = "";
                    }}
                    className="hidden"
                    id="doc-file"
                    disabled={isBusy}
                  />
                  <label htmlFor="doc-file" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                        <Upload className="h-7 w-7 text-primary" />
                      </div>
                      {file ? (
                        <p className="font-medium break-all">{file.name}</p>
                      ) : (
                        <>
                          <p className="font-medium">Drag and drop your file here</p>
                          <p className="text-sm text-muted-foreground">or click to select</p>
                        </>
                      )}
                    </div>
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">
                  A SHA-256 hash of the file is computed and anchored on-chain
                  with the submission.
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isBusy}>
                {submitDocument.isPending ? "Submitting…" : "Submit for review"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
