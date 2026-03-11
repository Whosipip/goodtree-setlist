import { useState } from "react";
import { Music } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { ServiceCard } from "@/components/ServiceCard";
import { HowToUse } from "@/components/HowToUse";
import { SongView } from "@/components/SongView";

const Index = () => {
  const [showSongs, setShowSongs] = useState(false);
  const mar16Songs = [
    {
      title: "Thank You, Lord",
      youtubeUrl: "https://www.youtube.com/watch?v=sax4aTgZ9dw",
      lyrics: `[Intro]
F – C – Bb2 – C  (2x)

[Verse 1]
F                       C
I  come before You today,
Gm                              Dm7
And there's just one thing that  I  want to say
Bb         C      Bb         C
Thank You Lord,  Thank  You Lord

F                          C
For all You've given to  me,
Gm                             Dm7
For all the blessings that   I   cannot see
Bb         C      Bb         C
Thank You Lord,  Thank  You Lord

[Refrain]
F                       C
With a grateful heart,          with a song of praise
Dm                      Bb
With an outstretched arm,        I will bless Your name

[Chorus]
F            C                  Bb           C
Thank You Lord, I just want to  thank You Lord
F            C          Bb
Thank You Lord, I just want to  thank You
C
Lord,
            F   C   Bb2  C        Bb2
Thank You Lord

[Verse 2]
F                         C
For all you've done in my  life,
Gm                     Dm7
You took my darkness and gave me Your light
Bb         C      Bb         C
Thank You Lord,  Thank  You Lord

F                      C
You took my sin and my shame
Gm                     Dm7
You took my sickness and heal all my pain
Bb         C      Bb         C
Thank You Lord,  Thank  You Lord

(Refrain)
(Chorus)

[Instrumental] Verse Chords

(Link)
(Chorus 2x – Two Frets Higher) G – Cm9 – Dm9 – etc`
    },
    {
      title: "Salamat Salamat",
      youtubeUrl: "https://www.youtube.com/watch?v=O4ByQgAScSs",
      lyrics: `[Intro]
F Am Gm C
F Am Gm C

[Verse 1]
F               Am            Gm
KUNG AKING MAMASDAN ANG KALAWAKAN
           C
HINDI KO MAUNAWAAN
F              Am               Gm
 ANG IYONG DAHILAN KUNG BAKIT AKO'Y
             C
PINILI MO'T INAALAGAAN

[Pre-Chorus]
Am             Dm
 DI KO KAYANG ISIPIN
           Am             Dm
HINDING HINDI KO KAYANG SUKATIN
Gm            Am
 ANG PAG-IBIG MO HESUS
   Bb             C
NA'YONG BINIGAY SAKIN

[Chorus]
Bb
 SALAMAT, SALAMAT
    Am              Dm
O HESUS SA PAG-IBIG MO
Gm                 C              F          Gm   F
 WALANG IBANG NAGMAHAL SAKIN NG KATULAD MO
Bb
 SALAMAT, SALAMAT
    Am              Dm
O HESUS SA PAG-IBIG MO
Gm            C
 AKO'Y MAGSASAYA SA PILING MO

F Am Gm C

[Verse 2]
F                 Am          Gm
KUNG MAY PAGSUBOK MAN O KAGIPITAN
           C
AKO AY MAY LALAPITAN
F           Am             Gm
 IKAW HESUS ANG AKING SANDIGAN
              C
HINDI MO KO PABABAYAAN

[Pre-Chorus]
Am             Dm
 DI KO KAYANG ISIPIN
           Am             Dm
HINDING HINDI KO KAYANG SUKATIN
Gm            Am
 ANG PAG-IBIG MO HESUS
   Bb             C
NA'YONG BINIGAY SAKIN

[Chorus]
Bb
 SALAMAT, SALAMAT
    Am              Dm
O HESUS SA PAG-IBIG MO
Gm                 C              F          Gm   F
 WALANG IBANG NAGMAHAL SAKIN NG KATULAD MO
Bb
 SALAMAT, SALAMAT
    Am              Dm
O HESUS SA PAG-IBIG MO
Gm            C
 AKO'Y MAGSASAYA SA PILING MO

[Bridge]
Bb            Am
BUHAY KO NG PURIHIN KA
Gm            C
BUHAY KO NG SAYO'Y SUMAMBA
  Bb              Am
WALA NG IBANG NANAISIN PA
        Gm        C
KUNDI PASALAMATAN KA

Bb            Am
BUHAY KO NG PURIHIN KA
Gm            C
BUHAY KO NG SAYO'Y SUMAMBA
  Bb              Am
WALA NG IBANG NANAISIN PA
        Gm        C
KUNDI PASALAMATAN KA

Bb            Am
BUHAY KO NG PURIHIN KA
Gm            C
BUHAY KO NG SAYO'Y SUMAMBA
  Bb              Am
WALA NG IBANG NANAISIN PA
        Gm        C
KUNDI PASALAMATAN KA

Gm   F

[Chorus]
Bb
 SALAMAT, SALAMAT
    Am              Dm
O HESUS SA PAG-IBIG MO
Gm                 C              F          Gm   F
 WALANG IBANG NAGMAHAL SAKIN NG KATULAD MO
Bb
 SALAMAT, SALAMAT
    Am              Dm
O HESUS SA PAG-IBIG MO
Gm            C
 AKO'Y MAGSASAYA SA PILING MO

Gm F

Bb
 SALAMAT, SALAMAT
    Am              Dm
O HESUS SA PAG-IBIG MO
Gm                 C              F          Gm   F
 WALANG IBANG NAGMAHAL SAKIN NG KATULAD MO
Bb
 SALAMAT, SALAMAT
    Am              Dm
O HESUS SA PAG-IBIG MO
Gm            C
 AKO'Y MAGSASAYA SA PILING MO

F Am Gm C
F Am Gm C`
    }
  ];

  const currentSongs = mar16Songs;

  // Calculate dynamic stats
  const availableLineups = 1;
  const accessibleLineups = 1;
  const totalSongs = mar16Songs.length;

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
            date="Mar. 19"
            title="Thanksgiving Praise and Worship"
            status="upcoming"
            songCount={2}
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
