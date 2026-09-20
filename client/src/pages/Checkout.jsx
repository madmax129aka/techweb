import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";
import { Label, Input } from "../components/ui/Input";
import { api } from "../lib/api";
import { useCart } from "../context/CartContext";
import { REGISTRATION_DRAFT_KEY } from "./Register";

/**
 * Payment step - step 2 of the routed Register -> Checkout flow (see the
 * hand-off note in Register.jsx). Reads the draft left in sessionStorage
 * by Register.jsx; if it's missing (e.g. this URL was opened directly,
 * or the tab was restarted), sends the user back to /register rather than
 * rendering a broken payment form with no registrant details.
 */
export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();

  const [draft, setDraft] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [transactionId, setTransactionId] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem(REGISTRATION_DRAFT_KEY);
    if (!raw) {
      toast.error("Your registration details were lost - please start again");
      navigate("/register");
      return;
    }
    const parsed = JSON.parse(raw);
    setDraft(parsed);

    api
      .get(`/api/upi/qr?amount=${total}&note=${encodeURIComponent(parsed.form.email || "TechAstra")}`)
      .then((data) => setQrDataUrl(data.qrDataUrl))
      .catch(() => toast.error("Failed to generate payment QR"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitTransaction = async (e) => {
    e.preventDefault();
    if (!transactionId.trim()) return toast.error("Enter the UPI transaction ID");
    if (!draft) return;

    setSubmitting(true);
    try {
      const { mode, form, teamName, members } = draft;
      const teamMembers =
        mode === "team" ? [{ name: form.name, regNo: form.registerNo, role: "lead" }, ...members] : null;

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("phone", form.phone || "");
      formData.append("password", form.password);
      formData.append("collegeName", form.collegeName || "");
      formData.append("registerNo", form.registerNo || "");
      formData.append("teamName", mode === "team" ? teamName : "");
      if (teamMembers) formData.append("teamMembers", JSON.stringify(teamMembers));
      formData.append("eventIds", JSON.stringify(items.map((i) => i.id)));
      formData.append("transactionId", transactionId.trim());
      if (screenshot) formData.append("paymentProof", screenshot);

      const data = await api.post("/api/registrations", formData, { isFormData: true });

      sessionStorage.removeItem(REGISTRATION_DRAFT_KEY);
      clearCart();
      toast.success(`Registration submitted! Code: ${data.registration.registrationCode}`);
      navigate(`/status?code=${data.registration.registrationCode}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!draft) return null; // redirecting to /register, see effect above

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className="text-center mb-10 animate-cinematic-fade">
        <p className="text-arc text-[11px] tracking-cinematic uppercase mb-4">Step 2 of 2</p>
        <h1 className="font-serif text-3xl sm:text-4xl text-offwhite">Complete Your Payment</h1>
      </div>

      <div className="text-center mb-8 border border-crimson/15 p-6">
        <p className="text-offwhite/50 text-sm mb-3">Scan to pay via any UPI app</p>
        {qrDataUrl ? (
          <img src={qrDataUrl} alt="UPI payment QR" className="mx-auto bg-white p-3 w-48 h-48" />
        ) : (
          <div className="w-48 h-48 mx-auto bg-white/5 animate-pulse" />
        )}
        <p className="font-serif text-2xl text-crimson-light mt-4">&#8377;{total}</p>
        <p className="text-xs text-offwhite/40 mt-1">Reference: {draft.form.email}</p>
      </div>

      <form onSubmit={submitTransaction} className="space-y-6">
        <div>
          <Label htmlFor="txn-id">UPI Transaction ID</Label>
          <Input
            id="txn-id"
            required
            placeholder="e.g. 123456789012"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="txn-screenshot">Payment Screenshot (optional)</Label>
          <input
            id="txn-screenshot"
            type="file"
            accept="image/*"
            onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
            className="block w-full text-sm text-offwhite/70"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/register")} data-log="checkout-back-to-details" className="sm:flex-none">
            Back to Details
          </Button>
          <Button type="submit" className="flex-1" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Transaction ID"}
          </Button>
        </div>
      </form>
    </div>
  );
}
