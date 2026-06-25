"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Shield,
    ShieldCheck,
    ShieldOff,
    Copy,
    Check,
    ChevronLeft,
    KeyRound,
    Smartphone,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import ChangePasswordForm from "@/components/auth/ChangePasswordForm";
import SetPasswordForm from "@/components/auth/SetPasswordForm";
import { toast } from "sonner";
import Image from "next/image";
import { api } from "@/lib/api";
import { showApiError } from "@/lib/errors/toast-error";
import { Skeleton } from "@/components/ui/skeleton";
// ─── Change Password Modal ───────────────────────────────────────

function ChangePasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogDescription>
                        All other devices will be signed out after this change.
                    </DialogDescription>
                </DialogHeader>
                <Separator />
                <ChangePasswordForm onClose={onClose} />
            </DialogContent>
        </Dialog>
    );
}

// ─── Set Password Modal ──────────────────────────────────────────

function SetPasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Set Password</DialogTitle>
                    <DialogDescription>
                        Create a password so you can sign in using email and password.
                    </DialogDescription>
                </DialogHeader>
                <Separator />
                <SetPasswordForm onClose={onClose} />
            </DialogContent>
        </Dialog>
    );
}

// ─── MFA Enable Modal ───────────────────────────────────────────

type MfaStep = "qr" | "verify" | "backup";

