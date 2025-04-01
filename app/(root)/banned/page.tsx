import { Shield, AlertTriangle, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { useUser } from "@/lib/actions/user.actions";

interface BannedPageProps {
  user?: {
    name?: string;
    email?: string;
    banDate?: string;
    banReason?: string;
  };
  supportEmail?: string;
  appealAllowed?: boolean;
}

export default async function Page() {
  const user = await useUser();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />

      <div className="max-w-md w-full mx-auto">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-red-100 dark:bg-red-900/20 rounded-full blur-xl opacity-70 animate-pulse" />
            <div className="relative bg-white dark:bg-gray-950 rounded-full p-3 border border-red-200 dark:border-red-800">
              <Shield className="h-12 w-12 text-red-500" />
            </div>
          </div>
        </div>

        <Card className="border-red-200 dark:border-red-900/50 shadow-lg">
          <CardHeader className="pb-4 border-b border-red-100 dark:border-red-900/30">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-1">
              <AlertTriangle className="h-4 w-4" />
              <p className="text-sm font-medium uppercase tracking-wider">
                Account Suspended
              </p>
            </div>
            <CardTitle className="text-2xl">
              Your account has been banned
            </CardTitle>
            <CardDescription>
              We've determined that your account has violated our community
              guidelines or terms of service.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6 space-y-4">
            {user.firstName && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Account
                </p>
                <p>
                  {user.firstName} {user.email && `(${user.email})`}
                </p>
              </div>
            )}

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Reason
              </p>
              <p>
                Multiple violations of our community guidelines regarding
                content sharing and user interactions.
              </p>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg border border-muted space-y-2">
              <h3 className="font-medium">What does this mean?</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>You cannot access your account or its content</li>
                <li>You cannot create new accounts on our platform</li>
                <li>
                  This decision may be permanent depending on the violation
                </li>
              </ul>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3 pt-2">
            <Button className="w-full" variant="outline">
              <Mail className="mr-2 h-4 w-4" />
              Appeal this decision
            </Button>

            <div className="text-sm text-center text-muted-foreground">
              <p>
                If you believe this is a mistake, please contact our support
                team at{" "}
                <a
                  href={`mailto:support@badgi.nextjs`}
                  className="text-primary hover:underline font-medium"
                >
                  support@badgi.net
                </a>
              </p>
            </div>

            <div className="pt-4 w-full">
              <Link href="/" passHref>
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Return to homepage
                </Button>
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
