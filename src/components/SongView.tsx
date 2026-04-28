import { useEffect, useState } from "react";
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

const transposeKey = (title: string) => `transpose:${title.trim().toLowerCase()}`;

export const SongView = ({ songs, onClose }: SongViewProps) => {
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [transpose, setTransposeState] = useState(0);

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
    <div className="fixed inset-0 bg-gradient-hero z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header with controls */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <Button
            onClick={onClose}
            variant="outline"
            size="icon"
            className="text-primary border-primary hover:bg-primary hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="flex items-center space-x-2">
            <Button
              onClick={prevSong}
              variant="outline"
              size="icon"
              className="text-primary border-primary hover:bg-primary hover:text-white"
              disabled={songs.length <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <span className="text-sm text-gray-600 min-w-[60px] text-center">
              {currentSongIndex + 1} of {songs.length}
            </span>

            <Button
              onClick={nextSong}
              variant="outline"
              size="icon"
              className="text-primary border-primary hover:bg-primary hover:text-white"
              disabled={songs.length <= 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="text-primary border-primary hover:bg-primary hover:text-white px-3 py-1 text-sm"
            >
              Set Key
            </Button>
            
            <div className="flex items-center space-x-1">
              <Button
                onClick={() => setTranspose(transpose - 1)}
                variant="outline"
                size="icon"
                className="text-primary border-primary hover:bg-primary hover:text-white h-8 w-8"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <Button
                onClick={() => setTranspose(transpose + 1)}
                variant="outline"
                size="icon"
                className="text-primary border-primary hover:bg-primary hover:text-white h-8 w-8"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            <Button
              variant="outline"
              className="text-primary border-primary hover:bg-primary hover:text-white px-3 py-1 text-sm"
            >
              Chords
            </Button>
          </div>
        </div>

        {/* Song title */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 text-center">{currentSong.title}</h2>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto">
          {/* YouTube Video */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Video</h3>
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
                src={currentSong.youtubeUrl.replace('watch?v=', 'embed/').split('&')[0]}
                className="w-full h-full rounded-lg"
                allowFullScreen
                title={currentSong.title}
              />
            </div>
          </div>

          {/* Lyrics and Chords */}
          <div className="p-4">
            <div 
              className="font-mono text-sm whitespace-pre-line leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: processLyrics(currentSong.lyrics)
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};