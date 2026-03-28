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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Server,
  Activity,
  FileText,
  RefreshCw,
  AlertTriangle,
  Cpu,
  FolderOpen,
  Settings,
} from "lucide-react";
import { AdminClient } from "@/lib/admin-client";
import { DashboardStats } from "@/components/admin/dashboard-stats";
import { FileManager } from "@/components/admin/file-manager";
import { ProcessMonitor } from "@/components/admin/process-monitor";
import { ServerLogs } from "@/components/admin/server-logs";
import { MaintenancePanel } from "@/components/admin/maintenance-panel";
import { useTranslations } from "next-intl";

export default function AdminDashboard() {
  const t = useTranslations("serverAdmin");
  const [adminClient, setAdminClient] = useState<AdminClient | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAuth = async () => {
    if (!apiKey.trim()) {
      setError(t("errors.apiKeyRequired"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const client = new AdminClient(
        process.env.NEXT_PUBLIC_FILE_SERVER_URL,
        apiKey
      );
      await client.getDashboard(); // Test the connection

      setAdminClient(client);
      setIsAuthenticated(true);
      localStorage.setItem("admin_api_key", apiKey);
    } catch (err: any) {
      setError(err.message || t("errors.authenticationFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedKey = localStorage.getItem("admin_api_key");
    if (savedKey) {
      setApiKey(savedKey);
      // Auto-authenticate with saved key
      const client = new AdminClient(
        process.env.NEXT_PUBLIC_FILE_SERVER_URL,
        savedKey
      );
      client
        .getDashboard()
        .then(() => {
          setAdminClient(client);
          setIsAuthenticated(true);
        })
        .catch(() => {
          localStorage.removeItem("admin_api_key");
        });
    }
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminClient(null);
    setApiKey("");
    localStorage.removeItem("admin_api_key");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-cente">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Settings className="h-6 w-6" />
              {t("auth.title")}
            </CardTitle>
            <CardDescription>
              {t("auth.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">{t("auth.apiKeyLabel")}</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder={t("auth.apiKeyPlaceholder")}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAuth()}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleAuth}
              disabled={loading || !apiKey.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  {t("auth.authenticating")}
                </>
              ) : (
                t("auth.submit")
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="border-b  shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="h-6 w-6" />
              <h1 className="text-2xl font-bold">{t("header.title")}</h1>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              {t("header.logout")}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              {t("tabs.dashboard")}
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              {t("tabs.files")}
            </TabsTrigger>
            <TabsTrigger value="processes" className="flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              {t("tabs.processes")}
            </TabsTrigger>
            <TabsTrigger
              value="maintenance"
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              {t("tabs.maintenance")}
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {t("tabs.logs")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardStats adminClient={adminClient!} />
          </TabsContent>

          <TabsContent value="files">
            <FileManager adminClient={adminClient!} />
          </TabsContent>

          <TabsContent value="processes">
            <ProcessMonitor adminClient={adminClient!} />
          </TabsContent>

          <TabsContent value="maintenance">
            <MaintenancePanel adminClient={adminClient!} />
          </TabsContent>

          <TabsContent value="logs">
            <ServerLogs adminClient={adminClient!} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
