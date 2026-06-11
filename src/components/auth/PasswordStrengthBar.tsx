const levels = [
    { label: "Too weak", color: "bg-red-500" },
    { label: "Weak", color: "bg-orange-400" },
    { label: "Fair", color: "bg-yellow-400" },
    { label: "Strong", color: "bg-green-500" },
];
function getStrength(password: string): number {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
}
export function PasswordStrengthBar({ password }: { password: string }) {
    if (!password) return null;
    const strength = getStrength(password);
    const { label, color } = levels[strength - 1] ?? levels[0];
    return (
        <div className="space-y-1 mt-1">
            <div className="flex gap-1">
                {levels.map((_, i) => (
                    <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${i < strength ? color : "bg-muted"
                            }`}
                    />
                ))}
            </div>
            <p className="text-xs text-muted-foreground">{label}</p>
        </div>
    );
}