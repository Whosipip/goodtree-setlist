import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Calendar, Music, AlertCircle, Clock } from "lucide-react";
import { format, differenceInDays } from "date-fns";

interface Service {
  id: string;
  service_date: string;
  service_time: string | null;
  status: string;
}

interface Song {
  id: string;
  title: string;
  usage_count: number;
  category: string;
}

interface Alert {
  id: string;
  message: string;
  alert_type: string;
  created_at: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [nextService, setNextService] = useState<Service | null>(null);
  const [weekServices, setWeekServices] = useState<Service[]>([]);
  const [topSongs, setTopSongs] = useState<Song[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchDashboardData();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin/auth");
      return;
    }
    setUser(session.user);
  };

  const fetchDashboardData = async () => {
    try {
      const { data: services } = await supabase.from("services").select("*").gte("service_date", new Date().toISOString().split('T')[0]).order("service_date", { ascending: true }).limit(1);
      if (services && services.length > 0) setNextService(services[0]);

      const today = new Date();
      const weekFromNow = new Date();
      weekFromNow.setDate(today.getDate() + 7);
      const { data: weekData } = await supabase.from("services").select("*").gte("service_date", today.toISOString().split('T')[0]).lte("service_date", weekFromNow.toISOString().split('T')[0]).order("service_date", { ascending: true });
      setWeekServices(weekData || []);

      const { data: songsData } = await supabase.from("songs").select("*").order("usage_count", { ascending: false }).limit(5);
      setTopSongs(songsData || []);

      const { data: alertsData } = await supabase.from("team_alerts").select("*").order("created_at", { ascending: false }).limit(5);
      setAlerts(alertsData || []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/admin/auth");
  };

  const getDaysUntil = (date: string) => differenceInDays(new Date(date), new Date());

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b flex items-center px-6">
            <SidebarTrigger />
            <div className="ml-auto flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{user?.email}</span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}><LogOut className="w-4 h-4 mr-2" />Sign Out</Button>
            </div>
          </header>
          <main className="flex-1 p-8">
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              <Card className="lg:col-span-2">
                <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5" />Next Service</CardTitle></CardHeader>
                <CardContent>{nextService ? (<div><div className="text-4xl font-bold mb-2">{getDaysUntil(nextService.service_date)} days</div><p className="text-muted-foreground mb-4">{format(new Date(nextService.service_date), "EEEE, MMMM d, yyyy")}{nextService.service_time && ` at ${nextService.service_time}`}</p><Badge>{nextService.status}</Badge></div>) : <p className="text-muted-foreground">No upcoming services</p>}</CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><AlertCircle className="w-5 h-5" />Team Alerts</CardTitle></CardHeader>
                <CardContent>{alerts.length === 0 ? <p className="text-muted-foreground text-sm">No alerts</p> : <div className="space-y-3">{alerts.map((alert) => (<div key={alert.id} className="text-sm border-l-2 border-primary pl-3"><p>{alert.message}</p><p className="text-xs text-muted-foreground mt-1">{format(new Date(alert.created_at), "MMM d, h:mm a")}</p></div>))}</div>}</CardContent>
              </Card>
            </div>
            <Card className="mb-8">
              <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5" />This Week's Services</CardTitle></CardHeader>
              <CardContent>{weekServices.length === 0 ? <p className="text-muted-foreground">No services this week</p> : <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{weekServices.map((s) => (<div key={s.id} className="p-4 border rounded-lg"><p className="font-medium">{format(new Date(s.service_date), "EEEE, MMM d")}</p>{s.service_time && <p className="text-sm text-muted-foreground">{s.service_time}</p>}<Badge variant="outline" className="mt-2">{s.status}</Badge></div>))}</div>}</CardContent>
            </Card>
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader><CardTitle>Quick Service Editor</CardTitle></CardHeader>
                <CardContent className="space-y-4"><Button className="w-full" onClick={() => navigate("/admin/services")}><Calendar className="w-4 h-4 mr-2" />Manage Services</Button><Button variant="outline" className="w-full" onClick={() => navigate("/admin/setlists")}><Music className="w-4 h-4 mr-2" />Edit Setlists</Button></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Music className="w-5 h-5" />Most Sung Songs</CardTitle></CardHeader>
                <CardContent>{topSongs.length === 0 ? <p className="text-muted-foreground text-sm">No song data yet</p> : <div className="space-y-3">{topSongs.map((song, i) => (<div key={song.id} className="flex items-center justify-between"><div className="flex items-center gap-3"><span className="text-lg font-bold text-muted-foreground">{i + 1}</span><div><p className="font-medium text-sm">{song.title}</p><Badge variant="outline" className="text-xs">{song.category}</Badge></div></div><Badge>{song.usage_count}×</Badge></div>))}</div>}</CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;