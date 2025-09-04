import { useState } from "react";
import { Music } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { ServiceCard } from "@/components/ServiceCard";
import { HowToUse } from "@/components/HowToUse";
import { SongView } from "@/components/SongView";

const Index = () => {
  const [showSongs, setShowSongs] = useState(false);
  const [selectedService, setSelectedService] = useState<'sept10' | 'sept17'>('sept10');

  const sept10Songs = [
    {
      title: "I'm Free (Song #294)",
      youtubeUrl: "https://www.youtube.com/watch?v=RKXQy3KhKOs",
      lyrics: `Chorus
         E                E
I'm free, I'm free, 
             B                                       E
I'm free to be a servant of the Lord (2x)

            A                          E
He taught me how to praise Him
            A                        E
He taught me how to sing a song
           A                    E
He taught how to love
           A                 B                     E
I'm free to be a servant of the Lord

Shared from Melody of Angels - Good Tree Church`
    }
  ];

  const sept17Songs = [
    {
      title: "Amazing Grace",
      youtubeUrl: "https://www.youtube.com/watch?v=CDdvReNKKuk",
      lyrics: `Verse 1
G                C           G
Amazing grace how sweet the sound
                    D
That saved a wretch like me
G              C        G
I once was lost but now am found
             D         G
Was blind but now I see

Shared from Melody of Angels - Good Tree Church`
    }
  ];

  const currentSongs = selectedService === 'sept10' ? sept10Songs : sept17Songs;

  // Check if it's Thursday or later for access restriction
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 4 = Thursday
  const canAccessSongs = dayOfWeek >= 4; // Thursday (4) and onwards

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
          <StatsCard number="2" label="Upcoming" />
          <StatsCard number="2" label="With Songs" />
          <StatsCard number="2" label="Total Songs" />
        </div>
      </div>

      {/* Available Lineups Section */}
      <div className="px-4 pb-8">
        <div className="max-w-md mx-auto space-y-6">
          <h2 className="text-xl font-semibold text-white mb-4">Available Lineups</h2>
          
          <ServiceCard
            date="Sept. 10"
            title="Wednesday Praise and Worship"
            status="upcoming"
            songCount={1}
            onClick={() => {
              if (canAccessSongs) {
                setSelectedService('sept10');
                setShowSongs(true);
              }
            }}
          />

          <ServiceCard 
            date="Sept. 17"
            title="Wednesday Praise and Worship"
            status="upcoming"
            songCount={1}
            onClick={() => {
              if (canAccessSongs) {
                setSelectedService('sept17');
                setShowSongs(true);
              }
            }}
          />

          <HowToUse />
        </div>
      </div>
    </div>
  );
};

export default Index;
