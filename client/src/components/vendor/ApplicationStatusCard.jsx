import { useState } from "react";
import { Clock, XCircle, AlertCircle, RefreshCw, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import VendorApplicationForm from "./VendorApplicationForm";

export default function ApplicationStatusCard({ status, reason }) {
  const [reapplying, setReapplying] = useState(false);

  if (reapplying) return <VendorApplicationForm />;

  const isPending = status === "pending";

  const config = isPending
    ? {
        badge: {
          label: "Under Review",
          className:
            "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/10",
        },
        iconWrapper: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        icon: <Clock className="h-8 w-8 animate-pulse" />,
        title: "Application Under Review",
        description:
          "Thank you for your interest in becoming a vendor. Our compliance team is actively reviewing your submission.",
        timelineNotice: "Standard review time: 1–2 business days.",
      }
    : {
        badge: {
          label: "Declined",
          className:
            "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/10",
        },
        iconWrapper: "bg-destructive/10 text-destructive",
        icon: <XCircle className="h-8 w-8" />,
        title: "Application Declined",
        description:
          "We're unable to approve your vendor application at this time. Please review the details below before submitting a new request.",
      };

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-sm">
        <CardHeader className="flex flex-col items-center text-center pb-4">
          <div className="flex w-full justify-center mb-4">
            <Badge variant="outline" className={config.badge.className}>
              {config.badge.label}
            </Badge>
          </div>

          <div
            className={`flex h-16 w-16 items-center justify-center rounded-full mb-3 ${config.iconWrapper}`}
          >
            {config.icon}
          </div>

          <CardTitle className="text-2xl tracking-tight">
            {config.title}
          </CardTitle>
          <CardDescription className="text-sm mt-1.5 max-w-sm">
            {config.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {isPending ? (
            <div className="rounded-lg border bg-muted/40 p-4 text-center">
              <p className="text-sm text-muted-foreground">
                {config.timelineNotice}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                You will receive an email confirmation once a decision is made.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-red-200 bg-red-50/60 p-4 dark:border-red-950 dark:bg-red-950/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h5 className="text-sm font-semibold leading-none tracking-tight text-red-600 dark:text-red-400">
                    Reason for Rejection
                  </h5>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {reason ||
                      "No specific reason provided. Please ensure all submitted documents meet platform requirements."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-2 pt-2">
          {!isPending ? (
            <>
              <Button
                variant="outline"
                className="w-full sm:flex-1 gap-2"
                onClick={() =>
                  (window.location.href = "mailto:support@example.com")
                }
              >
                <Mail className="h-4 w-4" />
                Contact Support
              </Button>
              <Button
                className="w-full sm:flex-1 gap-2"
                onClick={() => setReapplying(true)}
              >
                <RefreshCw className="h-4 w-4" />
                Reapply Now
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4" />
              Check Status
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
