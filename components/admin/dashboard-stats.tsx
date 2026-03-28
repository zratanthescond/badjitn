"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Server,
  HardDrive,
  Activity,
  Clock,
  Database,
  Cpu,
  MemoryStick,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import type { AdminClient, DashboardData } from "@/lib/admin-client";
import { useTranslations } from "next-intl";

interface DashboardStatsProps {
  adminClient: AdminClient;
}

export function DashboardStats({ adminClient }: DashboardStatsProps) {
  const t = useTranslations("serverDashboard");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchData = async () => {
    try {
      setError("");
      const dashboardData = await adminClient.getDashboard();
      setData(dashboardData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getHealthStatus = () => {
    if (!data) return { status: "unknown", color: "gray", label: t("status.unknown") };

    const successRate = Number.parseFloat(
      data.stats.requests.successRate.replace("%", "")
    );
    const hasErrors = data.stats.requests.errors > 0;

    if (successRate >= 95 && !hasErrors) {
      return { status: "healthy", color: "green", label: t("status.healthy") };
    } else if (successRate >= 90) {
      return { status: "warning", color: "yellow", label: t("status.warning") };
    } else {
      return { status: "critical", color: "red", label: t("status.critical") };
    }
  };

  const health = getHealthStatus();

  if (loading && !data) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span>{t("errorLoading", { error })}</span>
          </div>
          <Button onClick={fetchData} className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("retry")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header with refresh controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">{t("title")}</h2>
          <Badge
            variant={health.status === "healthy" ? "default" : "destructive"}
            className="flex items-center gap-1"
          >
            <CheckCircle className="h-3 w-3" />
            {health.label}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            {t("refresh")}
          </Button>
        </div>
      </div>

      {/* Main stats grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Server Info */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("cards.uptime.title")}</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.server.uptime.formatted}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("cards.uptime.started", {
                date: new Date(data.server.startTime).toLocaleDateString(),
              })}
            </p>
          </CardContent>
        </Card>

        {/* Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("cards.requests.title")}
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.stats.requests.total.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("cards.requests.successRate", {
                rate: data.stats.requests.successRate,
              })}
            </p>
          </CardContent>
        </Card>

        {/* Files Processed */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("cards.files.title")}
            </CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.stats.files.processed}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("cards.files.activeProcesses", {
                count: data.stats.files.activeProcesses,
              })}
            </p>
          </CardContent>
        </Card>

        {/* Active Processes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("cards.queue.title")}</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.stats.processes.queueLength}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("cards.queue.running", {
                count: data.stats.processes.runningProcesses,
              })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Memory and Disk Usage */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MemoryStick className="h-5 w-5" />
              {t("memory.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t("memory.rss")}</span>
                <span>{data.memory.rss}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{t("memory.heapTotal")}</span>
                <span>{data.memory.heapTotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{t("memory.heapUsed")}</span>
                <span>{data.memory.heapUsed}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{t("memory.external")}</span>
                <span>{data.memory.external}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              {t("disk.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t("disk.videos")}</span>
                <span>{data.disk.videos}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{t("disk.music")}</span>
                <span>{data.disk.music}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{t("disk.tempFiles")}</span>
                <span>{data.disk.temp}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold border-t pt-2">
                <span>{t("disk.total")}</span>
                <span>{data.disk.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Temp Files Info */}
      {data.stats.tempFiles.trackedFiles > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {t("tempFiles.title")}
            </CardTitle>
            <CardDescription>
              {t("tempFiles.tracked", {
                count: data.stats.tempFiles.trackedFiles,
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {t("tempFiles.lastCleanup")}{" "}
              {data.stats.lastCleanup
                ? new Date(data.stats.lastCleanup).toLocaleString()
                : t("tempFiles.never")}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
