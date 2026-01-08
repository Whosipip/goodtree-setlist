import { useState } from "react";
import { Music } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { ServiceCard } from "@/components/ServiceCard";
import { HowToUse } from "@/components/HowToUse";
import { SongView } from "@/components/SongView";

const Index = () => {
  const [showSongs, setShowSongs] = useState(false);
  const jan14Songs = [
    {
      title: "Community Song",
      youtubeUrl: "",
      lyrics: `[Verse 1]
 D
It's I, It's I, It's I, who builds community
                        A
It's I, It's I, It's I, who builds community
                        D
It's I, It's I, It's I, who builds community
                                G                               A7     D – D7
It's I, who builds community

La la la…..

[Chorus]
                   G                                    D
Roll over the ocean, roll over the sea
                A                                                                  D – A – D
Go and do your part and build community
                    G                                    D
Roll over the ocean, roll over the sea
                A                                                              D – A – D
Go and do your part and build community

*YOU  *US  *LOVE  *CHRIST`
    }
  ];

  const currentSongs = jan14Songs;

  // Calculate dynamic stats
  const availableLineups = 1;
  const accessibleLineups = 1;
  const totalSongs = jan14Songs.length;

  if (showSongs) {
    return <SongView songs={currentSongs} onClose={() => setShowSongs(false)} />;
  }
  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
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
          <StatsCard number={availableLineups.toString()} label="Upcoming" />
          <StatsCard number={accessibleLineups.toString()} label="With Songs" />
          <StatsCard number={totalSongs.toString()} label="Total Songs" />
        </div>
      </div>

      {/* Available Lineups Section */}
      <div className="px-4 pb-8">
        <div className="max-w-md mx-auto space-y-6">
          <h2 className="text-xl font-semibold text-white mb-4">Available Lineups</h2>
          
          <ServiceCard
            date="Jan. 14"
            title="Tuesday Praise and Worship"
            status="upcoming"
            songCount={1}
            onClick={() => {
              setShowSongs(true);
            }}
          />

          <HowToUse />
        </div>
      </div>
    </div>
  );
};

export default Index;
