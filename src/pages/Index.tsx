import { useState } from "react";
import { Music } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { ServiceCard } from "@/components/ServiceCard";
import { HowToUse } from "@/components/HowToUse";
import { SongView } from "@/components/SongView";

const Index = () => {
  const [showSongs, setShowSongs] = useState(false);
  const [selectedService, setSelectedService] = useState<'oct29' | 'oct15'>('oct29');

  const oct29Songs = [
    {
      title: "Trading My Sorrow (Song #377)",
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

  const oct15Songs = [
    {
      title: "Salamat, Salamat (Song #342)",
      youtubeUrl: "https://www.youtube.com/watch?v=wIh4nMdhtvc",
      lyrics: `(Intro is only verse chords)
Verse 1
E                                  G#m                      A
Kung aking mamasdan ang kalawakan
                              B          E                   G#m
Hindi ko maunawaan ang Iyong dahilan
                      A                                     B  
Kung bakit ako'y pinili Mo't inalagaan

    G#m                   C#m   
* Di ko kayang isipin
                    G#m                         C#m
   Hinding hindi ko kayang sukatin
    A              E/G#
   Ang pag-ibig Mo Hesus 
            F#m                           B 
   Na 'Yong binigay sa akin

Chorus
A                   B
Salamat, Salamat 
         G#m                           C#m     
Oh! Hesus sa pag-ibig Mo
F#m                             B 
Walang ibang nagmahal sa akin na 
     E               E7 
Katulad Mo
A                   B
Salamat, Salamat 
         G#sus                         C#m
Oh! Hesus sa pag-ibig Mo
A                          B                     E
Ako'y magsasaya sa piling Mo

Shared from Melody of Angels - Good Tree Church`
    }
  ];

  const currentSongs = selectedService === 'oct29' ? oct29Songs : oct15Songs;

  // Date-based access control
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 4 = Thursday
  const currentDate = today.getDate();
  const currentMonth = today.getMonth(); // 0-based (8 = September)
  
  // Oct 15 lineup: accessible from Oct 10 (next Thursday) onwards
  const canAccessOct15 = currentMonth === 9 && currentDate >= 10;
  
  // Oct 29 lineup: accessible from Oct 23 onwards
  const canAccessOct29 = currentMonth === 9 && currentDate >= 23;

  // Calculate dynamic stats
  const availableLineups = 2; // Oct 29 and Oct 15
  const accessibleLineups = (canAccessOct29 ? 1 : 0) + (canAccessOct15 ? 1 : 0);
  const totalSongs = (canAccessOct29 ? oct29Songs.length : 0) + (canAccessOct15 ? oct15Songs.length : 0);

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
            date="Oct. 15"
            title="Wednesday Praise and Worship"
            status="upcoming"
            songCount={1}
            onClick={canAccessOct15 ? () => {
              setSelectedService('oct15');
              setShowSongs(true);
            } : undefined}
            locked={!canAccessOct15}
          />

          <ServiceCard 
            date="Oct. 29"
            title="Wednesday Praise and Worship"
            status="upcoming"
            songCount={1}
            onClick={canAccessOct29 ? () => {
              setSelectedService('oct29');
              setShowSongs(true);
            } : undefined}
            locked={!canAccessOct29}
          />

          <HowToUse />
        </div>
      </div>
    </div>
  );
};

export default Index;
