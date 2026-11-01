"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Trash2, UserPlus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addTenantMember, removeTenantMember } from "@/lib/actions/tenant.actions";
import { searchUsers } from "@/lib/actions/user.actions";
import { TENANT_MEMBER_ROLES, type TenantMemberRole } from "@/constants/plans";

interface Member {
  role: TenantMemberRole;
  user: { _id: string; firstName?: string; lastName?: string; email?: string };
}

export default function TeamManager({
  tenantId,
  members,
  currentUserId,
  canManage,
}: {
  tenantId: string;
  members: Member[];
  currentUserId: string;
  canManage: boolean;
}) {
  const t = useTranslations("pro.team");
  const tr = useTranslations("pro.roles");
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [newRole, setNewRole] = useState<TenantMemberRole>("manager");

  const run = async (fn: () => Promise<unknown>, success?: string) => {
    try {
      await fn();
      if (success) toast({ title: success });
      startTransition(() => router.refresh());
    } catch (error: any) {
      toast({ title: t("error"), description: error?.message, variant: "destructive" });
    }
  };

  const doSearch = async (value: string) => {
    setQuery(value);
    setResults(value.trim().length >= 2 ? await searchUsers(value) : []);
  };

  const roleSelect = (value: TenantMemberRole, onChange: (v: TenantMemberRole) => void, className?: string) => (
    <Select value={value} onValueChange={(v) => onChange(v as TenantMemberRole)}>
      <SelectTrigger className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {TENANT_MEMBER_ROLES.map((r) => (
          <SelectItem key={r} value={r}>
            {tr(r)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <div className="space-y-4">
      <ul className="divide-y divide-border rounded-xl border border-border bg-card">
        {members.map((m) => (
          <li key={m.user._id} className="flex items-center justify-between gap-3 p-3 text-sm">
            <span className="min-w-0 truncate">
              <span className="font-medium text-foreground">
                {m.user.firstName} {m.user.lastName}
              </span>{" "}
              <span className="text-xs text-muted-foreground">{m.user.email}</span>
            </span>
            {canManage ? (
              <span className="flex items-center gap-1">
                {roleSelect(
                  m.role,
                  (v) => run(() => addTenantMember(tenantId, m.user._id, v)),
                  "h-8 w-32"
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={m.user._id === currentUserId}
                  aria-label={t("remove")}
                  onClick={() => run(() => removeTenantMember(tenantId, m.user._id), t("removed"))}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </span>
            ) : (
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{tr(m.role)}</span>
            )}
          </li>
        ))}
      </ul>

      {canManage ? (
        <div className="space-y-2 rounded-xl border border-border bg-card p-3">
          <p className="text-sm font-semibold text-foreground">{t("addTitle")}</p>
          <div className="flex gap-2">
            <Input value={query} onChange={(e) => doSearch(e.target.value)} placeholder={t("search")} />
            {roleSelect(newRole, setNewRole, "w-36")}
          </div>
          {results.map((u) => (
            <button
              key={u._id}
              type="button"
              className="flex w-full items-center justify-between rounded-lg border border-border p-2 text-left text-sm hover:bg-muted"
              onClick={() =>
                run(() => addTenantMember(tenantId, u._id, newRole), t("added")).then(() => {
                  setQuery("");
                  setResults([]);
                })
              }
            >
              <span>
                {u.firstName} {u.lastName} <span className="text-xs text-muted-foreground">{u.email}</span>
              </span>
              <UserPlus className="h-4 w-4" />
            </button>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">{t("ownerOnly")}</p>
      )}
    </div>
  );
}
