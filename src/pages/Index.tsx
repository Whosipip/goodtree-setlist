import { useEffect, useState } from "react";
import { Music } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { StatsCard } from "@/components/StatsCard";
import { ServiceCard } from "@/components/ServiceCard";
import { HowToUse } from "@/components/HowToUse";
import { BottomNav } from "@/components/BottomNav";

interface SongRow {
  title: string;
  youtube_url: string | null;
  lyrics: string | null;
}

interface ServiceLineup {
  id: string;
  service_date: string;
  songs: SongRow[];
}

const Index = () => {
  const [lineups, setLineups] = useState<ServiceLineup[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Good Tree Music Team — Chords & Lyrics";
    loadLineups();
  }, []);

  const loadLineups = async () => {
    const today = format(new Date(), "yyyy-MM-dd");
    const { data: services } = await supabase
      .from("services")
      .select("id,service_date,setlists(position,song_time,songs(title,youtube_url,lyrics))")
      .gte("service_date", today)
      .order("service_date");

    const mapped: ServiceLineup[] = (services || []).map((s: any) => ({
      id: s.id,
      service_date: s.service_date,
      songs: (s.setlists || [])
        .sort((a: any, b: any) => a.position - b.position)
        .map((sl: any) => sl.songs)
        .filter(Boolean),
    }));
    setLineups(mapped);
  };

  const totalSongs = lineups.reduce((sum, l) => sum + l.songs.length, 0);

  return (
    <div className="min-h-screen bg-gradient-hero pb-24">
      <div className="text-center pt-8 pb-6">
        <div className="flex justify-center mb-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
            <Music className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Good Tree Music Team</h1>
        <p className="text-white/80 text-lg">Choose a service to view chords and lyrics</p>
      </div>

      <div className="px-4 mb-8">
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          <StatsCard number={lineups.length.toString()} label="Upcoming" />
          <StatsCard number={lineups.filter((l) => l.songs.length > 0).length.toString()} label="With Songs" />
          <StatsCard number={totalSongs.toString()} label="Total Songs" />
        </div>
      </div>

      <div className="px-4 pb-8">
        <div className="max-w-md mx-auto space-y-6">
          {lineups.length === 0 ? (
            <p className="text-center text-white/80">No upcoming services scheduled yet.</p>
          ) : (
            lineups.map((lineup) => {
              const date = parseISO(lineup.service_date);
              return (
                <ServiceCard
                  key={lineup.id}
                  date={format(date, "MMM d, yyyy")}
                  title={`${format(date, "EEEE")} Praise & Worship`}
                  status="upcoming"
                  songCount={lineup.songs.length}
                  locked={false}
                  onClick={() => navigate(`/service/${lineup.id}`)}
                />
              );
            })
          )}
          <HowToUse />
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Index;
