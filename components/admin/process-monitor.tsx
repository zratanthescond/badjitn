"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Cpu,
  RefreshCw,
  AlertTriangle,
  Play,
  Pause,
  Square,
  Activity,
  Clock,
  Zap,
} from "lucide-react";
import type { AdminClient, DashboardData } from "@/lib/admin-client";
import { useTranslations } from "next-intl";

interface ProcessMonitorProps {
  adminClient: AdminClient;
}

export function ProcessMonitor({ adminClient }: ProcessMonitorProps) {
  const t = useTranslations("processMonitor");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const dashboardData = await adminClient.getDashboard();
      setData(dashboardData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const killAllProcesses = async () => {
    setLoading(true);
    setError("");

    try {
      await adminClient.killAllProcesses();
      await fetchData(); // Refresh after killing processes
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

    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getProcessStatus = () => {
    if (!data) return "unknown";

    const { processes } = data.stats;
    if (processes.activeProcesses > 0) return "active";
    if (processes.queueLength > 0) return "queued";
    return "idle";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "queued":
        return "bg-yellow-500";
      case "idle":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const status = getProcessStatus();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("title")}</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? (
              <Pause className="mr-2 h-4 w-4" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            {autoRefresh ? t("pause") : t("resume")} {t("autoRefresh")}
          </Button>
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            {t("refresh")}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {data && (
        <>
          {/* Process Overview */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("cards.status.title")}
                </CardTitle>
                <div
                  className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{t(`status.${status}`)}</div>
                <p className="text-xs text-muted-foreground">
                  {t("cards.status.activeProcesses", {
                    count: data.stats.processes.activeProcesses,
                  })}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("cards.queue.title")}
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
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

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("cards.files.title")}
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.stats.files.processed}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("cards.files.description")}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Active Processes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                {t("activeProcesses.title")}
              </CardTitle>
              <CardDescription>
                {t("activeProcesses.description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.stats.processes.processIds.length > 0 ? (
                <div className="space-y-2">
                  {data.stats.processes.processIds.map((processId, index) => (
                    <div
                      key={processId}
                      className="flex items-center justify-between p-3 border rounded"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <div>
                          <div className="font-medium">{processId}</div>
                          <div className="text-sm text-gray-500">
                            {t("activeProcesses.ffmpegProcess")}
                          </div>
                        </div>
                      </div>
                      <Badge variant="default">{t("status.running")}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Cpu className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t("activeProcesses.none")}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Process Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                {t("controls.title")}
              </CardTitle>
              <CardDescription>{t("controls.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Button
                  onClick={killAllProcesses}
                  disabled={
                    loading || data.stats.processes.activeProcesses === 0
                  }
                  variant="destructive"
                >
                  <Square className="mr-2 h-4 w-4" />
                  {t("controls.killAll")}
                </Button>
                <div className="text-sm text-gray-500">
                  {data.stats.processes.activeProcesses === 0
                    ? t("controls.noProcesses")
                    : t("controls.terminateCount", {
                        count: data.stats.processes.activeProcesses,
                      })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Process Queue Visualization */}
          {data.stats.processes.queueLength > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t("queue.title")}</CardTitle>
                <CardDescription>
                  {t("queue.description", {
                    count: data.stats.processes.queueLength,
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t("queue.progress")}</span>
                    <span>
                      {t("queue.slotsUsed", {
                        count: data.stats.processes.runningProcesses,
                      })}
                    </span>
                  </div>
                  <Progress
                    value={(data.stats.processes.runningProcesses / 3) * 100}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500">
                    {t("queue.maxConcurrent")}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
