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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  RefreshCw,
  AlertTriangle,
  Search,
  Filter,
  Download,
} from "lucide-react";
import type { AdminClient } from "@/lib/admin-client";
import { useTranslations } from "next-intl";

interface ServerLogsProps {
  adminClient: AdminClient;
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  meta: Record<string, any>;
  pid: number;
}

interface LogsResponse {
  logs: LogEntry[];
  totalLogs: number;
  levels: string[];
  currentStats: {
    processQueue: any;
    tempFiles: any;
    serverStats: any;
  };
}

export function ServerLogs({ adminClient }: ServerLogsProps) {
  const t = useTranslations("serverLogs");
  const [logsData, setLogsData] = useState<LogsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [maxLines, setMaxLines] = useState(100);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        lines: maxLines.toString(),
        ...(selectedLevel !== "all" && { level: selectedLevel }),
        ...(searchTerm && { search: searchTerm }),
      });
      const serverUrl = `${process.env.NEXT_PUBLIC_FILE_SERVER_URL}/admin/logs?${params}`;
      const correctUrl = serverUrl.replace(/([^:]\/)\/+/g, "$1");
      const response = await fetch(correctUrl.toString(), {
        headers: {
          "X-Admin-Key": adminClient["apiKey"],
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setLogsData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportLogs = async (format: "json" | "csv" | "txt") => {
    try {
      const params = new URLSearchParams({
        lines: maxLines.toString(),
        format,
        ...(selectedLevel !== "all" && { level: selectedLevel }),
        ...(searchTerm && { search: searchTerm }),
      });
      const serverUrl = `${process.env.NEXT_PUBLIC_FILE_SERVER_URL}/admin/logs/export?${params}`;
      const correctUrl = serverUrl.replace(/([^:]\/)\/+/g, "$1");
      const response = await fetch(correctUrl.toString(), {
        headers: {
          "X-Admin-Key": adminClient["apiKey"],
        },
      });

      if (!response.ok) {
        throw new Error(t("errors.exportFailedStatus", { status: response.statusText }));
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `server-logs-${
        new Date().toISOString().split("T")[0]
      }.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(t("errors.exportFailed", { error: err.message }));
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [maxLines, selectedLevel, searchTerm]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchLogs, 5000); // Refresh every 5 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, maxLines, selectedLevel, searchTerm]);

  const formatLogLevel = (level: string) => {
    const colors = {
      ERROR: "destructive",
      WARN: "secondary",
      INFO: "default",
      DEBUG: "outline",
    } as const;
    return colors[level as keyof typeof colors] || "default";
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatMeta = (meta: Record<string, any>) => {
    if (!meta || Object.keys(meta).length === 0) return null;
    return JSON.stringify(meta, null, 2);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("title")}</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? "bg-green-50 border-green-200" : ""}
          >
            {autoRefresh ? t("autoRefreshOn") : t("autoRefreshOff")}
          </Button>
          <Button variant="outline" onClick={fetchLogs} disabled={loading}>
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

      {/* Log Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t("controls.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max-lines">{t("controls.maxLines")}</Label>
              <Input
                id="max-lines"
                type="number"
                value={maxLines}
                onChange={(e) =>
                  setMaxLines(Number.parseInt(e.target.value) || 100)
                }
                min="10"
                max="1000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="log-level">{t("controls.logLevel")}</Label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger>
                  <SelectValue placeholder={t("controls.allLevels")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("controls.allLevels")}</SelectItem>
                  {logsData?.levels.map((level) => (
                    <SelectItem key={level} value={level.toLowerCase()}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="search-logs">{t("controls.searchLogs")}</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-logs"
                  placeholder={t("controls.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("controls.exportLogs")}</Label>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportLogs("json")}
                  className="flex-1"
                >
                  <Download className="h-3 w-3 mr-1" />
                  JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportLogs("csv")}
                  className="flex-1"
                >
                  <Download className="h-3 w-3 mr-1" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportLogs("txt")}
                  className="flex-1"
                >
                  <Download className="h-3 w-3 mr-1" />
                  TXT
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Log Statistics */}
      {logsData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t("statistics.title")}
            </CardTitle>
            <CardDescription>
              {t("statistics.description", {
                shown: logsData.logs.length,
                total: logsData.totalLogs,
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">{t("statistics.processQueue")}</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>{t("statistics.queueLength")}</span>
                    <Badge variant="secondary">
                      {logsData.currentStats?.processQueue?.queueLength || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("statistics.running")}</span>
                    <Badge variant="default">
                      {logsData.currentStats?.processQueue?.runningProcesses ||
                        0}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("statistics.active")}</span>
                    <Badge variant="default">
                      {logsData.currentStats?.processQueue?.activeProcesses ||
                        0}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">{t("statistics.tempFiles")}</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>{t("statistics.tracked")}</span>
                    <Badge variant="secondary">
                      {logsData.currentStats?.tempFiles?.trackedFiles || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("statistics.oldest")}</span>
                    <span className="text-xs">
                      {logsData.currentStats?.tempFiles?.oldestFile
                        ? new Date(
                            logsData.currentStats.tempFiles.oldestFile
                          ).toLocaleString()
                        : t("statistics.none")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">{t("statistics.serverStats")}</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>{t("statistics.requests")}</span>
                    <Badge variant="secondary">
                      {logsData.currentStats?.serverStats?.requestCount || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("statistics.errors")}</span>
                    <Badge
                      variant={
                        logsData.currentStats?.serverStats?.errorCount > 0
                          ? "destructive"
                          : "default"
                      }
                    >
                      {logsData.currentStats?.serverStats?.errorCount || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("statistics.processed")}</span>
                    <Badge variant="default">
                      {logsData.currentStats?.serverStats?.processedFiles || 0}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Log Entries */}
      {logsData && logsData.logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("entries.title")}</CardTitle>
            <CardDescription>
              {t("entries.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {logsData.logs.map((log, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={formatLogLevel(log.level)}>
                        {log.level}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatTimestamp(log.timestamp)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        PID: {log.pid}
                      </span>
                    </div>
                  </div>

                  <div className="text-sm font-medium">{log.message}</div>

                  {formatMeta(log.meta) && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        {t("entries.showMetadata")}
                      </summary>
                      <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                        {formatMeta(log.meta)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {logsData && logsData.logs.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t("empty.title")}</h3>
            <p className="text-muted-foreground">
              {t("empty.description")}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