function MfaEnableModal({
    open,
    onClose,
    onSuccess,
}: {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [step, setStep] = useState<MfaStep>("qr");
    const [qrUrl, setQrUrl] = useState("");
    const [code, setCode] = useState("");
    const [backupCodes, setBackupCodes] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [secret, setSecret] = useState("")

    const handleCopy = async () => {
        console.log("COplying")
        await navigator.clipboard.writeText(secret);

        setCopied(true);

        setTimeout(() => {
            setCopied(false);
        }, 2000);
    };

    useEffect(() => {
        if (open) {
            fetchQr();
        }
    }, [open]);

    const fetchQr = async () => {
        setLoading(true);

        try {
            const { data } = await api.get("/auth/mfa/setup");

            setQrUrl(data.data.qrCodeUrl);
            setSecret(data.data.secret);


        } catch (error: any) {
            showApiError(error);

            onClose();

        } finally {
            setLoading(false);
        }
    };

    const handleEnable = async () => {
        if (code.length !== 6) {
            return toast.error("Enter 6 digit code");
        }

        setLoading(true);

        try {
            const response = await api.post(
                "/auth/mfa/enable",
                {
                    code
                }
            );

            setBackupCodes(
                response.data.data.backupCodes
            );

            toast.success(
                "MFA enabled successfully"
            );

            setStep("backup");

        } catch (error: any) {
            toast.error(
                error?.response?.data?.message ||
                error.message ||
                "Invalid code"
            );

        } finally {
            setLoading(false);
        }
    };

    const handleCopyAll = async () => {
        await navigator.clipboard.writeText(backupCodes.join("\n"));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("Backup codes copied!");
    };

    const handleClose = () => {
        setStep("qr");
        setCode("");
        setBackupCodes([]);
        setCopied(false);
        setQrUrl("");
        onClose();
    };

    const handleDone = () => {
        onSuccess();
        handleClose();
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(value) => {
                if (!value) {
                    handleClose();
                }
            }}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {step === "qr" && "Scan QR Code"}
                        {step === "verify" && "Verify Code"}
                        {step === "backup" && "Save Backup Codes"}
                    </DialogTitle>
                    <DialogDescription>
                        {step === "qr" && "Scan this QR with Google Authenticator or Authy."}
                        {step === "verify" && "Enter the 6-digit code from your authenticator app."}
                        {step === "backup" && "Save these somewhere safe. Each code can only be used once."}
                    </DialogDescription>
                </DialogHeader>
                <Separator />

                {/* Step 1 — QR */}
                {step === "qr" && (
                    <div className="flex flex-col items-center gap-5 py-2">
                        {loading || !qrUrl ? (
                            <div className="h-48 w-48 animate-pulse rounded-2xl bg-muted" />
                        ) : (
                            <div className="rounded-2xl border p-3 shadow-sm">
                                <Image src={qrUrl} alt="MFA QR Code" width={180} height={180} />
                            </div>
                        )}

                        <div className="w-full space-y-2">
                            <Label>Manual Setup Key</Label>

                            <div className="w-full">
                                {loading || !secret ? (
                                    <div className="relative">
                                        <Skeleton className="h-10 w-full rounded-md" />
                                        <Skeleton className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-md" />
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <Input
                                            value={secret}
                                            readOnly
                                            className="pr-12"
                                        />

                                        <Button
                                            variant="ghost"
                                            className="absolute right-2"
                                            onClick={handleCopy}
                                        >
                                           {copied ? (
                                                <Check className="h-4 w-4 text-green-600" />
                                            ) : (
                                                <Copy className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <ol className="w-full list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                            <li>Install Google Authenticator, Microsoft Authenticator, or Authy.</li>
                            <li>Open the app and tap the <strong>+</strong> button.</li>
                            <li>Scan the QR code or enter the setup key manually.</li>
                        </ol>

                        <Button
                            className="w-full rounded-xl"
                            onClick={() => setStep("verify")}
                            disabled={loading || !qrUrl}
                        >
                            Next — Enter Code
                        </Button>
                    </div>
                )}

                {/* Step 2 — Verify */}
                {step === "verify" && (
                    <div className="flex flex-col gap-4 py-2">
                        <div className="space-y-2">
                            <Label>6-digit code</Label>
                            <Input
                                placeholder="000000"
                                maxLength={6}
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                                className="rounded-xl text-center text-lg tracking-[0.5em]"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setStep("qr")}>
                                Back
                            </Button>
                            <Button
                                className="flex-1 rounded-xl"
                                onClick={handleEnable}
                                disabled={loading || code.length !== 6}
                            >
                                {loading ? "Verifying..." : "Enable MFA"}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 3 — Backup Codes */}
                {step === "backup" && (
                    <div className="flex flex-col gap-4 py-2">
                        <div className="grid grid-cols-2 gap-2">
                            {backupCodes.map((c) => (
                                <div
                                    key={c}
                                    className="rounded-xl border bg-muted/40 px-3 py-2 text-center font-mono text-sm"
                                >
                                    {c}
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" className="w-full rounded-xl" onClick={handleCopyAll}>
                            {copied ? (
                                <><Check className="mr-2 h-4 w-4" />Copied!</>
                            ) : (
                                <><Copy className="mr-2 h-4 w-4" />Copy All Codes</>
                            )}
                        </Button>
                        <Button className="w-full rounded-xl" onClick={handleDone}>
                            Done — I've saved these
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

// ─── MFA Disable Modal ──────────────────────────────────────────

function MfaDisableModal({
    open,
    onClose,
    onSuccess,
}: {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);

    const handleDisable = async () => {
        if (code.length !== 6) {
            return toast.error("Enter 6 digit code");
        }

        setLoading(true);

        try {
            const { data } = await api.post(
                "/auth/mfa/disable",
                { code }
            );

            toast.success(data.message || "MFA disabled");

            onSuccess();
            onClose();
        } catch (error) {
            showApiError(error)
        } finally {
            setLoading(false);
            setCode("");
        }
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
                    <DialogDescription>
                        Enter your current authenticator code to confirm.
                    </DialogDescription>
                </DialogHeader>
                <Separator />
                <div className="flex flex-col gap-4 py-2">
                    <div className="space-y-2">
                        <Label>6-digit code</Label>
                        <Input
                            placeholder="000000"
                            maxLength={6}
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                            className="rounded-xl text-center text-lg tracking-[0.5em]"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            className="flex-1 rounded-xl"
                            onClick={handleDisable}
                            disabled={loading || code.length !== 6}
                        >
                            {loading ? "Disabling..." : "Disable MFA"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Main Security Page ─────────────────────────────────────────

export default function SecurityPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showSetPassword, setShowSetPassword] = useState(false);
    const [showMfaEnable, setShowMfaEnable] = useState(false);
    const [showMfaDisable, setShowMfaDisable] = useState(false);
    const [mfaEnabled, setMfaEnabled] = useState(user?.mfaEnabled ?? false);

    if (loading || !user) return null;

    return (
        <div className="mx-auto max-w-2xl space-y-6">

            {/* Header */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => router.back()}
                    className="rounded-xl p-2 hover:bg-muted transition"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Security</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your password and account protection.
                    </p>
                </div>
            </div>

            {/* Password Card */}
            <Card className="rounded-3xl">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-primary/10 p-2">
                            <KeyRound className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-base">Password</CardTitle>
                            <CardDescription>
                                {user.hasPassword
                                    ? "Update your current password."
                                    : "Set a password to sign in with email."}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center">
                        <div>
                            <p className="font-medium">
                                {user.hasPassword ? "Password set" : "No password set"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {user.hasPassword
                                    ? "Last changed — update anytime."
                                    : "You're signed in via Google only."}
                            </p>
                        </div>
                        {user.hasPassword ? (
                            <Button
                                variant="outline"
                                className="rounded-xl"
                                onClick={() => setShowChangePassword(true)}
                            >
                                Change Password
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                className="rounded-xl"
                                onClick={() => setShowSetPassword(true)}
                            >
                                Set Password
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* MFA Card */}
            <Card className="rounded-3xl">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className={`rounded-xl p-2 ${mfaEnabled ? "bg-green-500/10" : "bg-primary/10"}`}>
                            {mfaEnabled ? (
                                <ShieldCheck className="h-5 w-5 text-green-500" />
                            ) : (
                                <Shield className="h-5 w-5 text-primary" />
                            )}
                        </div>
                        <div>
                            <CardTitle className="text-base flex items-center gap-2">
                                Two-Factor Authentication
                                <Badge
                                    variant={mfaEnabled ? "default" : "secondary"}
                                    className="rounded-full text-xs"
                                >
                                    {mfaEnabled ? "Enabled" : "Disabled"}
                                </Badge>
                            </CardTitle>
                            <CardDescription>
                                {mfaEnabled
                                    ? "Your account has an extra layer of protection."
                                    : "Add an extra layer of security to your account."}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-3">
                            <Smartphone className="h-5 w-5 text-muted-foreground shrink-0" />
                            <div>
                                <p className="font-medium">Authenticator App</p>
                                <p className="text-sm text-muted-foreground">
                                    {mfaEnabled
                                        ? "Google Authenticator / Authy connected."
                                        : "Use Google Authenticator or Authy."}
                                </p>
                            </div>
                        </div>

                        {mfaEnabled ? (
                            <Button
                                variant="outline"
                                className="rounded-xl text-destructive border-destructive/30 hover:bg-destructive/5 shrink-0"
                                onClick={() => setShowMfaDisable(true)}
                            >
                                <ShieldOff className="mr-2 h-4 w-4" />
                                Disable
                            </Button>
                        ) : (
                            <Button
                                className="rounded-xl shrink-0"
                                onClick={() => setShowMfaEnable(true)}
                            >
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                Enable MFA
                            </Button>
                        )}
                    </div>

                    {/* Info box */}
                    {!mfaEnabled && (
                        <div className="rounded-2xl bg-muted/40 border px-5 py-4 text-sm text-muted-foreground space-y-1">
                            <p className="font-medium text-foreground">How it works</p>
                            <p>After enabling, every login will require a 6-digit code from your authenticator app in addition to your password.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modals */}
            <ChangePasswordModal
                open={showChangePassword}
                onClose={() => setShowChangePassword(false)}
            />
            <SetPasswordModal
                open={showSetPassword}
                onClose={() => setShowSetPassword(false)}
            />
            <MfaEnableModal
                open={showMfaEnable}
                onClose={() => setShowMfaEnable(false)}
                onSuccess={() => setMfaEnabled(true)}
            />
            <MfaDisableModal
                open={showMfaDisable}
                onClose={() => setShowMfaDisable(false)}
                onSuccess={() => setMfaEnabled(false)}
            />
        </div>
    );
}