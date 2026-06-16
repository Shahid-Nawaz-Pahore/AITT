import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Building2,
  Calendar,
  CheckCircle,
  FileText,
  Hash,
  Shield,
  Upload,
  XCircle,
} from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useVerifyDocument } from "../hooks/useQueries";
import { Regulation } from "../types";

async function calculateSHA256(file: File): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  return new Uint8Array(hashBuffer);
}

export default function VerificationPage() {
  const verifyDocument = useVerifyDocument();
  const [isDragging, setIsDragging] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    document?: any;
  } | null>(null);

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (file.type !== "application/pdf") {
        toast.error("Only PDF files are accepted");
        return;
      }

      try {
        const hash = await calculateSHA256(file);
        const result = await verifyDocument.mutateAsync(hash);

        if (result) {
          setVerificationResult({ verified: true, document: result });
          toast.success("Document verified successfully");
        } else {
          setVerificationResult({ verified: false });
          toast.error("Document not found in database");
        }
      } catch (error) {
        toast.error("Error during verification");
        console.error(error);
      }
    },
    [verifyDocument],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileUpload(file);
    },
    [handleFileUpload],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileUpload(file);
      e.target.value = "";
    },
    [handleFileUpload],
  );

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatHash = (hash: Uint8Array) => {
    return Array.from(hash)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };

  const getRegulationLabel = (regulation: Regulation) => {
    return regulation === Regulation.euAIAct
      ? "EU – AI Act"
      : "US – AI Regulations";
  };

  return (
    <div className="container py-8 space-y-8 max-w-4xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CheckCircle className="h-8 w-8 text-primary" />
          Document Verification
        </h1>
        <p className="text-muted-foreground">
          Verify the authenticity of a document by comparing its cryptographic
          hash
        </p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload a Document to Verify
          </CardTitle>
          <CardDescription>
            Drag and drop or select a PDF file to verify its authenticity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            }`}
          >
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="verify-file-upload"
              disabled={verifyDocument.isPending}
            />
            <label htmlFor="verify-file-upload" className="cursor-pointer">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="h-10 w-10 text-primary" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-medium">
                    {verifyDocument.isPending
                      ? "Verifying..."
                      : "Drag and drop your PDF file here"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or click to select
                  </p>
                </div>
              </div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Verification Result */}
      {verificationResult && (
        <Card
          className={
            verificationResult.verified ? "border-green-500" : "border-red-500"
          }
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {verificationResult.verified ? (
                <>
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <span className="text-green-600">Authentic Document</span>
                </>
              ) : (
                <>
                  <XCircle className="h-6 w-6 text-red-600" />
                  <span className="text-red-600">Document Not Verified</span>
                </>
              )}
            </CardTitle>
            <CardDescription>
              {verificationResult.verified
                ? "This document was found in our database"
                : "This document was not found in our database"}
            </CardDescription>
          </CardHeader>
          {verificationResult.verified && verificationResult.document && (
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium">Filename</p>
                    <p className="text-sm text-muted-foreground">
                      {verificationResult.document.filename}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium">Company Name</p>
                    <p className="text-sm text-muted-foreground">
                      {verificationResult.document.companyName}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium">Upload Date</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(verificationResult.document.timestamp)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium">Regulatory Framework</p>
                    <Badge variant="outline">
                      {getRegulationLabel(
                        verificationResult.document.regulation,
                      )}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Hash className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium">Integrated Blockchain</p>
                    <p className="text-xs font-mono text-muted-foreground break-all">
                      {formatHash(verificationResult.document.hash)}
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setVerificationResult(null)}
                variant="outline"
                className="w-full"
              >
                Verify Another Document
              </Button>
            </CardContent>
          )}
          {!verificationResult.verified && (
            <CardContent>
              <Button
                onClick={() => setVerificationResult(null)}
                variant="outline"
                className="w-full"
              >
                Try Another Document
              </Button>
            </CardContent>
          )}
        </Card>
      )}

      {/* Info Section */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-lg">How Does Verification Work?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            1. When you upload a document, we calculate its SHA-256
            cryptographic hash
          </p>
          <p>
            2. This hash is unique to each document and changes if the content
            is modified
          </p>
          <p>
            3. We compare the hash of the uploaded document with those stored in
            our database
          </p>
          <p>
            4. If a match is found, the document is authentic and has not been
            modified
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
