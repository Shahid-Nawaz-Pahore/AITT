import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle,
  FileText,
  Lock,
  Menu,
  MessageSquare,
  Shield,
} from "lucide-react";

export default function Header() {
  const navigate = useNavigate();
  const routerState = useRouterState();

  const currentPath = routerState.location.pathname;

  const navItems = [
    { path: "/", label: "Home", icon: FileText, visible: true },
    { path: "/library", label: "Library", icon: FileText, visible: true },
    { path: "/compliance", label: "Compliance", icon: Shield, visible: true },
    {
      path: "/verification",
      label: "Verification",
      icon: CheckCircle,
      visible: true,
    },
    {
      path: "/ai-assistant",
      label: "AI Act Assistant",
      icon: MessageSquare,
      visible: true,
    },
    {
      path: "/cybersecurity",
      label: "Cybersecurity Dashboard",
      icon: Lock,
      visible: false,
    },
    {
      path: "/cybersecurity-assistant",
      label: "Cybersecurity AI Assistant",
      icon: Lock,
      visible: false,
    },
    {
      path: "/ai-risk",
      label: "AI Risk & Bias Minimization Layer",
      icon: AlertTriangle,
      visible: false,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity -ml-2 font-bold text-lg text-foreground"
          >
            AITT
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.path}
                  variant={currentPath === item.path ? "default" : "ghost"}
                  size="sm"
                  onClick={() => navigate({ to: item.path })}
                  className={`gap-2 ${!item.visible ? "opacity-0 pointer-events-none" : ""}`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <DropdownMenuItem
                    key={item.path}
                    onClick={() => navigate({ to: item.path })}
                    className={`gap-2 ${!item.visible ? "opacity-0 pointer-events-none" : ""}`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
