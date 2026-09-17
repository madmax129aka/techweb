import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import SlidePanel from "../ui/SlidePanel";
import Button from "../ui/Button";
import { Label, Input, Textarea } from "../ui/Input";
import { api } from "../../lib/api";
import { usePanels } from "../../context/PanelContext";

const EMPTY_FORM = { name: "", email: "", message: "" };

/**
 * Help Desk query form as a slide-in panel rather than a dedicated /help
 * route - per the "forms as overlays" pattern. Submit button is named for
 * the action ("Send Query"), not a generic "Submit".
 */
export default function HelpDeskPanel() {
  const { activePanel, closePanel } = usePanels();
  const open = activePanel === "help";

  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
      setSent(false);
    }
  }, [open]);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/api/help", form);
      setSent(true);
      toast.success("Query submitted. We'll get back to you soon.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SlidePanel open={open} onClose={closePanel} eyebrow="Help Desk" title="Have a Question?">
      {sent ? (
        <div className="text-center py-10">
          <p className="text-success text-sm mb-6">Thanks! Your query has been received.</p>
          <Button onClick={closePanel}>Done</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="help-name">Name</Label>
            <Input id="help-name" required value={form.name} onChange={(e) => update("name", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="help-email">Email</Label>
            <Input id="help-email" type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="help-message">Message</Label>
            <Textarea id="help-message" rows={5} required value={form.message} onChange={(e) => update("message", e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Sending..." : "Send Query"}
          </Button>
        </form>
      )}
    </SlidePanel>
  );
}
