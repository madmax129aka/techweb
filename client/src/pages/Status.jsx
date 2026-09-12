import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { Label, Input } from "../components/ui/Input";
import { api } from "../lib/api";

/**
 * Minimal, borderless cinematic layout replacing the old boxed-Card
 * form - plain typography over the dark base, result revealed inline
 * beneath the form with a thin divider rather than a second card.
 */
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
    <div className="max-w-md mx-auto px-6 py-20">
      <div className="text-center mb-12 animate-cinematic-fade">
        <p className="text-arc text-[11px] tracking-cinematic uppercase mb-4">My Dashboard</p>
        <h1 className="font-serif text-3xl sm:text-4xl text-offwhite">Check Registration Status</h1>
      </div>

      <form onSubmit={check} className="space-y-5">
        <div>
          <Label htmlFor="code">Registration Code</Label>
          <Input id="code" placeholder="SYM2026-0042" value={code} onChange={(e) => setCode(e.target.value)} />
        </div>
        <p className="text-center text-offwhite/30 text-[11px] uppercase tracking-wider">&mdash; or &mdash;</p>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Checking..." : "Check Status"}
        </Button>
      </form>

      {result && (
        <div className="mt-12 pt-8 border-t border-crimson/15 animate-cinematic-fade">
          <div className="flex items-center justify-between mb-4">
            <span className="font-heading text-lg text-offwhite">{result.registrationCode}</span>
            <Badge status={result.status}>{result.status}</Badge>
          </div>
          <p className="text-sm text-offwhite/50">Total Amount: &#8377;{result.totalAmount}</p>
          {result.status === "rejected" && result.rejectionReason && (
            <p className="text-sm text-danger mt-3">Reason: {result.rejectionReason}</p>
          )}
          {result.status === "approved" && (
            <div className="mt-6">
              <Link to="/login">
                <Button className="w-full">Log In Now</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
