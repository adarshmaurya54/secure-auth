"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
export function PasswordInput({ ...props }) {
    const [show, setShow] = useState(false);
    return (
        <div className="relative">
            <Input type={show ? "text" : "password"} {...props} />
            <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShow((s) => !s)}
                tabIndex={-1}
                aria-label={show ? "Hide password" : "Show password"}
            >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </Button>
        </div>
    );
}
