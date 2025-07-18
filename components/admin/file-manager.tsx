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
        // Refresh data after actual cleanup
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
          <Badge variant="secondary">{files.length} files</Badge>
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
                    {file.sizeFormatted} •{" "}
                    {new Date(file.created).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {file.orphaned && (
                  <Badge variant="destructive" className="text-xs">
                    Orphaned
                  </Badge>
                )}
                {file.inDatabase && (
                  <Badge variant="default" className="text-xs">
                    In DB
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
        <h2 className="text-2xl font-bold">File Manager</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchFiles} disabled={loading}>
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Files</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by filename or path..."
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
                //  className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                onCheckedChange={setShowOrphanedOnly}
              />
              <Label htmlFor="orphaned-only">Show orphaned only</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orphaned Files Summary */}
      {orphanedFiles && orphanedFiles.summary.totalOrphaned > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Found {orphanedFiles.summary.totalOrphaned} orphaned files taking up{" "}
            {orphanedFiles.summary.totalSize}
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          onClick={() => handleCleanup(true)}
          disabled={loading}
          variant="outline"
        >
          <Eye className="mr-2 h-4 w-4" />
          Preview Cleanup
        </Button>
        <Button
          onClick={() => handleCleanup(false)}
          disabled={loading}
          variant="destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Clean Up Orphaned Files
        </Button>
        <Button
          onClick={selectAllOrphaned}
          disabled={!orphanedFiles || orphanedFiles.summary.totalOrphaned === 0}
          variant="outline"
        >
          Select All Orphaned
        </Button>
        {selectedFiles.length > 0 && (
          <Button
            onClick={handleDeleteSelected}
            disabled={loading}
            variant="destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Selected ({selectedFiles.length})
          </Button>
        )}
      </div>

      {/* Cleanup Results */}
      {cleanupResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {cleanupResult.dryRun ? (
                <Eye className="h-5 w-5" />
              ) : (
                <CheckCircle className="h-5 w-5" />
              )}
              {cleanupResult.dryRun ? "Cleanup Preview" : "Cleanup Results"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {cleanupResult.summary.totalFound}
                </div>
                <div className="text-sm text-gray-500">Found</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {cleanupResult.summary.totalDeleted}
                </div>
                <div className="text-sm text-gray-500">
                  {cleanupResult.dryRun ? "Would Delete" : "Deleted"}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {cleanupResult.summary.totalFailed}
                </div>
                <div className="text-sm text-gray-500">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {cleanupResult.summary.totalSkipped}
                </div>
                <div className="text-sm text-gray-500">Skipped</div>
              </div>
            </div>
            <div className="text-center text-lg font-semibold">
              Space {cleanupResult.dryRun ? "would be" : ""} freed:{" "}
              {cleanupResult.summary.sizeFreedFormatted}
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Lists */}
      {files && (
        <Tabs defaultValue="videos" className="space-y-4">
          <TabsList>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="music">Music</TabsTrigger>
          </TabsList>

          <TabsContent value="videos">
            <FileList files={files.videos || []} title="Video Files" />
          </TabsContent>

          <TabsContent value="music">
            <FileList files={files.music || []} title="Music Files" />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
