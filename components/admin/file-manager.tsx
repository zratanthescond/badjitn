"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTranslations } from "next-intl";
import {
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Search,
  Eye,
  Filter,
} from "lucide-react";
import type {
  AdminClient,
  FileInfo,
  OrphanedFilesResponse,
  CleanupResult,
} from "@/lib/admin-client";

interface FileManagerProps {
  adminClient: AdminClient;
}

export function FileManager({ adminClient }: FileManagerProps) {
  const t = useTranslations("fileManager");
  const [files, setFiles] = useState<any>(null);
  const [orphanedFiles, setOrphanedFiles] =
    useState<OrphanedFilesResponse | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showOrphanedOnly, setShowOrphanedOnly] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<CleanupResult | null>(
    null
  );

  const fetchFiles = async () => {
    setLoading(true);
    setError("");

    try {
      const [filesData, orphanedData] = await Promise.all([
        adminClient.listFiles(undefined, true),
        adminClient.findOrphanedFiles(),
      ]);

      setFiles(filesData);
      setOrphanedFiles(orphanedData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleCleanup = async (dryRun = true) => {
    setLoading(true);
    setError("");

    try {
      const result = await adminClient.cleanupFiles(dryRun);
      setCleanupResult(result);

      if (!dryRun) {
        await fetchFiles();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedFiles.length === 0) return;

    setLoading(true);
    setError("");

    try {
      await adminClient.deleteFiles(selectedFiles);
      setSelectedFiles([]);
      await fetchFiles();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleFileSelection = (filePath: string) => {
    setSelectedFiles((prev) =>
      prev.includes(filePath)
        ? prev.filter((f) => f !== filePath)
        : [...prev, filePath]
    );
  };

  const selectAllOrphaned = () => {
    if (!orphanedFiles) return;

    const allOrphaned = [
      ...orphanedFiles.files.videos.map((f) => f.relativePath),
      ...orphanedFiles.files.music.map((f) => f.relativePath),
    ];

    setSelectedFiles(allOrphaned);
  };

  const filterFiles = (fileList: FileInfo[]) => {
    let filtered = fileList;

    if (searchTerm) {
      filtered = filtered.filter(
        (file) =>
          file.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
          file.relativePath.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (showOrphanedOnly) {
      filtered = filtered.filter((file) => file.orphaned);
    }

    return filtered;
  };

  const FileList = ({ files, title }: { files: FileInfo[]; title: string }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <Badge variant="secondary">
            {t("common.filesCount", { count: files.length })}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filterFiles(files).map((file) => (
            <div
              key={file.path}
              className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={selectedFiles.includes(file.relativePath)}
                  onCheckedChange={() => toggleFileSelection(file.relativePath)}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {file.relativePath}
                  </p>
                  <p className="text-xs text-gray-500">
                    {file.sizeFormatted} • {new Date(file.created).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {file.orphaned && (
                  <Badge variant="destructive" className="text-xs">
                    {t("badges.orphaned")}
                  </Badge>
                )}
                {file.inDatabase && (
                  <Badge variant="default" className="text-xs">
                    {t("badges.inDb")}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("title")}</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchFiles} disabled={loading}>
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            {t("actions.refresh")}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t("filters.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Label htmlFor="search">{t("filters.searchLabel")}</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder={t("filters.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="orphaned-only"
                checked={showOrphanedOnly}
                onCheckedChange={setShowOrphanedOnly}
              />
              <Label htmlFor="orphaned-only">
                {t("filters.showOrphanedOnly")}
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {orphanedFiles && orphanedFiles.summary.totalOrphaned > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {t("summary.orphanedFound", {
              count: orphanedFiles.summary.totalOrphaned,
              size: orphanedFiles.summary.totalSize,
            })}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-2">
        <Button
          onClick={() => handleCleanup(true)}
          disabled={loading}
          variant="outline"
        >
          <Eye className="mr-2 h-4 w-4" />
          {t("actions.previewCleanup")}
        </Button>
        <Button
          onClick={() => handleCleanup(false)}
          disabled={loading}
          variant="destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {t("actions.cleanupOrphaned")}
        </Button>
        <Button
          onClick={selectAllOrphaned}
          disabled={!orphanedFiles || orphanedFiles.summary.totalOrphaned === 0}
          variant="outline"
        >
          {t("actions.selectAllOrphaned")}
        </Button>
        {selectedFiles.length > 0 && (
          <Button
            onClick={handleDeleteSelected}
            disabled={loading}
            variant="destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t("actions.deleteSelected", { count: selectedFiles.length })}
          </Button>
        )}
      </div>

      {cleanupResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {cleanupResult.dryRun ? (
                <Eye className="h-5 w-5" />
              ) : (
                <CheckCircle className="h-5 w-5" />
              )}
              {cleanupResult.dryRun
                ? t("cleanup.previewTitle")
                : t("cleanup.resultsTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {cleanupResult.summary.totalFound}
                </div>
                <div className="text-sm text-gray-500">{t("cleanup.found")}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {cleanupResult.summary.totalDeleted}
                </div>
                <div className="text-sm text-gray-500">
                  {cleanupResult.dryRun
                    ? t("cleanup.wouldDelete")
                    : t("cleanup.deleted")}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {cleanupResult.summary.totalFailed}
                </div>
                <div className="text-sm text-gray-500">{t("cleanup.failed")}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {cleanupResult.summary.totalSkipped}
                </div>
                <div className="text-sm text-gray-500">{t("cleanup.skipped")}</div>
              </div>
            </div>
            <div className="text-center text-lg font-semibold">
              {t("cleanup.spaceFreed", {
                qualifier: cleanupResult.dryRun ? t("cleanup.wouldBe") : "",
                size: cleanupResult.summary.sizeFreedFormatted,
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {files && (
        <Tabs defaultValue="videos" className="space-y-4">
          <TabsList>
            <TabsTrigger value="videos">{t("tabs.videos")}</TabsTrigger>
            <TabsTrigger value="music">{t("tabs.music")}</TabsTrigger>
          </TabsList>

          <TabsContent value="videos">
            <FileList files={files.videos || []} title={t("tabs.videoFiles")} />
          </TabsContent>

          <TabsContent value="music">
            <FileList files={files.music || []} title={t("tabs.musicFiles")} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
