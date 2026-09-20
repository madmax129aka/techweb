import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import { Input, Textarea, Select } from "../../components/ui/Input";
import { api } from "../../lib/api";

export default function RegistrationTeamPortal() {
  const [registrations, setRegistrations] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [reason, setReason] = useState("");

  const [lookupQuery, setLookupQuery] = useState("");
  const [lookupResults, setLookupResults] = useState([]);

  // Excel export states
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [exporting, setExporting] = useState(false);

  // Load events for export dropdown
  useEffect(() => {
    api
      .get("/api/events")
      .then((data) => setEvents(data.events || []))
      .catch((err) => console.error("Failed to load events:", err));
  }, []);

  const load = () => {
    setLoading(true);
    const query = filter ? `?status=${filter}` : "";
    api
      .get(`/api/registrations${query}`)
      .then((data) => setRegistrations(data.registrations || []))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const approve = async (id) => {
    try {
      await api.patch(`/api/registrations/${id}/approve`);
      toast.success("Registration approved");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const reject = async () => {
    try {
      await api.patch(`/api/registrations/${rejectTarget}/reject`, { reason });
      toast.success("Registration rejected");
      setRejectTarget(null);
      setReason("");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const runLookup = async (e) => {
    e.preventDefault();
    if (!lookupQuery.trim()) return;
    try {
      const data = await api.get(`/api/registrations/lookup?q=${encodeURIComponent(lookupQuery)}`);
      setLookupResults(data.registrations || []);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const exportEventParticipants = async () => {
    if (!selectedEvent) {
      toast.error("Please select an event");
      return;
    }

    setExporting(true);
    try {
      const token = localStorage.getItem("techastra_token");
      const response = await fetch(
        `${api.baseUrl}/api/registration-team/export/${selectedEvent}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      
      // Get event name for filename
      const event = events.find((e) => e.id === selectedEvent);
      const eventName = event ? event.name.replace(/[^a-z0-9]/gi, "-") : "event";
      a.download = `${eventName}-participants-${new Date().toISOString().slice(0, 10)}.xlsx`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Excel file exported successfully");
    } catch (err) {
      toast.error(err.message || "Failed to export Excel file");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="font-heading text-3xl font-bold mb-6">Registration Team Portal</h1>

      <Card className="mb-8">
        <h2 className="font-heading font-semibold mb-3">Lost-ID Lookup</h2>
        <form onSubmit={runLookup} className="flex gap-3">
          <Input
            placeholder="Search by name, register no., email, or reg code"
            value={lookupQuery}
            onChange={(e) => setLookupQuery(e.target.value)}
          />
          <Button type="submit">Search</Button>
        </form>
        {lookupResults.length > 0 && (
          <div className="mt-4 space-y-2">
            {lookupResults.map((r) => (
              <div key={r.id} className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-2 text-sm">
                <span>{r.user.name} · {r.registrationCode} · {r.user.email}</span>
                <Badge status={r.status} />
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="mb-8">
        <h2 className="font-heading font-semibold mb-3">Export Event Participants</h2>
        <p className="text-sm text-white/60 mb-4">
          Download Excel file with all participants for a specific event (name, email, phone, college, team details, status, transaction info)
        </p>
        <div className="flex gap-3">
          <Select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="flex-1"
          >
            <option value="">Select Event</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </Select>
          <Button
            onClick={exportEventParticipants}
            disabled={!selectedEvent || exporting}
          >
            {exporting ? "Exporting..." : "Export Excel"}
          </Button>
        </div>
      </Card>

      <div className="flex gap-3 mb-6">
        {["pending", "approved", "rejected"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${filter === s ? "bg-cyan text-void" : "bg-white/5 text-white/70"}`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-white/50">Loading...</p>
      ) : registrations.length === 0 ? (
        <p className="text-white/50">No {filter} registrations.</p>
      ) : (
        <div className="space-y-3">
          {registrations.map((r) => (
            <Card key={r.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{r.user.name} <span className="text-white/40 text-sm">({r.registrationCode})</span></p>
                <p className="text-sm text-white/60">{r.user.email} · {r.collegeName}</p>
                <p className="text-sm text-white/60">Txn ID: {r.transactionId} · ₹{r.totalAmount}</p>
                {r.paymentProofUrl && (
                  <a href={`${api.baseUrl}${r.paymentProofUrl}`} target="_blank" rel="noreferrer" className="text-cyan text-sm underline">
                    View payment screenshot
                  </a>
                )}
                {r.rejectionReason && <p className="text-sm text-danger mt-1">Reason: {r.rejectionReason}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Badge status={r.status} />
                {r.status === "pending" && (
                  <>
                    <Button size="sm" onClick={() => approve(r.id)}>Approve</Button>
                    <Button size="sm" variant="danger" onClick={() => setRejectTarget(r.id)}>Reject</Button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!rejectTarget} onClose={() => setRejectTarget(null)} title="Reject Registration">
        <Textarea
          rows={3}
          placeholder="Reason for rejection"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <Button className="w-full mt-4" variant="danger" onClick={reject}>Confirm Reject</Button>
      </Modal>
    </div>
  );
}
