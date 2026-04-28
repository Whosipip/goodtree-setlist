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
const ADMIN_PASSWORD = "ffthea08";

const Auth = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Admin Sign In | Good Tree Music";
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/admin");
        return;
      }
      setChecking(false);
    })();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== ADMIN_PASSWORD) {
      toast({ title: "Incorrect password", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      let { error } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      });
      // If account doesn't exist yet, create it silently with the fixed password
      if (error && /invalid/i.test(error.message)) {
        const { error: signUpErr } = await supabase.auth.signUp({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (signUpErr && !/already/i.test(signUpErr.message)) throw signUpErr;
        const retry = await supabase.auth.signInWithPassword({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
        });
        if (retry.error) throw retry.error;
      } else if (error) {
        throw error;
      }
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
        <h1 className="text-2xl font-bold text-center mb-2">Admin Sign In</h1>
        <p className="text-center text-muted-foreground mb-6">Good Tree Music Team</p>

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
      </Card>
    </div>
  );
};

export default Auth;
