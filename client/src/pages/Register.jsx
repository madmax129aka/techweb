import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Label, Input } from "../components/ui/Input";
import { useCart } from "../context/CartContext";

export default function Register() {
  const { items, total } = useCart();
  const navigate = useNavigate();

  const [mode, setMode] = useState("individual"); // individual | team
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", collegeName: "", registerNo: "",
  });
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState([{ name: "", regNo: "", role: "member" }]);

  const anyTeamEvent = items.some((i) => i.isTeamEvent);

  const updateForm = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const updateMember = (idx, key, value) => {
    setMembers((prev) => prev.map((m, i) => (i === idx ? { ...m, [key]: value } : m)));
  };

  const addMember = () => setMembers((prev) => [...prev, { name: "", regNo: "", role: "member" }]);
  const removeMember = (idx) => setMembers((prev) => prev.filter((_, i) => i !== idx));

  const handleContinue = (e) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return navigate("/events");
    }
    if (!form.name || !form.email || !form.password) {
      return toast.error("Name, email and password are required");
    }
    if (mode === "team" && (!teamName || members.some((m) => !m.name || !m.regNo))) {
      return toast.error("Fill in the team name and all member details");
    }

    const registrationDraft = {
      ...form,
      teamName: mode === "team" ? teamName : null,
      teamMembers:
        mode === "team"
          ? [{ name: form.name, regNo: form.registerNo, role: "lead" }, ...members]
          : null,
    };

    sessionStorage.setItem("techastra_reg_draft", JSON.stringify(registrationDraft));
    navigate("/checkout");
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="font-heading text-3xl font-bold mb-2">Registration</h1>
      <p className="text-white/60 mb-6">
        {items.length} event(s) selected · Total ₹{total}. Go back to the{" "}
        <Link to="/cart" className="text-cyan underline">cart</Link> to change your selection.
      </p>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setMode("individual")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${mode === "individual" ? "bg-cyan text-base" : "bg-white/5 text-white/70"}`}
        >
          Individual
        </button>
        <button
          onClick={() => setMode("team")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${mode === "team" ? "bg-cyan text-base" : "bg-white/5 text-white/70"}`}
        >
          Team {anyTeamEvent ? "" : "(optional)"}
        </button>
      </div>

      <form onSubmit={handleContinue} className="space-y-6">
        <Card>
          <h3 className="font-heading font-semibold mb-4">
            {mode === "team" ? "Team Lead Details" : "Your Details"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" required value={form.name} onChange={(e) => updateForm("name", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={form.email} onChange={(e) => updateForm("email", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="password">Password (for post-approval login)</Label>
              <Input id="password" type="password" required value={form.password} onChange={(e) => updateForm("password", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="collegeName">College Name</Label>
              <Input id="collegeName" value={form.collegeName} onChange={(e) => updateForm("collegeName", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="registerNo">Register Number</Label>
              <Input id="registerNo" value={form.registerNo} onChange={(e) => updateForm("registerNo", e.target.value)} />
            </div>
          </div>
        </Card>

        {mode === "team" && (
          <Card>
            <h3 className="font-heading font-semibold mb-4">Team Details</h3>
            <div className="mb-4">
              <Label htmlFor="teamName">Team Name</Label>
              <Input id="teamName" required value={teamName} onChange={(e) => setTeamName(e.target.value)} />
            </div>

            <p className="text-sm text-white/60 mb-2">Team Members</p>
            <div className="space-y-3">
              {members.map((m, idx) => (
                <div key={idx} className="flex gap-3 items-end">
                  <div className="flex-1">
                    <Input placeholder="Name" value={m.name} onChange={(e) => updateMember(idx, "name", e.target.value)} />
                  </div>
                  <div className="flex-1">
                    <Input placeholder="Register No." value={m.regNo} onChange={(e) => updateMember(idx, "regNo", e.target.value)} />
                  </div>
                  <button
                    type="button"
                    className="text-danger text-sm px-2"
                    onClick={() => removeMember(idx)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" className="mt-3" onClick={addMember}>
              + Add Member
            </Button>
          </Card>
        )}

        <Button type="submit" size="lg" className="w-full">
          Continue to Payment
        </Button>
      </form>
    </div>
  );
}
