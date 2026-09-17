import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import Card from "../../../components/ui/Card";
import { api } from "../../../lib/api";

const COLORS = ["#3DD9EB", "#8B5CF6", "#22C55E", "#F59E0B", "#EF4444", "#60A5FA"];

function StatCard({ label, value }) {
  return (
    <Card className="text-center">
      <p className="text-xs text-white/50 uppercase mb-1">{label}</p>
      <p className="font-heading text-3xl font-bold text-cyan">{value}</p>
    </Card>
  );
}

export default function AnalyticsTab() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/api/admin/analytics").then(setData).catch(() => {});
  }, []);

  if (!data) return <p className="text-white/50">Loading analytics...</p>;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <StatCard label="Total Registrations" value={data.totalRegistrations} />
        <StatCard label="Approved" value={data.approved} />
        <StatCard label="Pending" value={data.pending} />
        <StatCard label="Rejected" value={data.rejected} />
        <StatCard label="Revenue" value={`₹${data.revenue}`} />
      </div>

      <Card>
        <h3 className="font-heading font-semibold mb-4">Registrations Over Time</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data.registrationsOverTime}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" fontSize={12} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
            {/* BUG FIX: this tooltip was hardcoded to #161B2E - a navy
                shade unrelated to the site's shared dark red/charcoal
                palette (the same category of bug found in the mega-menu -
                see index.css's theme-tokens comment). Recharts requires
                real inline style values here (no Tailwind classes), so
                it references the shared CSS variable instead. */}
            <Tooltip contentStyle={{ background: "var(--color-bg-elevated)", border: "1px solid rgba(255,255,255,0.1)" }} />
            <Line type="monotone" dataKey="count" stroke="#3DD9EB" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-heading font-semibold mb-4">Per-Event Headcount</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.perEventHeadcount} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={12} />
              <YAxis dataKey="eventName" type="category" width={140} stroke="rgba(255,255,255,0.5)" fontSize={11} />
              <Tooltip contentStyle={{ background: "var(--color-bg-elevated)", border: "1px solid rgba(255,255,255,0.1)" }} />
              <Bar dataKey="seatsTaken" fill="#3DD9EB" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="font-heading font-semibold mb-4">College-wise Breakdown</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data.perCollegeStats}
                dataKey="count"
                nameKey="college"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ college }) => college}
              >
                {data.perCollegeStats.map((entry, i) => (
                  <Cell key={entry.college} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--color-bg-elevated)", border: "1px solid rgba(255,255,255,0.1)" }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
