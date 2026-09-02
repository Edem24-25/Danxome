import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { MfaVerify } from "./mfa-verify";
import { MfaEnroll } from "./mfa-enroll";

interface MfaGateProps {
  children: React.ReactNode;
  onMfaComplete: () => void;
  onLogout: () => void;
}

export function MfaGate({ children, onMfaComplete, onLogout }: MfaGateProps) {
  const supabase = createClient();
  const [status, setStatus] = useState<"loading" | "enroll" | "verify" | "complete">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    const checkMfa = async () => {
      const { data, error: aalError } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (aalError) {
        setError(aalError.message);
        setStatus("verify");
        return;
      }

      if (data.nextLevel === "aal2" && data.currentLevel !== "aal2") {
        // User has MFA enrolled but hasn't verified yet
        setStatus("verify");
      } else if (data.nextLevel === "aal1" && data.currentLevel === "aal1") {
        // User has no MFA enrolled - need to set up
        setStatus("enroll");
      } else {
        // Already at AAL2
        setStatus("complete");
      }
    };

    checkMfa();
  }, [supabase]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-forest border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={onLogout}
            className="text-sm text-muted-foreground hover:text-forest"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    );
  }

  if (status === "enroll") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-ivory to-white p-4">
        <div className="w-full max-w-md rounded-xl border border-border bg-white p-6 shadow-lg">
          <MfaEnroll
            onEnrolled={onMfaComplete}
            onCancelled={onLogout}
          />
        </div>
      </div>
    );
  }

  if (status === "verify") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-ivory to-white p-4">
        <div className="w-full max-w-md rounded-xl border border-border bg-white p-6 shadow-lg">
          <MfaVerify onVerified={onMfaComplete} onLogout={onLogout} />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
