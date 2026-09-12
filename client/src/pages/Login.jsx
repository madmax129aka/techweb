import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";
import CinematicImage from "../components/CinematicImage";
import { Label, Input } from "../components/ui/Input";
import { HERO_IMAGES } from "../lib/eventImages";
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
 * Cinematic split layout: a full-bleed themed photo on one side (hidden
 * on small screens, where the form alone fills the page), plain form on
 * the other - consistent with the photo-backdrop treatment used across
 * the rest of the site rather than the old centered boxed Card.
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
      {/* Photo backdrop - hidden below lg, where the form takes the full page */}
      <div className="relative hidden lg:block">
        <CinematicImage src={HERO_IMAGES.intro} alt="" accent="crimson" zoomOnHover={false} />
        <div className="relative z-10 h-full flex flex-col justify-end p-14">
          <p className="text-arc text-[11px] tracking-cinematic uppercase mb-4">TechAstra &middot; 2026</p>
          <h2 className="font-serif text-3xl text-offwhite leading-tight max-w-sm">
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
