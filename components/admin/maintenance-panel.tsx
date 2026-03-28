"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Trash2,
  AlertTriangle,
  CheckCircle,
  HardDrive,
  Database,
  Zap,
} from "lucide-react";
import type { AdminClient } from "@/lib/admin-client";
import { useTranslations } from "next-intl";

interface MaintenancePanelProps {
  adminClient: AdminClient;
}

export function MaintenancePanel({ adminClient }: MaintenancePanelProps) {
  const t = useTranslations("maintenancePanel");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cleanupOptions, setCleanupOptions] = useState({
    orphanedFiles: true,
    tempFiles: true,
    dryRun: true,
    maxFileSize: "",
    forceTemp: false,
  });

  const performMaintenance = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const results = [];

      if (cleanupOptions.orphanedFiles) {
        const maxSize = cleanupOptions.maxFileSize
          ? Number.parseInt(cleanupOptions.maxFileSize) * 1024 * 1024
          : undefined;
        const orphanedResult = await adminClient.cleanupFiles(
          cleanupOptions.dryRun,
          maxSize
        );
        results.push(
          t("results.orphanedFiles", {
            count: orphanedResult.summary.totalDeleted,
            suffix: cleanupOptions.dryRun ? t("results.wouldBeDeleted") : t("results.deleted"),
          })
        );
      }

      if (cleanupOptions.tempFiles) {
        const tempResult = await adminClient.cleanupTempFiles(
          cleanupOptions.forceTemp
        );
        results.push(
          t("results.tempFiles", {
            count: tempResult.summary.totalDeleted,
          })
        );
      }

      setSuccess(`${t("results.completed")}:\n${results.join("\n")}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const killAllProcesses = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await adminClient.killAllProcesses();
      setSuccess(
        t("results.killedProcesses", {
          count: result.killedProcesses.length,
        })
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("title")}</h2>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="whitespace-pre-line">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* File Cleanup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            {t("cleanup.title")}
          </CardTitle>
          <CardDescription>
            {t("cleanup.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="orphaned-files">{t("cleanup.orphanedFiles.label")}</Label>
                <div className="text-sm text-muted-foreground">
                  {t("cleanup.orphanedFiles.description")}
                </div>
              </div>
              <Switch
                id="orphaned-files"
                checked={cleanupOptions.orphanedFiles}
                onCheckedChange={(checked) =>
                  setCleanupOptions((prev) => ({
                    ...prev,
                    orphanedFiles: checked,
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="temp-files">{t("cleanup.tempFiles.label")}</Label>
                <div className="text-sm text-muted-foreground">
                  {t("cleanup.tempFiles.description")}
                </div>
              </div>
              <Switch
                id="temp-files"
                checked={cleanupOptions.tempFiles}
                onCheckedChange={(checked) =>
                  setCleanupOptions((prev) => ({ ...prev, tempFiles: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dry-run">{t("cleanup.dryRun.label")}</Label>
                <div className="text-sm text-muted-foreground">
                  {t("cleanup.dryRun.description")}
                </div>
              </div>
              <Switch
                id="dry-run"
                checked={cleanupOptions.dryRun}
                onCheckedChange={(checked) =>
                  setCleanupOptions((prev) => ({ ...prev, dryRun: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="force-temp">{t("cleanup.forceTemp.label")}</Label>
                <div className="text-sm text-muted-foreground">
                  {t("cleanup.forceTemp.description")}
                </div>
              </div>
              <Switch
                id="force-temp"
                checked={cleanupOptions.forceTemp}
                onCheckedChange={(checked) =>
                  setCleanupOptions((prev) => ({ ...prev, forceTemp: checked }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-file-size">{t("cleanup.maxFileSize.label")}</Label>
              <Input
                id="max-file-size"
                type="number"
                placeholder={t("cleanup.maxFileSize.placeholder")}
                value={cleanupOptions.maxFileSize}
                onChange={(e) =>
                  setCleanupOptions((prev) => ({
                    ...prev,
                    maxFileSize: e.target.value,
                  }))
                }
              />
              <div className="text-sm text-muted-foreground">
                {t("cleanup.maxFileSize.description")}
              </div>
            </div>
          </div>

          <Button
            onClick={performMaintenance}
            disabled={
              loading ||
              (!cleanupOptions.orphanedFiles && !cleanupOptions.tempFiles)
            }
            className="w-full"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {loading
              ? t("cleanup.running")
              : cleanupOptions.dryRun
              ? t("cleanup.preview")
              : t("cleanup.run")}
          </Button>
        </CardContent>
      </Card>

      {/* Process Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            {t("processes.title")}
          </CardTitle>
          <CardDescription>{t("processes.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {t("processes.warning")}
              </AlertDescription>
            </Alert>

            <Button
              onClick={killAllProcesses}
              disabled={loading}
              variant="destructive"
              className="w-full"
            >
              <Zap className="mr-2 h-4 w-4" />
              {loading ? t("processes.killing") : t("processes.killAll")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            {t("system.title")}
          </CardTitle>
          <CardDescription>
            {t("system.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>{t("system.recommendedCleanupFrequency")}</span>
              <span>{t("system.daily")}</span>
            </div>
            <div className="flex justify-between">
              <span>{t("system.tempFileRetention")}</span>
              <span>{t("system.oneHour")}</span>
            </div>
            <div className="flex justify-between">
              <span>{t("system.maxConcurrentProcesses")}</span>
              <span>3</span>
            </div>
            <div className="flex justify-between">
              <span>{t("system.processTimeout")}</span>
              <span>{t("system.fiveMinutes")}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
