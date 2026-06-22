import { useEffect, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, Minus, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Song {
  title: string;
  lyrics: string;
  youtubeUrl: string;
}

interface SongViewProps {
  songs: Song[];
  onClose: () => void;
}

const transposeKey = (title: string) => `transpose:${title.trim().toLowerCase()}`;

const getYouTubeId = (url: string): string | null => {
  if (!url) return null;
  const clean = url.split('&')[0];
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([\w-]{11})/,
    /(?:youtu\.be\/)([\w-]{11})/,
    /(?:youtube\.com\/embed\/)([\w-]{11})/,
    /(?:youtube\.com\/shorts\/)([\w-]{11})/,
  ];
  for (const p of patterns) {
    const m = clean.match(p);
    if (m) return m[1];
  }
  return null;
};

const SHARP_SCALE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_SCALE  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const NOTE_INDEX: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5,
  'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
};

export const SongView = ({ songs, onClose }: SongViewProps) => {
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [transpose, setTransposeState] = useState(0);
  const [showChords, setShowChords] = useState(true);
  const [useSharps, setUseSharps] = useState(true);

  const currentSong = songs[currentSongIndex];

  useEffect(() => {
    if (!currentSong) return;
    const saved = localStorage.getItem(transposeKey(currentSong.title));
    setTransposeState(saved ? parseInt(saved, 10) || 0 : 0);
  }, [currentSongIndex, currentSong?.title]);

  const setTranspose = (val: number) => {
    setTransposeState(val);
    if (currentSong) {
      localStorage.setItem(transposeKey(currentSong.title), String(val));
    }
  };

  const transposeChord = (chord: string) => {
    return chord.replace(/([A-G](?:#|b)?)/g, (note) => {
      const idx = NOTE_INDEX[note];
      if (idx === undefined) return note;
      const newIdx = (idx + transpose + 12) % 12;
      return useSharps ? SHARP_SCALE[newIdx] : FLAT_SCALE[newIdx];
    });
  };

  // Render lyrics: chord lines (lines that are mostly chord tokens) become chord chips,
  // other lines become lyric text. Section headers like [Verse 1] become badges.
  const renderLyrics = (lyrics: string) => {
    const lines = lyrics.split('\n');
    const chordLineRegex = /^[\s]*([A-G](?:#|b)?(?:m|maj|min|sus|add|dim|aug|7|9|11|13)*(?:\/[A-G](?:#|b)?)?[\s]*)+$/;
    const sectionRegex = /^\s*\[([^\]]+)\]\s*$/;

    // Matches chord tokens like G, Am, C#m7, Bb/D, Dsus4, F#maj7
    const chordToken = /\b[A-G](?:#|b)?(?:m|maj|min|sus|add|dim|aug|7|9|11|13)*(?:\/[A-G](?:#|b)?)?\b/g;

    return lines.map((line, i) => {
      const sec = line.match(sectionRegex);
      if (sec) {
        return (
          <div key={i} className="flex justify-center my-4">
            <span className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm font-semibold">
              {sec[1]}
            </span>
          </div>
        );
      }
      if (line.trim() === '') {
        return <div key={i} className="h-3" />;
      }
      const isChordOnly = chordLineRegex.test(line);

      // When chords are hidden, drop chord-only lines entirely and strip
      // inline chord tokens from lyric lines.
      if (!showChords) {
        if (isChordOnly) return null;
        const stripped = line.replace(chordToken, '').replace(/\s{2,}/g, ' ').trim();
        if (!stripped) return null;
        return (
          <p key={i} className="font-mono text-base text-foreground leading-relaxed mb-2">
            {stripped}
          </p>
        );
      }

      if (isChordOnly) {
        const chords = line.trim().split(/\s+/);
        return (
          <div key={i} className="flex flex-wrap gap-2 mb-1">
            {chords.map((c, j) => (
              <span
                key={j}
                className="bg-primary/10 text-primary font-bold px-2.5 py-1 rounded text-sm"
              >
                {transposeChord(c)}
              </span>
            ))}
          </div>
        );
      }
      return (
        <p key={i} className="font-mono text-base text-foreground leading-relaxed mb-2">
          {line}
        </p>
      );
    });
  };

  const nextSong = () => setCurrentSongIndex((p) => (p + 1) % songs.length);
  const prevSong = () => setCurrentSongIndex((p) => (p - 1 + songs.length) % songs.length);

  const transposeLabel = transpose === 0 ? 'Original' : (transpose > 0 ? `+${transpose}` : `${transpose}`);

  return (
    <div className="fixed inset-0 bg-gradient-hero z-50 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-32">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <Button onClick={onClose} variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-white font-medium">Praise &amp; Worship</h2>
          <span className="text-white font-semibold">{currentSongIndex + 1}</span>
        </div>

        {/* Title */}
        <h1 className="text-white text-3xl md:text-4xl font-bold text-center leading-tight mb-4">
          {currentSong.title}
        </h1>

        {/* Has chords pill */}
        <div className="flex justify-center mb-5">
          <span className="border border-emerald-300/60 text-emerald-100 bg-emerald-500/10 px-3 py-0.5 rounded-full text-sm">
            Has Chords
          </span>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3 mb-4">
          <button
            onClick={() => setShowChords((v) => !v)}
            className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            {showChords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showChords ? 'Hide' : 'Show'}
          </button>
          <button
            onClick={() => setUseSharps((v) => !v)}
            className="bg-white/15 hover:bg-white/25 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            {useSharps ? 'Sharps (#)' : 'Flats (b)'}
          </button>
        </div>

        {/* YouTube */}
        {(() => {
          const ytId = getYouTubeId(currentSong.youtubeUrl || '');
          if (!ytId) return null;
          return (
            <div className="mb-6">
              <div className="relative w-full overflow-hidden rounded-2xl shadow-xl" style={{ paddingTop: '56.25%' }}>
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${ytId}`}
                  title={currentSong.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="text-center mt-2">
                <a
                  href={`https://www.youtube.com/watch?v=${ytId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/90 hover:text-white underline text-sm break-all"
                >
                  https://www.youtube.com/watch?v={ytId}
                </a>
              </div>
            </div>
          );
        })()}

        {/* Transpose */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={() => setTranspose(transpose - 1)}
            className="bg-white/15 hover:bg-white/25 text-white rounded-full h-10 w-10 flex items-center justify-center"
          >
            <Minus className="h-4 w-4" />
          </button>
          <div className="text-center">
            <div className="text-white/80 text-xs">Transpose</div>
            <div className="text-white font-semibold">{transposeLabel}</div>
          </div>
          <button
            onClick={() => setTranspose(transpose + 1)}
            className="bg-white/15 hover:bg-white/25 text-white rounded-full h-10 w-10 flex items-center justify-center"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Lyric card */}
        <div className="bg-white rounded-2xl shadow-xl p-5 md:p-6">
          <div className="bg-muted/40 rounded-xl p-4 md:p-5">
            {renderLyrics(currentSong.lyrics || '')}
          </div>
        </div>

        {/* Bottom nav */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <Button
              onClick={prevSong}
              variant="ghost"
              disabled={songs.length <= 1}
              className="text-primary"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <div className="text-center text-sm">
              <div className="text-muted-foreground">Song</div>
              <div className="font-semibold">{currentSongIndex + 1} / {songs.length}</div>
            </div>
            <Button
              onClick={nextSong}
              variant="ghost"
              disabled={songs.length <= 1}
              className="text-primary"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
