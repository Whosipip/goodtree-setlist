import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Music, ArrowLeft } from "lucide-react";

const ADMIN_EMAIL = "Tiffanyobad@gtis.edu.ph";
const ACCOUNT_FLAG = "gtmt_admin_initialized";

const Auth = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Admin Sign In | Good Tree Music";
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/admin");
        return;
      }
      // Detect first-time setup: try a dummy sign-in; if account doesn't exist,
      // signup will succeed → we know we are in setup mode.
      // Simpler: use a localStorage flag set after first successful setup.
      setIsFirstTime(!localStorage.getItem(ACCOUNT_FLAG));
      setChecking(false);
    })();
  }, [navigate]);

  const handleFirstTimeSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Use at least 6 characters.", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error: signUpErr } = await supabase.auth.signUp({
        email: ADMIN_EMAIL,
        password,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      if (signUpErr && !/already/i.test(signUpErr.message)) throw signUpErr;

      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password,
      });
      if (signInErr) throw signInErr;

      localStorage.setItem(ACCOUNT_FLAG, "1");
      toast({ title: "Password saved", description: "Use this password to sign in from now on." });
      navigate("/admin");
    } catch (err: any) {
      toast({ title: "Setup failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password,
      });
      if (error) {
        // If account doesn't exist (e.g. localStorage cleared), allow re-setup
        if (/invalid/i.test(error.message)) {
          setIsFirstTime(true);
          throw new Error("No account found. Please set a password.");
        }
        throw error;
      }
      localStorage.setItem(ACCOUNT_FLAG, "1");
      navigate("/admin");
    } catch (err: any) {
      toast({ title: "Sign-in failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return <div className="min-h-screen bg-gradient-hero flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-white/95 backdrop-blur-sm relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="absolute top-4 left-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>

        <div className="flex justify-center mb-4 mt-4">
          <div className="bg-primary/10 rounded-full p-3">
            <Music className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center mb-2">
          {isFirstTime ? "Set Your Admin Password" : "Admin Sign In"}
        </h1>
        <p className="text-center text-muted-foreground mb-6">
          {isFirstTime
            ? "Choose a password. You'll use this every time."
            : "Good Tree Music Team"}
        </p>

        {isFirstTime ? (
          <form onSubmit={handleFirstTimeSetup} className="space-y-4">
            <div>
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                required
                autoFocus
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="confirm">Confirm Password</Label>
              <Input
                id="confirm"
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Save Password & Continue"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
};

export default Auth;
