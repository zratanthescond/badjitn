"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Briefcase, Building2, Loader2, Plus, Trash2, UserPlus, X } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { toast } from "@/hooks/use-toast";
import DataTable from "@/components/shared/data-table";
import MobileCard from "@/components/shared/mobile-card";
import TableSkeleton from "@/components/shared/table-skeleton";
import { CardSkeleton } from "./CardSkeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  adminAttachOrganisation,
  adminCreateTenant,
  adminDeleteTenant,
  adminDetachOrganisation,
  adminGetAllTenants,
  adminGetTenantById,
  adminUpdateTenant,
  addTenantMember,
  removeTenantMember,
} from "@/lib/actions/tenant.actions";
import { adminGetAllOrganisations } from "@/lib/actions/organisation.actions";
import { searchUsers } from "@/lib/actions/user.actions";
import {
  PLAN_DEFAULTS,
  TENANT_PLANS,
  TENANT_MEMBER_ROLES,
  TENANT_SUBSCRIPTION_STATUSES,
} from "@/constants/plans";

const STATUS_STYLES: Record<string, string> = {
  trial: "border-sky-500/30 bg-sky-500/20 text-sky-700 dark:text-sky-300",
  active: "border-emerald-500/30 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
  suspended: "border-amber-500/30 bg-amber-500/20 text-amber-700 dark:text-amber-300",
  expired: "border-red-500/30 bg-red-500/20 text-red-700 dark:text-red-300",
};

const toDateInput = (value?: string) => (value ? new Date(value).toISOString().slice(0, 10) : "");

