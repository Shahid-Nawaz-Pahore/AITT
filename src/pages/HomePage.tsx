import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle, MessageSquare, Shield, Upload } from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Upload,
      title: "Secure Upload",
      description:
        "Upload your PDF documents with automatic SHA-256 cryptographic hash generation",
      action: () => navigate({ to: "/library" }),
      buttonText: "Upload",
    },
    {
      icon: Shield,
      title: "AI Compliance",
      description:
        "Analyze your documents for EU or US compliance with automatic AI evaluation",
      action: () => navigate({ to: "/compliance" }),
      buttonText: "Dashboard",
    },
    {
      icon: CheckCircle,
      title: "Verification",
      description:
        "Verify the authenticity of any document by comparing its hash",
      action: () => navigate({ to: "/verification" }),
      buttonText: "Verify",
    },
    {
      icon: MessageSquare,
      title: "AI Assistant",
      description:
        "Ask questions about compliance and get personalized recommendations",
      action: () => navigate({ to: "/ai-assistant" }),
      buttonText: "Consult",
    },
  ];

  return (
    <div className="container py-8 space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="relative grid md:grid-cols-2 gap-8 p-8 md:p-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Shield className="h-4 w-4" />
              Secure Platform
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              AITT - AI Transparency Token, the future of transparent and
              ethical AI.
            </h1>
            <p className="text-lg text-muted-foreground">
              Upload your completed certification in PDF format to assess your
              AI compliance and evaluate its conformity.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                onClick={() => navigate({ to: "/library" })}
                className="gap-2"
              >
                <Upload className="h-5 w-5" />
                Get Started
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate({ to: "/compliance" })}
              >
                View Dashboard
              </Button>
            </div>
          </div>
          <div className="relative flex items-center justify-center">
            <img
              src="/assets/generated/homepage-colorful-swirl.dim_800x600.png"
              alt="AITT - AI Transparency Token platform"
              className="max-w-full h-auto w-full rounded-lg object-contain shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Key Features</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A complete suite of tools to manage, verify and certify your
            documents
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <CardTitle>{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={feature.action}
                    variant="outline"
                    className="w-full"
                  >
                    {feature.buttonText}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Stats Section */}
      <section className="rounded-xl bg-muted/30 p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: "Security", value: "100%" },
            { label: "Integrated Blockchain", value: "Enabled" },
            { label: "Compliance", value: "EU & US" },
            { label: "AI", value: "Integrated" },
          ].map((stat) => (
            <div key={stat.label} className="text-center space-y-1">
              <div className="text-2xl md:text-3xl font-bold text-primary">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
