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

interface MaintenancePanelProps {
  adminClient: AdminClient;
}

export function MaintenancePanel({ adminClient }: MaintenancePanelProps) {
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
          `Orphaned files: ${orphanedResult.summary.totalDeleted} ${
            cleanupOptions.dryRun ? "would be" : ""
          } deleted`
        );
      }

      if (cleanupOptions.tempFiles) {
        const tempResult = await adminClient.cleanupTempFiles(
          cleanupOptions.forceTemp
        );
        results.push(`Temp files: ${tempResult.summary.totalDeleted} deleted`);
      }

      setSuccess(`Maintenance completed:\n${results.join("\n")}`);
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
      setSuccess(`Killed ${result.killedProcesses.length} processes`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Maintenance Panel</h2>
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
            File Cleanup
          </CardTitle>
          <CardDescription>
            Clean up orphaned and temporary files to free disk space
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="orphaned-files">Clean orphaned files</Label>
                <div className="text-sm text-muted-foreground">
                  Remove files that don't exist in the database
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
                <Label htmlFor="temp-files">Clean temporary files</Label>
                <div className="text-sm text-muted-foreground">
                  Remove old temporary processing files
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
                <Label htmlFor="dry-run">Dry run mode</Label>
                <div className="text-sm text-muted-foreground">
                  Preview changes without actually deleting files
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
                <Label htmlFor="force-temp">Force temp cleanup</Label>
                <div className="text-sm text-muted-foreground">
                  Remove all temp files regardless of age
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
              <Label htmlFor="max-file-size">Max file size (MB)</Label>
              <Input
                id="max-file-size"
                type="number"
                placeholder="Leave empty for no limit"
                value={cleanupOptions.maxFileSize}
                onChange={(e) =>
                  setCleanupOptions((prev) => ({
                    ...prev,
                    maxFileSize: e.target.value,
                  }))
                }
              />
              <div className="text-sm text-muted-foreground">
                Only delete files smaller than this size
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
              ? "Running Maintenance..."
              : cleanupOptions.dryRun
              ? "Preview Cleanup"
              : "Run Cleanup"}
          </Button>
        </CardContent>
      </Card>

      {/* Process Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Process Management
          </CardTitle>
          <CardDescription>Manage running FFmpeg processes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This will forcefully terminate all active FFmpeg processes. Use
                with caution.
              </AlertDescription>
            </Alert>

            <Button
              onClick={killAllProcesses}
              disabled={loading}
              variant="destructive"
              className="w-full"
            >
              <Zap className="mr-2 h-4 w-4" />
              {loading ? "Killing Processes..." : "Kill All Processes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            System Information
          </CardTitle>
          <CardDescription>
            Current system status and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Recommended cleanup frequency:</span>
              <span>Daily</span>
            </div>
            <div className="flex justify-between">
              <span>Temp file retention:</span>
              <span>1 hour</span>
            </div>
            <div className="flex justify-between">
              <span>Max concurrent processes:</span>
              <span>3</span>
            </div>
            <div className="flex justify-between">
              <span>Process timeout:</span>
              <span>5 minutes</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
