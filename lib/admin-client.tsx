export interface DashboardData {
  server: {
    uptime: {
      ms: number;
      formatted: string;
    };
    startTime: string;
    nodeVersion: string;
    platform: string;
    pid: number;
  };
  stats: {
    requests: {
      total: number;
      errors: number;
      successRate: string;
    };
    files: {
      processed: number;
      activeProcesses: number;
    };
    processes: {
      queueLength: number;
      runningProcesses: number;
      activeProcesses: number;
      processIds: string[];
    };
    tempFiles: {
      trackedFiles: number;
      oldestFile: number | null;
      files: Array<{
        path: string;
        age: number;
        created: string;
      }>;
    };
    lastCleanup: string | null;
  };
  memory: {
    rss: string;
    heapTotal: string;
    heapUsed: string;
    external: string;
  };
  disk: {
    videos: string;
    music: string;
    temp: string;
    total: string;
  };
}

export interface FileInfo {
  path: string;
  relativePath: string;
  size: number;
  sizeFormatted: string;
  created: string;
  modified: string;
  inDatabase: boolean;
  orphaned: boolean;
}

export interface OrphanedFilesResponse {
  summary: {
    totalOrphaned: number;
    totalSize: string;
    totalSizeBytes: number;
  };
  files: {
    videos: FileInfo[];
    music: FileInfo[];
  };
}

export interface CleanupResult {
  dryRun: boolean;
  deleted: Array<{
    path: string;
    relativePath: string;
    size: number;
    sizeFormatted: string;
    wouldDelete?: boolean;
  }>;
  failed: Array<{
    path: string;
    error: string;
  }>;
  skipped: Array<{
    path: string;
    reason: string;
    size?: number;
  }>;
  summary: {
    totalFound: number;
    totalDeleted: number;
    totalFailed: number;
    totalSkipped: number;
    sizeFreed: number;
    sizeFreedFormatted: string;
  };
}

export class AdminClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(
    baseUrl = process.env.NEXT_PUBLIC_FILE_SERVER_URL ||
      "http://localhost:4000",
    apiKey: string
  ) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const correctedUrl = url.replace(/([^:]\/)\/+/g, "$1");

    console.log(`Requesting: ${correctedUrl}`, options);
    if (!this.apiKey) {
      throw new Error("API key is required for admin operations");
    }
    console.log(
      `Making request to: ${process.env.NEXT_PUBLIC_FILE_SERVER_URL}`,
      options
    );
    const headers = {
      "Content-Type": "application/json",
      "X-Admin-Key": this.apiKey,
      ...options.headers,
    };

    try {
      const response = await fetch(correctedUrl, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(
          `API Error: ${response.status} - ${error.error || error.message}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`Admin API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  async getDashboard(): Promise<DashboardData> {
    return this.request<DashboardData>("/admin/dashboard");
  }

  async listFiles(type?: string, detailed = false): Promise<any> {
    const params = new URLSearchParams();
    if (type) params.append("type", type);
    if (detailed) params.append("detailed", "true");

    return this.request(`/admin/files?${params}`);
  }

  async findOrphanedFiles(): Promise<OrphanedFilesResponse> {
    return this.request<OrphanedFilesResponse>("/admin/files/orphaned");
  }

  async cleanupFiles(dryRun = true, maxSize?: number): Promise<CleanupResult> {
    const params = new URLSearchParams();
    params.append("dryRun", dryRun.toString());
    if (maxSize) params.append("maxSize", maxSize.toString());

    return this.request<CleanupResult>(`/admin/files/cleanup?${params}`, {
      method: "DELETE",
    });
  }

  async deleteFiles(filePaths: string[]): Promise<any> {
    return this.request("/admin/files", {
      method: "DELETE",
      body: JSON.stringify({ files: filePaths }),
    });
  }

  async cleanupTempFiles(force = false): Promise<any> {
    const params = new URLSearchParams();
    params.append("force", force.toString());

    return this.request(`/admin/temp/cleanup?${params}`, {
      method: "DELETE",
    });
  }

  async killAllProcesses(): Promise<any> {
    return this.request("/admin/processes/kill", {
      method: "POST",
    });
  }

  async getLogs(lines = 100): Promise<any> {
    const params = new URLSearchParams();
    params.append("lines", lines.toString());

    return this.request(`/admin/logs?${params}`);
  }
}
