import { useState, useEffect } from "react";
import { Shield, Copy, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface MfaEnrollProps {
  onEnrolled: () => void;
  onCancelled?: () => void;
}

export function MfaEnroll({ onEnrolled, onCancelled }: MfaEnrollProps) {
  const supabase = createClient();
  const [factorId, setFactorId] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<"scan" | "verify">("scan");

  useEffect(() => {
    const enroll = async () => {
      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        issuer: "DanXome",
      });

      if (enrollError) {
        setError(enrollError.message);
        return;
      }

      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
    };

    enroll();
  }, [supabase]);

  const handleCopySecret = async () => {
    await navigator.clipboard.writeText(secret);
    setCopied(true);
    toast.success("Secret copié !");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async () => {
    if (verifyCode.length !== 6) {
      setError("Veuillez entrer un code à 6 chiffres.");
      return;
    }

    setLoading(true);
    setError("");

    const challenge = await supabase.auth.mfa.challenge({ factorId });
    if (challenge.error) {
      setError(challenge.error.message);
      setLoading(false);
      return;
    }

    const verify = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.data.id,
      code: verifyCode,
    });

    if (verify.error) {
      setError("Code incorrect. Réessayez.");
      setLoading(false);
      return;
    }

    toast.success("2FA activée avec succès !");
    onEnrolled();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-forest/10">
          <Shield className="size-6 text-forest" />
        </div>
        <h3 className="text-lg font-semibold text-forest-deep">
          Activer la validation en deux étapes
        </h3>
        <p className="text-sm text-muted-foreground">
          Scannez le QR code avec votre application d'authentification
          (Google Authenticator, Authy, 1Password...)
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Step 1: Scan QR Code */}
      {step === "scan" && (
        <div className="space-y-4">
          {/* QR Code */}
          <div className="flex justify-center">
            <div className="rounded-xl border-2 border-dashed border-forest/20 bg-white p-4">
              {qrCode ? (
                <img src={qrCode} alt="QR Code 2FA" className="size-48" />
              ) : (
                <div className="flex size-48 items-center justify-center">
                  <div className="size-8 animate-spin rounded-full border-2 border-forest border-t-transparent" />
                </div>
              )}
            </div>
          </div>

          {/* Manual entry */}
          <div className="space-y-2">
            <p className="text-center text-xs text-muted-foreground">
              Impossible de scanner ? Entrez le code manuellement :
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-md bg-muted px-3 py-2 text-xs font-mono break-all">
                {secret}
              </code>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopySecret}
                className="shrink-0"
              >
                {copied ? (
                  <CheckCircle className="size-4 text-green-600" />
                ) : (
                  <Copy className="size-4" />
                )}
              </Button>
            </div>
          </div>

          <Button
            type="button"
            variant="gold"
            className="w-full"
            onClick={() => setStep("verify")}
            disabled={!qrCode}
          >
            J'ai scanné le QR code
          </Button>
        </div>
      )}

      {/* Step 2: Verify Code */}
      {step === "verify" && (
        <div className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            Entrez le code à 6 chiffres affiché dans votre application :
          </p>

          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={verifyCode}
              onChange={(value) => {
                setVerifyCode(value);
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

          <div className="flex gap-3">
            {onCancelled && (
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onCancelled}
              >
                Annuler
              </Button>
            )}
            <Button
              type="button"
              variant="gold"
              className="flex-1"
              onClick={handleVerify}
              disabled={loading || verifyCode.length !== 6}
            >
              {loading ? (
                <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                "Activer la 2FA"
              )}
            </Button>
          </div>

          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-forest transition-colors mx-auto block"
            onClick={() => setStep("scan")}
          >
            ← Retour au QR code
          </button>
        </div>
      )}
    </div>
  );
}
