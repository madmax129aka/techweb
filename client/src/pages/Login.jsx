import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Label, Input } from "../components/ui/Input";
import { useAuth } from "../context/AuthContext";

const PORTAL_PATH = {
  registration_team: "/registration-team",
  coordinator: "/coordinator",
  hospitality: "/hospitality",
  certificate_team: "/certificates",
  volunteer: "/volunteer",
  master_admin: "/admin",
  participant: "/dashboard",
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}`);
      navigate(PORTAL_PATH[user.role] || "/dashboard");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="font-heading text-3xl font-bold mb-2 text-center">Login</h1>
      <p className="text-white/60 text-center mb-8 text-sm">
        Participants can only log in once their registration is approved.
      </p>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
