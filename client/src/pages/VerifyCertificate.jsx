import React, { useState } from "react";
import toast from "react-hot-toast";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { Label, Input } from "../components/ui/Input";
import { api } from "../lib/api";

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
    <div className="max-w-lg mx-auto px-6 py-16">
      <h1 className="font-heading text-3xl font-bold mb-2 text-center">Verify Certificate</h1>
      <p className="text-white/60 text-center mb-8 text-sm">
        Enter a certificate ID to confirm its authenticity.
      </p>

      <Card>
        <form onSubmit={verify} className="space-y-4">
          <div>
            <Label htmlFor="code">Certificate ID</Label>
            <Input id="code" placeholder="CERT2026-000123" value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Verifying..." : "Verify"}
          </Button>
        </form>
      </Card>

      {result && (
        <Card className="mt-6 text-center">
          {result.valid ? (
            <>
              <Badge status="approved" className="mb-3">Valid Certificate</Badge>
              <p className="font-heading text-xl font-bold">{result.participantName}</p>
              <p className="text-white/60 text-sm">{result.eventName}</p>
              <p className="text-white/60 text-sm mb-2">{result.college}</p>
              <p className="text-xs text-cyan capitalize">{result.type} Certificate</p>
              <p className="text-xs text-white/40 mt-2">
                Issued {new Date(result.issuedAt).toLocaleDateString()}
              </p>
            </>
          ) : (
            <Badge status="rejected">Certificate Not Found</Badge>
          )}
        </Card>
      )}
    </div>
  );
}
