import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Textarea, Select } from "../components/ui/Input";
import IdCard from "../components/IdCard";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [registration, setRegistration] = useState(null);
  const [events, setEvents] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [feedbackEventId, setFeedbackEventId] = useState("");
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState("");
  const cardRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    api.get("/api/registrations/mine").then((data) => setRegistration(data.registration)).catch(() => {});
    api.get("/api/certificates/mine").then((data) => setCertificates(data.certificates || [])).catch(() => {});
    api.get("/api/events").then((data) => setEvents(data.events || [])).catch(() => {});
  }, [user]);

  const downloadIdCard = async () => {
    if (!cardRef.current) return;

    // Wait for web fonts (Orbitron/Space Grotesk/Inter) and the logo/QR
    // images to finish loading before snapshotting - otherwise the
    // capture can happen mid-layout-shift and come out misaligned.
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: "#07070A",
      scale: 3,
      useCORS: true,
      logging: false,
      width: cardRef.current.offsetWidth,
      height: cardRef.current.offsetHeight,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: canvas.height >= canvas.width ? "portrait" : "landscape",
      unit: "px",
      format: [canvas.width, canvas.height],
    });
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(`${user?.name || "TechAstra"}-ID-Card.pdf`);
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackEventId) return toast.error("Select an event");
    try {
      await api.post("/api/feedback", { eventId: feedbackEventId, userId: user.id, rating: Number(rating), comments });
      toast.success("Thanks for your feedback!");
      setComments("");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="font-heading text-3xl font-bold mb-2">Welcome, {user?.name}</h1>
      <p className="text-white/60 mb-8">{user?.collegeName}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="font-heading text-xl font-semibold mb-4">Your Digital ID Card</h2>
          <IdCard
            ref={cardRef}
            registration={registration || { registrationCode: "Pending sync" }}
            user={user}
            events={events.filter((e) => registration?.eventIds?.includes?.(e.id))}
          />
          <Button className="w-full mt-4" onClick={downloadIdCard}>Download as PDF</Button>
          <p className="text-xs text-white/40 mt-2 text-center">
            Show this QR at event check-in and food counters.
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="font-heading text-xl font-semibold mb-3">Your Certificates</h2>
            {certificates.length === 0 ? (
              <p className="text-white/50 text-sm">No certificates issued yet. Check back after your events conclude.</p>
            ) : (
              <ul className="space-y-2">
                {certificates.map((c) => (
                  <li key={c.id} className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-2">
                    <span className="text-sm capitalize">{c.type} — {c.certificateCode}</span>
                    {c.pdfUrl && (
                      <a href={`${api.baseUrl}${c.pdfUrl}`} target="_blank" rel="noreferrer" className="text-gold-light text-sm underline">
                        Download
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <h2 className="font-heading text-xl font-semibold mb-3">Event Feedback</h2>
            <form onSubmit={submitFeedback} className="space-y-3">
              <Select value={feedbackEventId} onChange={(e) => setFeedbackEventId(e.target.value)}>
                <option value="">Select an event</option>
                {events.map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </Select>
              <Select value={rating} onChange={(e) => setRating(e.target.value)}>
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>{n} Star{n > 1 ? "s" : ""}</option>
                ))}
              </Select>
              <Textarea rows={3} placeholder="Comments (optional)" value={comments} onChange={(e) => setComments(e.target.value)} />
              <Button type="submit" className="w-full">Submit Feedback</Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
