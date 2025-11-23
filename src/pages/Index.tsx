import { useState } from "react";
import { Music } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { ServiceCard } from "@/components/ServiceCard";
import { HowToUse } from "@/components/HowToUse";
import { SongView } from "@/components/SongView";

const Index = () => {
  const [showSongs, setShowSongs] = useState(false);
  const [selectedService, setSelectedService] = useState<'nov25' | 'nov19'>('nov25');

  const nov25Songs = [
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

  const nov19Songs = [
    {
      title: "Trading My Sorrows (Song #377)",
      youtubeUrl: "https://www.youtube.com/watch?v=RvTg2WFTHyE",
      lyrics: `Verse 1
A         D               F#m  E  A       D               F#m  E
I'm trading my sorrow, I'm trading my shame
A        D                  F#m
I'm laying them down
                 E                 A-D-F#m-E
For the joy of the Lord
A          D                F#m  E  A      D            F#m  E
I'm trading my sickness, I'm trading my pain
A         D                 F#m
I'm laying them down
                  E             A-D-F#m-E
For the joy of the Lord

Chorus
                  A
We say Yes, Lord 
   D                F#m
Yes Lord, Yes Yes Lord
   A                  D             F#m         E
Yes Lord, Yes Lord, Yes Yes Lord
A
Amen

Verse 2
A                                     D
I'm pressed but not crushed
            F#m              E
Persecuted not abandoned
A                             D            F#m-E
Struck down but not destroyed
                 A                             D
I am blessed beyond the curse
                     F#m                 E
For His promise will endure
A                            D             F#m         E
That His joy is going to be my strength
E
Though my sorrows may last for the night
            G                             D
His joy comes with the morning

Shared from Melody of Angels - Good Tree Church`
    }
  ];

  const currentSongs = selectedService === 'nov25' ? nov25Songs : nov19Songs;

  // Date-based access control
  const canAccessNov25 = true; // Nov 25 is now accessible
  const canAccessNov19 = true;

  // Calculate dynamic stats
  const availableLineups = 2; // Both Nov 19 and Nov 25 are visible
  const accessibleLineups = (canAccessNov25 ? 1 : 0) + (canAccessNov19 ? 1 : 0);
  const totalSongs = (canAccessNov25 ? nov25Songs.length : 0) + (canAccessNov19 ? nov19Songs.length : 0);

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
          
          {canAccessNov25 && (
            <ServiceCard
              date="Nov. 25"
              title="Wednesday Praise and Worship"
              status="upcoming"
              songCount={1}
              onClick={() => {
                setSelectedService('nov25');
                setShowSongs(true);
              }}
            />
          )}

          <ServiceCard 
            date="Nov. 19"
            title="Wednesday Praise and Worship"
            status="upcoming"
            songCount={1}
            onClick={() => {
              setSelectedService('nov19');
              setShowSongs(true);
            }}
            locked={false}
          />

          <HowToUse />
        </div>
      </div>
    </div>
  );
};

export default Index;
