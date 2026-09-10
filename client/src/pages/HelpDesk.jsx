import React, { useState } from "react";
import toast from "react-hot-toast";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Label, Input, Textarea } from "../components/ui/Input";
import { api } from "../lib/api";

export default function HelpDesk() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

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
    <div className="max-w-lg mx-auto px-6 py-16">
      <h1 className="font-heading text-3xl font-bold mb-2 text-center">Help Desk</h1>
      <p className="text-white/60 text-center mb-8 text-sm">
        Have a question or ran into an issue? Send us a message.
      </p>

      <Card>
        {sent ? (
          <p className="text-center text-success">Thanks! Your query has been received.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" required value={form.name} onChange={(e) => update("name", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" rows={4} required value={form.message} onChange={(e) => update("message", e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Query"}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
