import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  Award,
  Building2,
  CheckCircle,
  ChevronDown,
  ClipboardCheck,
  ClipboardList,
  Eye,
  FileDown,
  FileText,
  Home,
  LayoutDashboard,
  Layers,
  Menu,
  MessageSquare,
  ScrollText,
  Scale,
  Shield,
  Upload,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo } from "react";
import { roleHome, roleLabel, useRole } from "../context/RoleContext";
import type { Role } from "../mock/types";

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  public: [
    { path: "/", label: "Home", icon: Home },
    { path: "/library", label: "Library", icon: FileText },
    { path: "/compliance", label: "Compliance", icon: Shield },
    { path: "/verification", label: "Verification", icon: CheckCircle },
    { path: "/ai-assistant", label: "AI Act Assistant", icon: MessageSquare },
    { path: "/registry", label: "Registry", icon: ScrollText },
  ],
  company: [
    { path: "/company", label: "Dashboard", icon: LayoutDashboard },
    { path: "/company/submit", label: "Submit", icon: Upload },
    { path: "/company/documents", label: "My Documents", icon: FileText },
    { path: "/company/templates", label: "Templates", icon: FileDown },
    { path: "/registry", label: "Registry", icon: ScrollText },
  ],
  sub_admin: [
    { path: "/expert", label: "Review Queue", icon: ClipboardList },
    { path: "/expert/history", label: "My Reviews", icon: ClipboardCheck },
  ],
  admin: [
    { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/documents", label: "Documents", icon: FileText },
    { path: "/admin/companies", label: "Companies", icon: Building2 },
    { path: "/admin/experts", label: "Sub-Admins", icon: Users },
    { path: "/admin/certificates", label: "Certificates", icon: Award },
    { path: "/admin/frameworks", label: "Frameworks & Templates", icon: Layers },
    { path: "/admin/governance", label: "Governance", icon: Scale },
    { path: "/admin/monitoring", label: "Monitoring", icon: Activity },
  ],
};

const ROLES: Role[] = ["public", "company", "sub_admin", "admin"];

export default function Header() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const { role, setRole } = useRole();

  const currentPath = routerState.location.pathname;
  const navItems = NAV_BY_ROLE[role];

  // Active = the nav item whose path is the longest prefix of the current path.
  const activePath = useMemo(() => {
    const matches = navItems
      .filter(
        (i) => currentPath === i.path || currentPath.startsWith(`${i.path}/`),
      )
      .sort((a, b) => b.path.length - a.path.length);
    return matches[0]?.path;
  }, [navItems, currentPath]);

  const handleRoleChange = (next: Role) => {
    setRole(next);
    navigate({ to: roleHome[next] });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-6">
          <button
            type="button"
            onClick={() => navigate({ to: roleHome[role] })}
            className="-ml-2 flex flex-shrink-0 items-center gap-2 text-lg font-bold text-foreground transition-opacity hover:opacity-80"
          >
            AITT
          </button>

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.path}
                  variant={item.path === activePath ? "default" : "ghost"}
                  size="sm"
                  onClick={() => navigate({ to: item.path })}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          {/* Demo "View as" role switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">View as:</span>
                <span className="font-medium">{roleLabel[role]}</span>
                <ChevronDown className="h-4 w-4 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Preview as role</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {ROLES.map((r) => (
                <DropdownMenuCheckboxItem
                  key={r}
                  checked={role === r}
                  onCheckedChange={() => handleRoleChange(r)}
                >
                  {roleLabel[r]}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile / medium nav */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="lg:hidden">
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <DropdownMenuItem
                    key={item.path}
                    onClick={() => navigate({ to: item.path })}
                    className="gap-2"
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
