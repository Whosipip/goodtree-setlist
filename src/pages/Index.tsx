import { useState } from "react";
import { Music } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { ServiceCard } from "@/components/ServiceCard";
import { HowToUse } from "@/components/HowToUse";
import { SongView } from "@/components/SongView";

const Index = () => {
  const [showSongs, setShowSongs] = useState(false);

  const songs = [
    {
      title: "Salamat, Salamat (Song #342)",
      youtubeUrl: "https://www.youtube.com/watch?v=Z_2sCkjESDg",
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

Verse 2
Kung may pagsubok man o kagipitan
Ako ay may lalapitan
Ikaw Hesus ang aking sandigan
Hindi Mo ko pababayaan

Bridge
A                              E/G# 
Buhay ko na ang purihin Ka
F#m                                         B
Buhay ko na ang sa 'Yo ay sumamba 
A                          E/G#
Wala ng ibang nanaisin pa
             F#m                   B 
Kundi pasalamatan Ka

Shared from Melody of Angels - Good Tree Church`
    },
    {
      title: "Give You My Heart (Song #144)",
      youtubeUrl: "https://www.youtube.com/watch?v=9bQY2komrnA",
      lyrics: `Verse 1
G          D/F# Em
This is my desire
   C  G   D/F#
To honor You
Em            D/F# G 
Lord with all my heart 
          F    C - D
I worship You

G          D/F# Em
All I have within me
  C    G       D/F#
I give You praise
Em         D/F# G 
All that I adore
      F    C - D 
Is in You

Chorus
G                  D/F#
Lord I give You my heart
              Am
I give You my soul
  C        D      G
I live for You alone
                   D/F#
Every breath that I take
                  Am
Every moment I'm awake
     C         D      CM7  
Lord have Your way in me

Shared from Melody of Angels - Good Tree Church`
    }
  ];

  if (showSongs) {
    return <SongView songs={songs} onClose={() => setShowSongs(false)} />;
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
          <StatsCard number="1" label="Upcoming" />
          <StatsCard number="2" label="With Songs" />
          <StatsCard number="2" label="Total Songs" />
        </div>
      </div>

      {/* Available Lineups Section */}
      <div className="px-4 pb-8">
        <div className="max-w-md mx-auto space-y-6">
          <h2 className="text-xl font-semibold text-white mb-4">Available Lineups</h2>
          
          <ServiceCard 
            date="Aug 13"
            title="Wednesday Praise and Worship"
            status="upcoming"
            songCount={2}
            onClick={() => setShowSongs(true)}
          />

          <HowToUse />
        </div>
      </div>
    </div>
  );
};

export default Index;
