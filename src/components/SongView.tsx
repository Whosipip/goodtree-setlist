import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Plus, Minus, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Song {
  title: string;
  lyrics: string;
  youtubeUrl: string;
}

interface SongViewProps {
  songs: Song[];
  onClose: () => void;
}

export const SongView = ({ songs, onClose }: SongViewProps) => {
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [transpose, setTranspose] = useState(0);

  const currentSong = songs[currentSongIndex];

  const chordMap: { [key: string]: string[] } = {
    'C': ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
    'C#': ['C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C'],
    'D': ['D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#'],
    'D#': ['D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D'],
    'E': ['E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#'],
    'F': ['F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E'],
    'F#': ['F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F'],
    'G': ['G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#'],
    'G#': ['G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G'],
    'A': ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'],
    'A#': ['A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A'],
    'B': ['B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#']
  };

  const transposeChord = (chord: string) => {
    const baseChord = chord.replace(/m|7|sus|\/.*$/g, '');
    const suffix = chord.replace(baseChord, '');
    
    if (chordMap[baseChord]) {
      const transposedIndex = (chordMap[baseChord].indexOf(baseChord) + transpose + 12) % 12;
      return chordMap[baseChord][transposedIndex] + suffix;
    }
    return chord;
  };

  const processLyrics = (lyrics: string) => {
    return lyrics.replace(/([A-G]#?(?:m|7|sus|\/[A-G]#?)*)/g, (match) => {
      return `<span class="chord">${transposeChord(match)}</span>`;
    });
  };

  const nextSong = () => {
    setCurrentSongIndex((prev) => (prev + 1) % songs.length);
    setTranspose(0);
  };

  const prevSong = () => {
    setCurrentSongIndex((prev) => (prev - 1 + songs.length) % songs.length);
    setTranspose(0);
  };

  return (
    <div className="fixed inset-0 bg-gradient-hero z-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20 p-4">
        <div className="flex items-center justify-between mb-4">
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setTranspose(transpose - 1)}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 bg-primary/20"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-white font-medium min-w-[60px] text-center">
              {transpose > 0 ? `+${transpose}` : transpose}
            </span>
            <Button
              onClick={() => setTranspose(transpose + 1)}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 bg-primary/20"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Button
            onClick={prevSong}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 bg-primary/20"
            disabled={songs.length <= 1}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          
          <div className="text-center">
            <h2 className="text-lg font-semibold text-white">{currentSong.title}</h2>
            <p className="text-white/80 text-sm">
              {currentSongIndex + 1} of {songs.length}
            </p>
          </div>

          <Button
            onClick={nextSong}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 bg-primary/20"
            disabled={songs.length <= 1}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* YouTube Video */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-card border-0 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Video</h3>
            <a 
              href={currentSong.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-primary hover:text-primary-dark"
            >
              <Play className="h-4 w-4" />
              <span className="text-sm">Watch on YouTube</span>
            </a>
          </div>
          <div className="aspect-video">
            <iframe
              src={currentSong.youtubeUrl.replace('watch?v=', 'embed/')}
              className="w-full h-full rounded-lg"
              allowFullScreen
              title={currentSong.title}
            />
          </div>
        </Card>

        {/* Lyrics and Chords */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-card border-0 p-4">
          <h3 className="font-semibold text-foreground mb-4">Lyrics & Chords</h3>
          <div 
            className="font-mono text-sm whitespace-pre-line"
            dangerouslySetInnerHTML={{ 
              __html: processLyrics(currentSong.lyrics)
            }}
          />
        </Card>
      </div>
    </div>
  );
};