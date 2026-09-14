import React, { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

export default function VolunteerPortal() {
  const { user } = useAuth();
  const [duty, setDuty] = useState(null);

  useEffect(() => {
    api.get("/api/volunteer/me").then((data) => setDuty(data)).catch(() => {});
  }, []);

  return (
    <div className="max-w-lg mx-auto px-6 py-16">
      <h1 className="font-heading text-3xl font-bold mb-2 text-center">Welcome, {user?.name}</h1>
      <p className="text-white/60 text-center mb-8 text-sm">Your duty assignment for this symposium</p>

      <Card className="text-center">
        {duty ? (
          <div className="space-y-3">
            <div>
              <p className="text-xs text-white/50 uppercase">Desk / Location</p>
              <p className="font-heading text-xl font-bold text-cyan">{duty.dutyDesk || "Not assigned yet"}</p>
            </div>
            <div>
              <p className="text-xs text-white/50 uppercase">Timing</p>
              <p className="font-semibold">{duty.dutyTiming || "TBA"}</p>
            </div>
            <div>
              <p className="text-xs text-white/50 uppercase">Role</p>
              <p className="font-semibold">{duty.dutyRole || "TBA"}</p>
            </div>
          </div>
        ) : (
          <p className="text-white/50">Loading your duty assignment...</p>
        )}
      </Card>
    </div>
  );
}