export default function TenantsAdministration() {
  const t = useTranslations("tenantsAdministration");
  const isMobile = useMediaQuery("(max-width: 768px)");
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [managedId, setManagedId] = useState<string | null>(null);

  const { isLoading, data } = useQuery({
    queryKey: ["admin-tenants"],
    queryFn: () => adminGetAllTenants(),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-tenants"] });

  const statusBadge = (status: string) => (
    <Badge className={STATUS_STYLES[status] || ""}>{t(`status.${status}`)}</Badge>
  );

  const columns = [
    {
      header: t("table.client"),
      accessor: "root",
      cell: (row: any) => (
        <div>
          <p className="font-medium">{row.name}</p>
          <p className="text-xs text-muted-foreground">{row.slug}.pro.badgi.net</p>
        </div>
      ),
    },
    {
      header: t("table.plan"),
      accessor: "plan",
      cell: (value: string) => <span className="text-sm capitalize">{value}</span>,
    },
    {
      header: t("table.organisations"),
      accessor: "root",
      cell: (row: any) => (
        <span className="text-sm">
          {row.organisationCount} / {row.limits?.maxOrganisations}
        </span>
      ),
    },
    {
      header: t("table.members"),
      accessor: "members",
      cell: (value: any[]) => <span className="text-sm">{value?.length || 0}</span>,
    },
    {
      header: t("table.status"),
      accessor: "root",
      cell: (row: any) => statusBadge(row.subscription?.status),
    },
    {
      header: t("table.actions"),
      accessor: "root",
      align: "right" as const,
      cell: (row: any) => (
        <Button size="sm" variant="outline" className="rounded-full" onClick={() => setManagedId(row._id)}>
          {t("actions.manage")}
        </Button>
      ),
    },
  ];

  const renderMobileCard = (item: any) => (
    <MobileCard
      key={item._id}
      title={item.name}
      subtitle={`${item.slug}.pro.badgi.net`}
      badge={t(`status.${item.subscription?.status}`)}
      details={[
        { label: t("table.plan"), value: item.plan },
        { label: t("table.organisations"), value: `${item.organisationCount} / ${item.limits?.maxOrganisations}` },
        { label: t("table.members"), value: String(item.members?.length || 0) },
      ]}
      footer={
        <Button size="sm" variant="outline" className="rounded-full" onClick={() => setManagedId(item._id)}>
          {t("actions.manage")}
        </Button>
      }
    />
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold sm:text-xl">
            <Briefcase className="h-5 w-5 text-indigo-500" />
            {t("title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <Button className="rounded-full" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          {t("actions.create")}
        </Button>
      </div>

      {isMobile ? (
        isLoading ? (
          <div className="flex flex-col space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">{data?.map(renderMobileCard)}</div>
        )
      ) : isLoading ? (
        <TableSkeleton />
      ) : (
        <DataTable columns={columns} data={data || []} />
      )}

      <CreateTenantDialog open={createOpen} onOpenChange={setCreateOpen} onDone={refresh} />
      {managedId && (
        <ManageTenantDialog
          tenantId={managedId}
          onClose={() => setManagedId(null)}
          onChanged={refresh}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------
function CreateTenantDialog({
  open,
  onOpenChange,
  onDone,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDone: () => void;
}) {
  const t = useTranslations("tenantsAdministration");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [plan, setPlan] = useState<(typeof TENANT_PLANS)[number]>("starter");
  const [contactEmail, setContactEmail] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await adminCreateTenant({
        name,
        slug: slug || undefined,
        plan,
        limits: PLAN_DEFAULTS[plan],
        contact: { email: contactEmail || undefined },
      });
      toast({ title: t("toast.created") });
      setName("");
      setSlug("");
      setContactEmail("");
      onOpenChange(false);
      onDone();
    } catch (error: any) {
      toast({ title: t("toast.error"), description: error?.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>{t("create.title")}</DialogTitle>
          <DialogDescription>{t("create.description")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>{t("fields.name")}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Pharma X" />
          </div>
          <div className="space-y-1">
            <Label>{t("fields.subdomain")}</Label>
            <div className="flex items-center gap-2">
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="pharmax" />
              <span className="whitespace-nowrap text-xs text-muted-foreground">.pro.badgi.net</span>
            </div>
            <p className="text-xs text-muted-foreground">{t("fields.subdomainHint")}</p>
          </div>
          <div className="space-y-1">
            <Label>{t("fields.plan")}</Label>
            <Select value={plan} onValueChange={(v) => setPlan(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TENANT_PLANS.map((p) => (
                  <SelectItem key={p} value={p} className="capitalize">
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>{t("fields.contactEmail")}</Label>
            <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
          </div>
          <Button className="w-full rounded-full" onClick={submit} disabled={saving || !name.trim()}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("actions.create")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Manage: settings, organisations, members
// ---------------------------------------------------------------------------
function ManageTenantDialog({
  tenantId,
  onClose,
  onChanged,
}: {
  tenantId: string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const t = useTranslations("tenantsAdministration");
  const queryClient = useQueryClient();
  const detailKey = ["admin-tenant", tenantId];

  const { data: tenant, isLoading } = useQuery({
    queryKey: detailKey,
    queryFn: () => adminGetTenantById(tenantId),
  });
  const { data: allOrgs } = useQuery({
    queryKey: ["admin-organisations"],
    queryFn: () => adminGetAllOrganisations(),
  });

  const reload = () => {
    queryClient.invalidateQueries({ queryKey: detailKey });
    queryClient.invalidateQueries({ queryKey: ["admin-organisations"] });
    onChanged();
  };

  const run = async (fn: () => Promise<unknown>, successTitle?: string) => {
    try {
      await fn();
      if (successTitle) toast({ title: successTitle });
      reload();
    } catch (error: any) {
      toast({ title: t("toast.error"), description: error?.message, variant: "destructive" });
    }
  };

  const [orgToAttach, setOrgToAttach] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [newRole, setNewRole] = useState<(typeof TENANT_MEMBER_ROLES)[number]>("manager");

  const [form, setForm] = useState<any>(null);
  if (tenant && !form) {
    setForm({
      plan: tenant.plan,
      status: tenant.subscription?.status,
      endsAt: toDateInput(tenant.subscription?.endsAt),
      maxOrganisations: tenant.limits?.maxOrganisations,
      maxEventsPerYear: tenant.limits?.maxEventsPerYear,
    });
  }

  const unattached = (allOrgs || []).filter((o: any) => !o.tenant);

  const saveSettings = () =>
    run(
      () =>
        adminUpdateTenant(tenantId, {
          plan: form.plan,
          limits: {
            maxOrganisations: Number(form.maxOrganisations),
            maxEventsPerYear: Number(form.maxEventsPerYear),
            maxOrdersPerEvent: tenant.limits?.maxOrdersPerEvent,
          },
          subscription: {
            ...tenant.subscription,
            status: form.status,
            endsAt: form.endsAt || undefined,
          },
        }),
      t("toast.saved")
    );

  const doSearch = async (value: string) => {
    setQuery(value);
    setResults(value.trim().length >= 2 ? await searchUsers(value) : []);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle>{tenant?.name ?? t("title")}</DialogTitle>
          <DialogDescription>{tenant ? `${tenant.slug}.pro.badgi.net` : ""}</DialogDescription>
        </DialogHeader>

        {isLoading || !tenant || !form ? (
          <Loader2 className="mx-auto h-6 w-6 animate-spin" />
        ) : (
          <div className="space-y-6">
            {/* Settings */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold">{t("manage.settings")}</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>{t("fields.plan")}</Label>
                  <Select
                    value={form.plan}
                    onValueChange={(v) =>
                      setForm({ ...form, plan: v, ...PLAN_DEFAULTS[v as keyof typeof PLAN_DEFAULTS] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TENANT_PLANS.map((p) => (
                        <SelectItem key={p} value={p} className="capitalize">
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>{t("fields.status")}</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TENANT_SUBSCRIPTION_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {t(`status.${s}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>{t("fields.maxOrganisations")}</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.maxOrganisations}
                    onChange={(e) => setForm({ ...form, maxOrganisations: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>{t("fields.maxEventsPerYear")}</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.maxEventsPerYear}
                    onChange={(e) => setForm({ ...form, maxEventsPerYear: e.target.value })}
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label>{t("fields.endsAt")}</Label>
                  <Input type="date" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} />
                </div>
              </div>
              <Button className="rounded-full" onClick={saveSettings}>
                {t("actions.save")}
              </Button>
            </section>

            {/* Organisations */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold">
                {t("manage.organisations")} ({tenant.organisations.length} / {tenant.limits.maxOrganisations})
              </h3>
              <ul className="space-y-2">
                {tenant.organisations.map((org: any) => (
                  <li key={org._id} className="flex items-center justify-between rounded-xl border p-2 text-sm">
                    <span className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      {org.name}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => run(() => adminDetachOrganisation(tenantId, org._id))}
                      aria-label={t("actions.detach")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
                {tenant.organisations.length === 0 && (
                  <li className="text-sm text-muted-foreground">{t("manage.noOrganisations")}</li>
                )}
              </ul>
              <div className="flex gap-2">
                <Select value={orgToAttach} onValueChange={setOrgToAttach}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("manage.selectOrganisation")} />
                  </SelectTrigger>
                  <SelectContent>
                    {unattached.map((o: any) => (
                      <SelectItem key={o._id} value={o._id}>
                        {o.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  className="rounded-full"
                  disabled={!orgToAttach}
                  onClick={() =>
                    run(() => adminAttachOrganisation(tenantId, orgToAttach), t("toast.attached")).then(() =>
                      setOrgToAttach("")
                    )
                  }
                >
                  {t("actions.attach")}
                </Button>
              </div>
            </section>

            {/* Members */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold">
                {t("manage.members")} ({tenant.members.length})
              </h3>
              <ul className="space-y-2">
                {tenant.members.map((m: any) => (
                  <li key={m.user?._id} className="flex items-center justify-between gap-2 rounded-xl border p-2 text-sm">
                    <span className="min-w-0 truncate">
                      {m.user?.firstName} {m.user?.lastName}{" "}
                      <span className="text-xs text-muted-foreground">{m.user?.email}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Select
                        value={m.role}
                        onValueChange={(v) => run(() => addTenantMember(tenantId, m.user._id, v as any))}
                      >
                        <SelectTrigger className="h-8 w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TENANT_MEMBER_ROLES.map((r) => (
                            <SelectItem key={r} value={r}>
                              {t(`roles.${r}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => run(() => removeTenantMember(tenantId, m.user._id))}
                        aria-label={t("actions.remove")}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </span>
                  </li>
                ))}
              </ul>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input value={query} onChange={(e) => doSearch(e.target.value)} placeholder={t("manage.searchUser")} />
                  <Select value={newRole} onValueChange={(v) => setNewRole(v as any)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TENANT_MEMBER_ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {t(`roles.${r}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {results.map((u) => (
                  <button
                    key={u._id}
                    type="button"
                    className="flex w-full items-center justify-between rounded-xl border p-2 text-left text-sm hover:bg-muted"
                    onClick={() =>
                      run(() => addTenantMember(tenantId, u._id, newRole), t("toast.memberAdded")).then(() => {
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
            </section>

            {/* Danger zone */}
            <section className="border-t pt-4">
              <Button
                variant="outline"
                className="rounded-full border-red-200 text-red-500 hover:bg-red-50"
                onClick={() => {
                  if (!confirm(t("manage.confirmDelete", { name: tenant.name }))) return;
                  run(() => adminDeleteTenant(tenantId), t("toast.deleted")).then(onClose);
                }}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                {t("actions.delete")}
              </Button>
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
