import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";
import TechAstraCore from "../components/TechAstraCore";
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

/**
 * Cinematic split layout - Section 5C's primary placement: the
 * "TechAstra Core" 3D orbiting-stone symbol is the centerpiece on one
 * side (hidden on small screens, where the form alone fills the page),
 * plain form on the other. Previously this side showed a themed photo
 * backdrop; that's been replaced by the 3D object per the brief
 * ("form on one side, 3D object on the other").
 */
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
    <div className="min-h-[calc(100vh-76px)] grid lg:grid-cols-2">
      {/* TechAstra Core centerpiece - hidden below lg, where the form
          takes the full page (the 3D object needs real room to breathe;
          it isn't worth shrinking down for a phone-width column). */}
      <div className="relative hidden lg:flex flex-col items-center justify-center bg-void overflow-hidden">
        {/* Ambient radial glow behind the object, echoing the core's own
            cyan/crimson attenuation colors - gives the object a "resting
            place" rather than floating on a flat void background. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 45%, rgba(34,211,238,0.12) 0%, rgba(170,5,5,0.08) 45%, transparent 75%)",
          }}
        />
        <div className="relative z-10">
          <TechAstraCore size={380} />
        </div>
        <div className="relative z-10 text-center px-14 mt-4">
          <p className="text-arc text-[11px] tracking-cinematic uppercase mb-4">TechAstra &middot; 2026</p>
          <h2 className="font-serif text-3xl text-offwhite leading-tight max-w-sm mx-auto">
            One symposium. Eight tracks. A single unforgettable day.
          </h2>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm animate-cinematic-fade">
          <p className="text-arc text-[11px] tracking-cinematic uppercase mb-4 text-center">Welcome Back</p>
          <h1 className="font-serif text-3xl sm:text-4xl text-offwhite mb-3 text-center">Login</h1>
          <p className="text-offwhite/50 text-sm mb-10 text-center leading-relaxed">
            Participants can only log in once their registration is approved.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <Link to="/status" className="link-cta justify-center" data-log="login-check-status">
              Check Registration Status
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
