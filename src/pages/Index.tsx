import { Music, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { data: songs = [] } = useQuery({
    queryKey: ['public-songs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('song_number', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-6">
              <Music className="w-16 h-16 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Good Tree Music Team</h1>
          <p className="text-white/80 text-lg mb-8">Worship Service Management System</p>
          
          <Link to="/admin/auth">
            <Button 
              size="lg"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm"
            >
              Admin Access
            </Button>
          </Link>
        </div>

        {/* Song Library Display */}
        <div className="max-w-6xl mx-auto">
          <Card className="bg-white/90 backdrop-blur-sm border-white/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                <CardTitle>Song Library</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {songs.map((song) => (
                  <Card key={song.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-muted-foreground">
                              #{song.song_number}
                            </span>
                            <Badge variant={song.category === 'Worship' ? 'default' : 'secondary'}>
                              {song.category}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-lg">{song.title}</h3>
                        </div>
                      </div>
                      {song.last_used && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Last used: {new Date(song.last_used).toLocaleDateString()}
                        </p>
                      )}
                      {song.youtube_url && (
                        <a 
                          href={song.youtube_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline mt-1 inline-block"
                        >
                          Watch on YouTube
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              {songs.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No songs available yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
