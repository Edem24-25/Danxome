import { useState } from "react";
import { Shield, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface MfaVerifyProps {
  onVerified: () => void;
  onLogout?: () => void;
}

export function MfaVerify({ onVerified, onLogout }: MfaVerifyProps) {
  const supabase = createClient();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError("Veuillez entrer un code à 6 chiffres.");
      return;
    }

    setLoading(true);
    setError("");

    const { data: factors } = await supabase.auth.mfa.listFactors();
    const totpFactor = factors?.totp?.[0];

    if (!totpFactor) {
      setError("Aucun facteur 2FA trouvé.");
      setLoading(false);
      return;
    }

    const challenge = await supabase.auth.mfa.challenge({
      factorId: totpFactor.id,
    });

    if (challenge.error) {
      setError(challenge.error.message);
      setLoading(false);
      return;
    }

    const verify = await supabase.auth.mfa.verify({
      factorId: totpFactor.id,
      challengeId: challenge.data.id,
      code,
    });

    if (verify.error) {
      setError("Code incorrect. Réessayez.");
      setLoading(false);
      return;
    }

    toast.success("Vérification réussie !");
    onVerified();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && code.length === 6 && !loading) {
      handleVerify();
    }
  };

  return (
    <div className="space-y-6" onKeyDown={handleKeyDown}>
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-forest/10">
          <Shield className="size-6 text-forest" />
        </div>
        <h3 className="text-lg font-semibold text-forest-deep">
          Validation en deux étapes
        </h3>
        <p className="text-sm text-muted-foreground">
          Entrez le code à 6 chiffres depuis votre application d'authentification
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Code Input */}
      <div className="flex justify-center">
        <InputOTP
          maxLength={6}
          value={code}
          onChange={(value) => {
            setCode(value);
            setError("");
          }}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Button
          type="button"
          variant="gold"
          className="w-full"
          onClick={handleVerify}
          disabled={loading || code.length !== 6}
        >
          {loading ? (
            <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            "Vérifier"
          )}
        </Button>

        {onLogout && (
          <button
            type="button"
            className="text-sm text-muted-foreground hover:text-forest transition-colors mx-auto block"
            onClick={onLogout}
          >
            Se déconnecter
          </button>
        )}
      </div>
    </div>
  );
}
