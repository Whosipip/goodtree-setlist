import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { ArrowLeft, Music, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SongView } from "@/components/SongView";
import { TeamRoster } from "@/components/TeamRoster";

interface SongRow {
  title: string;
  youtube_url: string | null;
  lyrics: string | null;
}

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [serviceDate, setServiceDate] = useState<string | null>(null);
  const [songs, setSongs] = useState<SongRow[]>([]);
  const [openSongs, setOpenSongs] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase
        .from("services")
        .select("service_date,setlists(position,songs(title,youtube_url,lyrics))")
        .eq("id", id)
        .maybeSingle();
      if (!data) return;
      setServiceDate(data.service_date);
      const list = ((data as any).setlists || [])
        .sort((a: any, b: any) => a.position - b.position)
        .map((sl: any) => sl.songs)
        .filter(Boolean);
      setSongs(list);
      document.title = `${format(parseISO(data.service_date), "MMM d")} Praise & Worship`;
    })();
  }, [id]);

  if (openSongs) {
    return (
      <SongView
        songs={songs.map((s) => ({
          title: s.title,
          lyrics: s.lyrics || "",
          youtubeUrl: s.youtube_url || "",
        }))}
        onClose={() => setOpenSongs(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero pb-24">
      <div className="px-4 pt-8 pb-6 max-w-2xl mx-auto">
        <Button variant="secondary" size="icon" onClick={() => navigate("/")} className="mb-4">
          <ArrowLeft className="w-4 h-4" />
        </Button>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">
            {serviceDate ? format(parseISO(serviceDate), "EEEE, MMMM d, yyyy") : "Service"}
          </h1>
          <p className="text-white/80">Praise &amp; Worship</p>
        </div>

        <Tabs defaultValue="lineup" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/20 backdrop-blur-sm">
            <TabsTrigger value="lineup" className="data-[state=active]:bg-white">
              <Music className="w-4 h-4 mr-2" /> Lineup
            </TabsTrigger>
            <TabsTrigger value="team" className="data-[state=active]:bg-white">
              <Users className="w-4 h-4 mr-2" /> Team
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lineup">
            <Card className="p-4 bg-white/95">
              {songs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No songs in this lineup yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {songs.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setOpenSongs(true)}
                      className="w-full text-left p-3 bg-muted hover:bg-primary/10 rounded font-medium text-sm transition-colors"
                    >
                      {i + 1}. {s.title}
                    </button>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="team">
            {id && <TeamRoster serviceId={id} editable={false} />}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ServiceDetail;
