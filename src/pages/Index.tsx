import { useState } from "react";
import { Music } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { ServiceCard } from "@/components/ServiceCard";
import { HowToUse } from "@/components/HowToUse";
import { SongView } from "@/components/SongView";

const Index = () => {
  const [showSongs, setShowSongs] = useState(false);
  const [selectedService, setSelectedService] = useState<'sept10' | 'sept24' | 'oct1'>('sept10');

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

  const sept24Songs = [
    {
      title: "Mercy Is Falling (Song #253)",
      youtubeUrl: "https://www.youtube.com/watch?v=HXip3WshDog",
      lyrics: `Verse 1
  E       A 
Mercy is falling 
    E            B 
Is falling - is falling 
  E        A 
Mercy, it falls 
          C#m           B 
Like the sweet spring rain 
  E       A 
Mercy is falling 
     E          B   E 
Is falling all over me 

Chorus
  E 
Hey-oh 
     A          B 
I receive Your mercy 
 E 
Hey-oh 
     C#m         B 
I receive Your grace 
 E 
Hey-oh 
        A       B    E 
I will dance forevermore

Shared from Melody of Angels - Good Tree Church`
    }
  ];

  const oct1Songs = [
    {
      title: "Langit (Song #332)",
      youtubeUrl: "https://www.youtube.com/watch?v=lxtHtbrjsJ4",
      lyrics: `Verse 1
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

  const currentSongs = selectedService === 'sept10' ? sept10Songs : 
                      selectedService === 'sept24' ? sept24Songs : oct1Songs;

  // Date-based access control
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 4 = Thursday
  const currentDate = today.getDate();
  const currentMonth = today.getMonth(); // 0-based (8 = September)
  
  // Sept 10 lineup: accessible Thursday through Sept 12 (Thursday after)
  const canAccessSept10 = dayOfWeek >= 4 && !(currentMonth === 8 && currentDate >= 13);
  
  // Sept 24 lineup: accessible from Sept 11 through Sept 26 (Thursday after)
  const canAccessSept24 = currentMonth === 8 && currentDate >= 11 && currentDate <= 26;
  
  // Oct 1 lineup: accessible from Sept 25 through Oct 3 (Thursday after)
  const canAccessOct1 = (currentMonth === 8 && currentDate >= 25) || (currentMonth === 9 && currentDate <= 3);

  // Calculate dynamic stats
  const availableLineups = (canAccessSept10 ? 1 : 0) + 1 + 1; // Sept 24 and Oct 1 are always visible
  const accessibleLineups = (canAccessSept10 ? 1 : 0) + (canAccessSept24 ? 1 : 0) + (canAccessOct1 ? 1 : 0);
  const totalSongs = (canAccessSept10 ? sept10Songs.length : 0) + (canAccessSept24 ? sept24Songs.length : 0) + (canAccessOct1 ? oct1Songs.length : 0);

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
          
          {canAccessSept10 && (
            <ServiceCard
              date="Sept. 10"
              title="Wednesday Praise and Worship"
              status="upcoming"
              songCount={1}
              onClick={() => {
                setSelectedService('sept10');
                setShowSongs(true);
              }}
            />
          )}

          <ServiceCard 
            date="Sept. 24"
            title="Wednesday Praise and Worship"
            status="upcoming"
            songCount={1}
            onClick={canAccessSept24 ? () => {
              setSelectedService('sept24');
              setShowSongs(true);
            } : undefined}
            locked={!canAccessSept24}
          />

          <ServiceCard 
            date="Oct. 1"
            title="Wednesday Praise and Worship"
            status="upcoming"
            songCount={1}
            onClick={canAccessOct1 ? () => {
              setSelectedService('oct1');
              setShowSongs(true);
            } : undefined}
            locked={!canAccessOct1}
          />

          <HowToUse />
        </div>
      </div>
    </div>
  );
};

export default Index;
