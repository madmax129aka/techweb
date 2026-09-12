import React, { useState } from "react";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { Label, Input } from "../components/ui/Input";
import { api } from "../lib/api";

/**
 * Same borderless cinematic treatment as Status.jsx - plain form,
 * result revealed below a thin divider instead of inside a second
 * boxed Card.
 */
export default function VerifyCertificate() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const verify = async (e) => {
    e.preventDefault();
    if (!code.trim()) return toast.error("Enter a certificate ID");
    setLoading(true);
    setResult(null);
    try {
      const data = await api.get(`/api/certificates/verify/${encodeURIComponent(code.trim())}`);
      setResult(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <div className="text-center mb-12 animate-cinematic-fade">
        <p className="text-arc text-[11px] tracking-cinematic uppercase mb-4">Authenticity Check</p>
        <h1 className="font-serif text-3xl sm:text-4xl text-offwhite">Verify Certificate</h1>
        <p className="text-offwhite/50 text-sm mt-4">
          Enter a certificate ID to confirm its authenticity.
        </p>
      </div>

      <form onSubmit={verify} className="space-y-5">
        <div>
          <Label htmlFor="code">Certificate ID</Label>
          <Input id="code" placeholder="CERT2026-000123" value={code} onChange={(e) => setCode(e.target.value)} />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Verifying..." : "Verify"}
        </Button>
      </form>

      {result && (
        <div className="mt-12 pt-8 border-t border-crimson/15 text-center animate-cinematic-fade">
          {result.valid ? (
            <>
              <Badge status="approved" className="mb-4">Valid Certificate</Badge>
              <p className="font-heading text-xl text-offwhite">{result.participantName}</p>
              <p className="text-offwhite/50 text-sm">{result.eventName}</p>
              <p className="text-offwhite/50 text-sm mb-3">{result.college}</p>
              <p className="text-xs text-arc capitalize">{result.type} Certificate</p>
              <p className="text-xs text-offwhite/35 mt-3">
                Issued {new Date(result.issuedAt).toLocaleDateString()}
              </p>
            </>
          ) : (
            <Badge status="rejected">Certificate Not Found</Badge>
          )}
        </div>
      )}
    </div>
  );
}
