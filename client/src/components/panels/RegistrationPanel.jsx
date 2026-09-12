import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import SlidePanel from "../ui/SlidePanel";
import Button from "../ui/Button";
import { Label, Input } from "../ui/Input";
import { api } from "../../lib/api";
import { useCart } from "../../context/CartContext";
import { usePanels } from "../../context/PanelContext";

/**
 * The full registration flow (details -> payment) as a single slide-in
 * panel instead of two separate routed pages (the old /register and
 * /checkout), per the "forms as overlays, not pages" brief - the user
 * never leaves whatever page they were browsing.
 *
 * Internally this is still two steps ("details" then "payment"), but
 * both live inside one panel with its own step state rather than a
 * sessionStorage hand-off between two routes.
 */
export default function RegistrationPanel() {
  const { items, total, clearCart } = useCart();
  const { activePanel, closePanel } = usePanels();
  const navigate = useNavigate();
  const open = activePanel === "registration";

  const [step, setStep] = useState("details");
  const [mode, setMode] = useState("individual");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", collegeName: "", registerNo: "" });
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState([{ name: "", regNo: "", role: "member" }]);

  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [transactionId, setTransactionId] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const anyTeamEvent = items.some((i) => i.isTeamEvent);

  // Reset the panel back to a clean slate every time it's freshly opened.
  useEffect(() => {
    if (open) {
      setStep("details");
      setTransactionId("");
      setScreenshot(null);
    }
  }, [open]);

  const updateForm = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const updateMember = (idx, key, value) =>
    setMembers((prev) => prev.map((m, i) => (i === idx ? { ...m, [key]: value } : m)));
  const addMember = () => setMembers((prev) => [...prev, { name: "", regNo: "", role: "member" }]);
  const removeMember = (idx) => setMembers((prev) => prev.filter((_, i) => i !== idx));

  const goToPayment = (e) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Your cart is empty");
      closePanel();
      return navigate("/events");
    }
    if (!form.name || !form.email || !form.password) {
      return toast.error("Name, email and password are required");
    }
    if (mode === "team" && (!teamName || members.some((m) => !m.name || !m.regNo))) {
      return toast.error("Fill in the team name and all member details");
    }

    api
      .get(`/api/upi/qr?amount=${total}&note=${encodeURIComponent(form.email || "TechAstra")}`)
      .then((data) => setQrDataUrl(data.qrDataUrl))
      .catch(() => toast.error("Failed to generate payment QR"));

    setStep("payment");
  };

  const submitTransaction = async (e) => {
    e.preventDefault();
    if (!transactionId.trim()) return toast.error("Enter the UPI transaction ID");

    setSubmitting(true);
    try {
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

      clearCart();
      closePanel();
      toast.success(`Registration submitted! Code: ${data.registration.registrationCode}`);
      navigate(`/status?code=${data.registration.registrationCode}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SlidePanel
      open={open}
      onClose={closePanel}
      eyebrow={step === "details" ? "Registration" : "Payment"}
      title={step === "details" ? "Register for TechAstra" : "Complete Your Payment"}
    >
      {step === "details" ? (
        <>
          <p className="text-offwhite/50 text-sm mb-8">
            {items.length} event(s) selected &middot; Total &#8377;{total}
          </p>

          <div className="flex gap-3 mb-8">
            <button
              onClick={() => setMode("individual")}
              className={`px-4 py-2 text-xs uppercase tracking-wide ${mode === "individual" ? "bg-cyan text-void" : "border border-crimson/20 text-offwhite/70"}`}
              data-log="registration-mode-individual"
            >
              Individual
            </button>
            <button
              onClick={() => setMode("team")}
              className={`px-4 py-2 text-xs uppercase tracking-wide ${mode === "team" ? "bg-cyan text-void" : "border border-crimson/20 text-offwhite/70"}`}
              data-log="registration-mode-team"
            >
              Team {anyTeamEvent ? "" : "(optional)"}
            </button>
          </div>

          <form onSubmit={goToPayment} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="reg-name">Full Name</Label>
                <Input id="reg-name" required value={form.name} onChange={(e) => updateForm("name", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="reg-email">Email</Label>
                <Input id="reg-email" type="email" required value={form.email} onChange={(e) => updateForm("email", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="reg-phone">Phone</Label>
                <Input id="reg-phone" value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="reg-password">Password (for post-approval login)</Label>
                <Input id="reg-password" type="password" required value={form.password} onChange={(e) => updateForm("password", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="reg-college">College Name</Label>
                <Input id="reg-college" value={form.collegeName} onChange={(e) => updateForm("collegeName", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="reg-regno">Register Number</Label>
                <Input id="reg-regno" value={form.registerNo} onChange={(e) => updateForm("registerNo", e.target.value)} />
              </div>
            </div>

            {mode === "team" && (
              <div className="border-t border-crimson/10 pt-6">
                <h3 className="text-offwhite text-sm uppercase tracking-wide mb-4">Team Details</h3>
                <div className="mb-4">
                  <Label htmlFor="reg-team-name">Team Name</Label>
                  <Input id="reg-team-name" required value={teamName} onChange={(e) => setTeamName(e.target.value)} />
                </div>
                <p className="text-xs text-offwhite/50 mb-2 uppercase tracking-wide">Team Members</p>
                <div className="space-y-3">
                  {members.map((m, idx) => (
                    <div key={idx} className="flex gap-3 items-end">
                      <Input placeholder="Name" value={m.name} onChange={(e) => updateMember(idx, "name", e.target.value)} />
                      <Input placeholder="Register No." value={m.regNo} onChange={(e) => updateMember(idx, "regNo", e.target.value)} />
                      <button type="button" className="text-danger text-xs px-2" onClick={() => removeMember(idx)}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" size="sm" className="mt-3" onClick={addMember}>
                  + Add Member
                </Button>
              </div>
            )}

            <Button type="submit" size="lg" className="w-full">
              Continue to Payment
            </Button>
          </form>
        </>
      ) : (
        <>
          <div className="text-center mb-8 border border-crimson/15 p-6">
            <p className="text-offwhite/50 text-sm mb-3">Scan to pay via any UPI app</p>
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="UPI payment QR" className="mx-auto bg-white p-3 w-48 h-48" />
            ) : (
              <div className="w-48 h-48 mx-auto bg-white/5 animate-pulse" />
            )}
            <p className="font-serif text-2xl text-crimson-light mt-4">&#8377;{total}</p>
            <p className="text-xs text-offwhite/40 mt-1">Reference: {form.email}</p>
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

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setStep("details")} data-log="registration-back-to-details">
                Back to Details
              </Button>
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Transaction ID"}
              </Button>
            </div>
          </form>
        </>
      )}
    </SlidePanel>
  );
}
