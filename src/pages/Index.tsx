import { useState } from "react";
import { Music } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { ServiceCard } from "@/components/ServiceCard";
import { HowToUse } from "@/components/HowToUse";
import { SongView } from "@/components/SongView";

const Index = () => {
  const [showSongs, setShowSongs] = useState(false);
  const [currentService, setCurrentService] = useState<'dec3' | 'dec10'>('dec3');

  const dec3Songs = [
    {
      title: "Langit (Song #332)",
      youtubeUrl: "https://www.youtube.com/watch?v=lxtHtbrjsJ4",
      lyrics: `A & G
Verse 1
A                                                      C#m
Ang kailangan ko ay ang pag-ibig Mo 
     Bm                                     Esus
O Diyos sa buhay kong ito 
                                                        C#m
Ang kagalakan Mo ay kalakasan ko 
  Bm                    Esus
Ikaw ang nais ko 
           D                          C#m 
Ikaw lamang ang pupurihin
          Bm                             Esus 
Ang pangalan Mo'y dadakilain 
      D                             C#m
Wala na Sayo'y maihahambing 
                   Bm                          Esus
Ang awit ko'y Iyong dinggin 

Chorus
A                   C#m         Bm
Langit ang aking nadarama 
      E7                         A 
Sa twing kapiling Ka
              C#m                        Bm  
Ang puso ko'y sumisigla 
                  Esus
Kapag Sayo'y sumsamba

Shared from Melody of Angels - Good Tree Church`
    }
  ];

  const dec10Songs = [
    {
      title: "Faith",
      youtubeUrl: "https://www.youtube.com/watch?v=GOr46CLT2-Q&list=RDGOr46CLT2-Q&start_radio=1",
      lyrics: `[Verse 1]
Em
I'm reaching for the prize
I'm giving everything
Em                                                     B
I give my life for this, It's what I live for
Em
Nothing will keep me from
All that You have for me
Am   
You hold my head up high
      B
I live for You

[Pre-Chorus]
Em                 D                           C
Greater is He that's living in me
                             B
Than he that is in the world

[Chorus]
Em                                   B
Faith, I can move the mountain
                        Am                            B
I can do all things through Christ I know
Em                                   B
Faith, Standing and believing
                           Am
I can do all things
                                          B
Through Christ who strengthens me`
    }
  ];

  const currentSongs = currentService === 'dec3' ? dec3Songs : dec10Songs;

  // Calculate dynamic stats
  const availableLineups = 2;
  const accessibleLineups = 2;
  const totalSongs = dec3Songs.length + dec10Songs.length;

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
            date="Dec. 3"
            title="Wednesday Praise and Worship"
            status="upcoming"
            songCount={1}
            onClick={() => {
              setCurrentService('dec3');
              setShowSongs(true);
            }}
          />

          <ServiceCard
            date="Dec. 10"
            title="Wednesday Praise and Worship"
            status="upcoming"
            songCount={1}
            onClick={() => {
              setCurrentService('dec10');
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
