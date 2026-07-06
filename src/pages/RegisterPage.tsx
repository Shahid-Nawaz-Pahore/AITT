import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { Building2, Info, Lock, Wallet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ApiError } from "../api/types";
import { useAuth } from "../context/AuthContext";
import { fakeWallet } from "../mock/utils";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { registerCompany, isMock } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [wallet, setWallet] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Please fill in company name and email");
      return;
    }
    if (!isMock && !password) {
      toast.error("Please choose a password so you can sign in once approved");
      return;
    }
    setIsSubmitting(true);
    try {
      await registerCompany({
        name: name.trim(),
        email: email.trim(),
        password,
        wallet: wallet.trim() || undefined,
      });
      toast.success("Registration submitted — pending admin review");
      navigate({ to: "/signin" });
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not submit registration",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-lg">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Company Registration</CardTitle>
                <CardDescription>
                  Register your organisation to submit compliance documents.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 text-sm text-blue-700 dark:text-blue-300">
              <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <p>
                Your account is reviewed by an administrator before activation.
                You will be able to sign in once approved.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="company-name">Company name</Label>
                <Input
                  id="company-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Acme AI"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-email">Work email</Label>
                <Input
                  id="company-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="compliance@acme-ai.com"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-password">Password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="company-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Choose a password"
                    className="pl-9"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-wallet">
                  Wallet address{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="company-wallet"
                    value={wallet}
                    onChange={(e) => setWallet(e.target.value)}
                    placeholder="G… (leave blank for a custodial wallet)"
                    className="font-mono text-xs"
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-shrink-0 gap-2"
                    onClick={() => setWallet(fakeWallet())}
                    disabled={isSubmitting}
                  >
                    <Wallet className="h-4 w-4" />
                    Generate
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Submitting…" : "Submit registration"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              Already registered?{" "}
              <button
                type="button"
                className="font-medium text-primary hover:underline"
                onClick={() => navigate({ to: "/signin" })}
              >
                Sign in
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
