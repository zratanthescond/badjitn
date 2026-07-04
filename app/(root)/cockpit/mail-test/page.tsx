"use client";

import React, { useState } from "react";
import Link from "next/link";
import { testMailService } from "@/lib/actions/mail.actions";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { 
  Mail, 
  Server, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw, 
  Terminal, 
  ArrowLeft, 
  ShieldAlert, 
  Lock, 
  Eye, 
  EyeOff, 
  Send 
} from "lucide-react";

export default function MailTestPage() {
  const [email, setEmail] = useState("honcongs1@gmail.com");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await testMailService(email);
      if (res) {
        setResult(res);
      } else {
        setError("No response received from the server action.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during execution.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-5xl rounded-2xl min-h-screen">
      {/* Breadcrumb / Back button */}
      <div className="mb-6">
        <Link 
          href="/cockpit" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Admin Cockpit
        </Link>
      </div>

      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400">
              <Mail className="h-6 w-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">SMTP Diagnostic Console</h1>
          </div>
          <p className="text-muted-foreground">
            Test and troubleshoot the outbound mailing system in the production environment.
          </p>
        </div>

        {/* Form & Config Card */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Main Action Form */}
          <Card className="md:col-span-3 border border-border shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Send className="h-4 w-4 text-indigo-500" />
                Run Email Test
              </CardTitle>
              <CardDescription>
                Send a diagnostic HTML test email to verify credentials and network paths.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleTest}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Recipient Email Address
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="email"
                      type="email"
                      required
                      placeholder="e.g. your-email@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This email will contain connection specifics to verify successful transmission.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t border-border bg-muted/30 pt-4">
                <Button 
                  type="submit" 
                  disabled={loading || !email}
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Diagnosing Outbound...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Test SMTP Pipeline
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Quick Environment Status */}
          <Card className="md:col-span-2 border border-border shadow-sm bg-muted/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-md flex items-center gap-2">
                <Server className="h-4 w-4 text-emerald-500" />
                SMTP Host Details
              </CardTitle>
              <CardDescription>
                Configurations parsed from env.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">Provider Mode:</span>
                <span className="font-semibold text-foreground">
                  {process.env.NEXT_PUBLIC_SERVER_URL?.includes("localhost") ? "Local / Dev" : "Production"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border font-mono text-xs">
                <span className="text-muted-foreground">Host:</span>
                <span className="font-semibold">{result?.data?.smtpConfig?.host || "Loading..."}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">Port:</span>
                <span className="font-mono text-xs font-semibold">{result?.data?.smtpConfig?.port || "Loading..."}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">Security:</span>
                <span>
                  {result?.data?.smtpConfig ? (
                    result.data.smtpConfig.secure ? (
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200">SSL/TLS</Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-500 border-amber-300">STARTTLS</Badge>
                    )
                  ) : (
                    <span className="text-muted-foreground font-mono text-xs">Loading...</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border font-mono text-xs">
                <span className="text-muted-foreground">User:</span>
                <span className="font-semibold truncate max-w-[150px]">{result?.data?.smtpConfig?.user || "Loading..."}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Global Errors */}
        {error && (
          <Alert variant="destructive" className="border-red-600 bg-red-50 dark:bg-red-950/20">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Unexpected Server Action Error</AlertTitle>
            <AlertDescription className="font-mono text-xs mt-2 overflow-x-auto whitespace-pre-wrap">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Results Console */}
        {result && (
          <div className="flex flex-col gap-6">
            {/* Status Summary Banner */}
            <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center gap-4 ${
              result.success 
                ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/10 dark:border-emerald-900/50" 
                : "bg-rose-50 border-rose-200 dark:bg-rose-950/10 dark:border-rose-900/50"
            }`}>
              <div className={`p-3 rounded-full ${
                result.success ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400" : "bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400"
              }`}>
                {result.success ? <CheckCircle className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="font-bold text-lg text-foreground">
                  {result.success ? "SMTP Pipeline Check Passed" : "SMTP Pipeline Check Failed"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {result.success 
                    ? `Successfully connected to SMTP and dispatched test email to ${email}.`
                    : "The mail service failed to complete the requested operation. Review details below."}
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-center">
                <Badge variant={result.success ? "default" : "destructive"} className="text-xs uppercase px-3 py-1 font-semibold">
                  {result.success ? "SUCCESS" : "ERROR"}
                </Badge>
              </div>
            </div>

            {/* Pipeline Stage Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Connection Stage */}
              <div className="p-4 border rounded-xl bg-card flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    result.data?.connectionStatus === "success" 
                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400" 
                      : "bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400"
                  }`}>
                    <Server className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">SMTP Handshake</h4>
                    <p className="text-xs text-muted-foreground">Verification check with SMTP host</p>
                  </div>
                </div>
                <Badge variant={result.data?.connectionStatus === "success" ? "default" : "destructive"}>
                  {result.data?.connectionStatus === "success" ? "Connected" : "Refused"}
                </Badge>
              </div>

              {/* Sending Stage */}
              <div className="p-4 border rounded-xl bg-card flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    result.data?.sendStatus === "success" 
                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400" 
                      : result.data?.sendStatus === "unknown" 
                        ? "bg-muted text-muted-foreground" 
                        : "bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400"
                  }`}>
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Email Dispatch</h4>
                    <p className="text-xs text-muted-foreground">Test email payload transmission</p>
                  </div>
                </div>
                <Badge 
                  variant={result.data?.sendStatus === "success" ? "default" : result.data?.sendStatus === "unknown" ? "secondary" : "destructive"}
                >
                  {result.data?.sendStatus === "success" ? "Sent" : result.data?.sendStatus === "unknown" ? "Skipped" : "Failed"}
                </Badge>
              </div>
            </div>

            {/* Error Diagnostics Block */}
            {!result.success && result.data?.error && (
              <Card className="border-rose-300 dark:border-rose-950 shadow-md">
                <CardHeader className="bg-rose-50/50 dark:bg-rose-950/10 border-b border-border">
                  <CardTitle className="text-md flex items-center gap-2 text-rose-600 dark:text-rose-400">
                    <ShieldAlert className="h-5 w-5" />
                    SMTP Error Details
                  </CardTitle>
                  <CardDescription>
                    Nodemailer returned the following diagnostic error payload.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 font-mono text-xs">
                  <div className="p-4 space-y-3 bg-muted/40 border-b border-border">
                    <div className="grid grid-cols-3 gap-2 py-1 border-b border-border/50">
                      <span className="text-muted-foreground font-semibold">Failure Stage:</span>
                      <span className="col-span-2 font-semibold text-foreground uppercase">{result.data.error.stage}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 py-1 border-b border-border/50">
                      <span className="text-muted-foreground font-semibold">Error Message:</span>
                      <span className="col-span-2 text-rose-600 dark:text-rose-400 font-bold">{result.data.error.message}</span>
                    </div>
                    {result.data.error.code && (
                      <div className="grid grid-cols-3 gap-2 py-1 border-b border-border/50">
                        <span className="text-muted-foreground">Error Code:</span>
                        <span className="col-span-2 font-semibold">{result.data.error.code}</span>
                      </div>
                    )}
                    {result.data.error.command && (
                      <div className="grid grid-cols-3 gap-2 py-1 border-b border-border/50">
                        <span className="text-muted-foreground">Command:</span>
                        <span className="col-span-2 font-semibold">{result.data.error.command}</span>
                      </div>
                    )}
                    {result.data.error.response && (
                      <div className="grid grid-cols-3 gap-2 py-1 border-b border-border/50">
                        <span className="text-muted-foreground">SMTP Response:</span>
                        <span className="col-span-2 font-semibold text-amber-600 dark:text-amber-400">{result.data.error.response}</span>
                      </div>
                    )}
                    {result.data.error.responseCode && (
                      <div className="grid grid-cols-3 gap-2 py-1 border-b border-border/50">
                        <span className="text-muted-foreground">Response Code:</span>
                        <span className="col-span-2 font-semibold">{result.data.error.responseCode}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-muted/20">
                    <h5 className="font-semibold text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                      <Terminal className="h-3.5 w-3.5" />
                      Detailed Stack Trace
                    </h5>
                    <pre className="p-4 bg-zinc-950 text-zinc-100 rounded-xl overflow-x-auto max-h-[300px] border border-zinc-800 leading-relaxed font-mono">
                      {result.data.error.stack || "No stack trace available."}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Success Metadata Block */}
            {result.success && (
              <Card className="border-border shadow-md">
                <CardHeader className="bg-emerald-50/10 border-b border-border">
                  <CardTitle className="text-md flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="h-5 w-5" />
                    Transaction Response
                  </CardTitle>
                  <CardDescription>
                    The email has been successfully queued by the SMTP mail host.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-4 text-sm font-mono">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 border-b border-border pb-3">
                    <span className="text-muted-foreground font-semibold">Message ID:</span>
                    <span className="md:col-span-3 text-foreground font-semibold break-all">{result.messageId}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 pb-1">
                    <span className="text-muted-foreground font-semibold">SMTP Server Response:</span>
                    <span className="md:col-span-3 text-emerald-600 dark:text-emerald-400 font-semibold break-all">{result.response}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
