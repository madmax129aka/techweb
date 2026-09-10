import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { Label, Input } from "../components/ui/Input";
import { api } from "../lib/api";

export default function Status() {
  const [params] = useSearchParams();
  const [code, setCode] = useState(params.get("code") || "");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const check = async (e) => {
    e?.preventDefault();
    if (!code && !email) return toast.error("Enter a registration code or email");
    setLoading(true);
    setResult(null);
    try {
      const query = code ? `code=${encodeURIComponent(code)}` : `email=${encodeURIComponent(email)}`;
      const data = await api.get(`/api/registrations/status?${query}`);
      setResult(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.get("code")) check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-lg mx-auto px-6 py-12">
      <h1 className="font-heading text-3xl font-bold mb-6">Check Registration Status</h1>

      <Card>
        <form onSubmit={check} className="space-y-4">
          <div>
            <Label htmlFor="code">Registration Code</Label>
            <Input id="code" placeholder="SYM2026-0042" value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
          <p className="text-center text-white/40 text-sm">— or —</p>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Checking..." : "Check Status"}
          </Button>
        </form>
      </Card>

      {result && (
        <Card className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold">{result.registrationCode}</span>
            <Badge status={result.status}>{result.status}</Badge>
          </div>
          <p className="text-sm text-white/60">Total Amount: ₹{result.totalAmount}</p>
          {result.status === "rejected" && result.rejectionReason && (
            <p className="text-sm text-danger mt-2">Reason: {result.rejectionReason}</p>
          )}
          {result.status === "approved" && (
            <div className="mt-4">
              <Link to="/login">
                <Button className="w-full">Log In Now</Button>
              </Link>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
