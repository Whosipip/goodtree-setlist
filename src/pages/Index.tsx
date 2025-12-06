import { useState } from "react";
import { Music } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { ServiceCard } from "@/components/ServiceCard";
import { HowToUse } from "@/components/HowToUse";
import { SongView } from "@/components/SongView";

const Index = () => {
  const [showSongs, setShowSongs] = useState(false);
  const [currentService, setCurrentService] = useState<'dec10' | 'dec18'>('dec10');

  const dec10Songs = [
    {
      title: "Faith",
      youtubeUrl: "https://www.youtube.com/watch?v=GOr46CLT2-Q",
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

  const dec18Songs = [
    {
      title: "Hark the Herald Angels Sing",
      youtubeUrl: "https://www.youtube.com/watch?v=xqooC4ZG75Y",
      lyrics: `[Verse 1]
 G                     D      G     C      G   D    G
Hark the herald angels sing, "Glory to the new born King
                   Em    A7    D               A7   D
Peace on earth and mercy mild, God and sinners reconciled"
 G            D7  G   D     G                D7  G   D
Joyful all ye nations rise, join the triumph of the skies
 C       G   Am   E7  Am     D7        G           D  G
With angelic host proclaim, "Christ is born in Bethlehem"
 C          G   Am E7  Am     D7    G          D7    G
Hark the herald angels sing, "Glory to the new born King"
 
 
[Verse 2]
 G                         D       G         C   G  D    G
Christ, by highest heaven adored; Christ the everlasting Lord;
               Em        A7   D                A7       D
Late in time behold him come, offspring of the virgin's womb
 G                   D7 G    D    G                  D7 G  D
Veiled in flesh, the Godhead see; hail the incarnate De-i-ty
C                G    Am  E7  Am    D7     G       D  G
Pleased, as man, with men to dwell, Jesus, our Immanuel
 C          G   Am E7  Am     D7    G          D7    G
Hark the herald angels sing, "Glory to the new born King"
 
 
[Verse 3]
 G                              D      G        C      G   D    G
Hail! the heaven-born Prince of Peace! Hail the Son of Righteousness!
                  Em     A7      D                  A7     D
Light and life to all He brings, risen with healing in His wings
G                D7  G D   G                D7   G   D
Mild He lays His glory by, born that man no more may die
C             G   Am   E7  Am    D7       G          D    G
Born to raise the sons of earth, born to give them second birth
 C          G   Am E7  Am     D7    G          D7    G
Hark the herald angels sing, "Glory to the new born King"`
    },
    {
      title: "Angels We Have Heard on High",
      youtubeUrl: "https://www.youtube.com/watch?v=rRHuETZuLEo",
      lyrics: `[Verse 1]
G                       D
Angels we have heard on high
G                         D
Sweetly singing o'er the plains
G                     D
And the mountains in reply
Em                    D
Echoing their joyous strains

G                       D
Shepherds, why this jubilee
G                          D
Why your joyous strains prolong
G                         D
What the gladsome tidings be
G                           D
Which inspire your heav'nly song

[Chorus]
G  C  Am  D  G  C   D
Glo-- -----  -----  ria
G           D
In excelsis deo

[Verse 2]
G                     D
Come to Bethlehem and see
G                              D
Christ whose birth the angels sing
G                      D
Come, adore on bended knee
G                            D
Christ the Lord, the newborn King`
    }
  ];

  const currentSongs = currentService === 'dec10' ? dec10Songs : dec18Songs;

  // Calculate dynamic stats
  const availableLineups = 2;
  const accessibleLineups = 2;
  const totalSongs = dec10Songs.length + dec18Songs.length;

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
            date="Dec. 10"
            title="Wednesday Praise and Worship"
            status="upcoming"
            songCount={1}
            onClick={() => {
              setCurrentService('dec10');
              setShowSongs(true);
            }}
          />

          <ServiceCard
            date="Dec. 18-19"
            title="Christmas Praise and Worship"
            status="upcoming"
            songCount={2}
            onClick={() => {
              setCurrentService('dec18');
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
