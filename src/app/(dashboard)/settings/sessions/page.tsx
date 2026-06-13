"use client";

import {
  Laptop,
  Smartphone,
  Monitor,
  Shield,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

const sessions = [
  {
    id: 1,
    browser: "Chrome",
    device: "Windows PC",
    ip: "192.168.1.2",
    lastActive: "Now",
    current: true,
    icon: Laptop,
  },
  {
    id: 2,
    browser: "Edge",
    device: "Android Phone",
    ip: "192.168.1.5",
    lastActive: "2 hours ago",
    current: false,
    icon: Smartphone,
  },
  {
    id: 3,
    browser: "Firefox",
    device: "Office Desktop",
    ip: "192.168.1.8",
    lastActive: "Yesterday",
    current: false,
    icon: Monitor,
  },
];

export default function SessionsPage() {
  return (
    <div className="space-y-8 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Active Sessions
          </h1>

          <p className="text-muted-foreground">
            Manage devices logged into your account.
          </p>
        </div>

        <Button variant="destructive">
          Logout All Devices
        </Button>
      </div>

      <div className="space-y-4">
        {sessions.map((session) => {
          const Icon = session.icon;

          return (
            <Card key={session.id}>
              <CardContent className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-primary/10 p-3">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">
                        {session.browser} on {session.device}
                      </h3>

                      {session.current && (
                        <Badge>
                          Current Device
                        </Badge>
                      )}
                    </div>

                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <p>
                        IP Address: {session.ip}
                      </p>

                      <p>
                        Last Active: {session.lastActive}
                      </p>
                    </div>
                  </div>
                </div>

                {!session.current && (
                  <Button variant="outline">
                    Remove
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-center gap-4 p-5">
          <Shield className="h-6 w-6 text-primary" />

          <div>
            <h3 className="font-medium">
              Security Tip
            </h3>

            <p className="text-sm text-muted-foreground">
              If you notice an unknown device, remove it immediately.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}