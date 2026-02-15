"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Bot, Inbox, LayoutDashboard, Settings, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

const nav = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/inbox", label: "Inbox", icon: Inbox },
  { href: "/app/agents", label: "Agents", icon: Bot },
  { href: "/app/knowledge", label: "Knowledge", icon: BookOpen },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r border-border p-4">
        <p className="mb-6 text-lg font-semibold">AI WhatsApp Agents</p>
        <nav className="space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href as any}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
                  pathname === item.href ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-border p-4">
          <div className="flex w-full max-w-xl gap-3">
            <Input placeholder="Search conversations, docs, members..." />
          </div>
          <div className="flex items-center gap-3">
            <button className="rounded-md border border-border p-2"><Bell className="h-4 w-4" /></button>
            <span className="rounded-md bg-muted px-3 py-1 text-sm">Org: Default</span>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
