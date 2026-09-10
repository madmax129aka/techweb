import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Label, Input } from "../components/ui/Input";
import { api } from "../lib/api";
import { useCart } from "../context/CartContext";

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [draft, setDraft] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [transactionId, setTransactionId] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("techastra_reg_draft");
    if (!raw || items.length === 0) {
      toast.error("Please complete the registration form first");
      navigate("/register");
      return;
    }
    setDraft(JSON.parse(raw));
  }, [items, navigate]);

  useEffect(() => {
    if (!draft) return;
    api
      .get(`/api/upi/qr?amount=${total}&note=${encodeURIComponent(draft.email || "TechAstra")}`)
      .then((data) => setQrDataUrl(data.qrDataUrl))
      .catch(() => toast.error("Failed to generate payment QR"));
  }, [draft, total]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!transactionId.trim()) return toast.error("Enter the UPI transaction ID");

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", draft.name);
      formData.append("email", draft.email);
      formData.append("phone", draft.phone || "");
      formData.append("password", draft.password);
      formData.append("collegeName", draft.collegeName || "");
      formData.append("registerNo", draft.registerNo || "");
      formData.append("teamName", draft.teamName || "");
      if (draft.teamMembers) formData.append("teamMembers", JSON.stringify(draft.teamMembers));
      formData.append("eventIds", JSON.stringify(items.map((i) => i.id)));
      formData.append("transactionId", transactionId.trim());
      if (screenshot) formData.append("paymentProof", screenshot);

      const data = await api.post("/api/registrations", formData, { isFormData: true });

      sessionStorage.removeItem("techastra_reg_draft");
      clearCart();
      toast.success(`Registration submitted! Code: ${data.registration.registrationCode}`);
      navigate(`/status?code=${data.registration.registrationCode}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!draft) return null;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="font-heading text-3xl font-bold mb-6">Checkout</h1>

      <Card className="mb-6 text-center">
        <p className="text-white/60 mb-2">Scan to pay via any UPI app</p>
        {qrDataUrl ? (
          <img src={qrDataUrl} alt="UPI payment QR" className="mx-auto rounded-lg bg-white p-3 w-56 h-56" />
        ) : (
          <div className="w-56 h-56 mx-auto bg-white/5 rounded-lg animate-pulse" />
        )}
        <p className="font-heading text-2xl font-bold text-cyan mt-4">₹{total}</p>
        <p className="text-xs text-white/40 mt-1">Reference: {draft.email}</p>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <Label htmlFor="txnId">UPI Transaction ID</Label>
          <Input
            id="txnId"
            required
            placeholder="e.g. 123456789012"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
          />

          <div className="mt-4">
            <Label htmlFor="screenshot">Payment Screenshot (optional)</Label>
            <input
              id="screenshot"
              type="file"
              accept="image/*"
              onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
              className="block w-full text-sm text-white/70"
            />
          </div>
        </Card>

        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Registration"}
        </Button>
      </form>
    </div>
  );
}
