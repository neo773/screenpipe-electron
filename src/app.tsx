import { useState, useEffect } from "react";
import { ipcRenderer } from "electron";
import { channels } from "./shared/constants";
import { HealthResponse, healthClient } from "./api/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  CheckCircle2,
  Activity,
  Play,
  Square,
  CircleStop,
  ArrowDownToLine,
  Book,
  LoaderCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ModeToggle } from "./components/mode-toggle";
import { Badge } from "./components/ui/badge";
import clsx from "clsx";
import { SettingsDialog } from "./components/settings-dialog";

const App = () => {
  const [isInstalling, setIsInstalling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);
  const [cliSettings, setCliSettings] = useState({});

  const installCLI = async () => {
    try {
      setIsInstalling(true);
      setError(null);
      await window.electron.installCLI();
      alert("CLI installed successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to install CLI");
    } finally {
      setIsInstalling(false);
    }
  };

  const handleSettingsChange = (newSettings: Record<string, any>) => {
    setCliSettings(newSettings);
    // You can save these settings to electron-store or similar
    // And use them when starting the CLI
  };

  const startCLI = async () => {
    try {
      setError(null);
      // Convert settings to CLI flags
      const flags = Object.entries(cliSettings)
        .map(([key, value]) => {
          if (typeof value === "boolean") {
            return value ? `--${key}` : "";
          }
          return `--${key} ${value}`;
        })
        .filter(Boolean);
      console.log(`starting cli with flags: ${flags}`);
      const result = await window.electron.startCLI(flags);
      if (!result.success) {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || "Failed to start CLI");
    }
  };

  const stopCLI = async () => {
    try {
      setError(null);
      const result = await window.electron.stopCLI();
      if (!result.success) {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || "Failed to stop CLI");
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (err) {
      return "Not available";
    }
  };

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        setIsLoadingHealth(true);
        const healthData = await healthClient.getHealth();
        setHealth(healthData);
        setError(null);
      } catch (err: any) {
        setHealth(null);
      } finally {
        setIsLoadingHealth(false);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="flex flex-col space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-x-4">
            <ModeToggle />
            <SettingsDialog
              onSettingsChange={handleSettingsChange}
              currentSettings={cliSettings}
            />
            <Button
              onClick={installCLI}
              disabled={isInstalling}
              variant="secondary"
              className="min-w-[120px]"
            >
              <ArrowDownToLine className="h-4 w-4" />
              {isInstalling ? (
                <>
                  <div className="animate-spin mr-2">
                    <LoaderCircle className="h-4 w-4" />
                  </div>
                  Installing...
                </>
              ) : (
                "Install CLI"
              )}
            </Button>

            <Button
              variant={health?.status === "healthy" ? "destructive" : "default"}
              onClick={health?.status === "healthy" ? stopCLI : startCLI}
              className="min-w-[120px]"
            >
              {health?.status === "healthy" ? (
                <>
                  <CircleStop className="h-4 w-4" /> Stop CLI
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" /> Start CLI
                </>
              )}
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>System Health Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingHealth && !health ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[300px]" />
              </div>
            ) : health ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge
                    className={clsx(
                      health.status === "healthy"
                        ? " bg-green-950 text-green-400"
                        : "bg-red-950 text-red-400",
                      "flex items-center gap-1 rounded-full"
                    )}
                  >
                    {health.status}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-muted-foreground">Message:</span>
                  <span className="font-medium">{health.message}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-muted-foreground">Frame Status:</span>
                  <span className="font-medium">{health.frame_status}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-muted-foreground">Audio Status:</span>
                  <span className="font-medium">{health.audio_status}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-muted-foreground">UI Status:</span>
                  <span className="font-medium">{health.ui_status}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-muted-foreground">Last Frame:</span>
                  <span className="font-medium">
                    {formatDate(health.last_frame_timestamp)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-muted-foreground">Last Audio:</span>
                  <span className="font-medium">
                    {formatDate(health.last_audio_timestamp)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 animate-pulse" />
                <p>
                  No health data available. Please start the CLI to monitor
                  system status.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Documentation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className="block p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                onClick={() => window.electron.openExternalLink('https://docs.screenpi.pe/docs/cli-reference')}
              >
                <div className="flex items-center gap-2">
                  <ArrowDownToLine className="h-5 w-5" />
                  <div>
                    <h3 className="font-semibold">CLI Reference</h3>
                    <p className="text-sm text-muted-foreground">
                      Learn about CLI commands and usage
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="block p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                onClick={() => window.electron.openExternalLink('https://docs.screenpi.pe/docs/api-reference')}
              >
                <div className="flex items-center gap-2">
                  <ArrowDownToLine className="h-5 w-5" />
                  <div>
                    <h3 className="font-semibold">API Reference</h3>
                    <p className="text-sm text-muted-foreground">
                      Explore the API documentation
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default App;
