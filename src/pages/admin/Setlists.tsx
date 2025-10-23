import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { format } from "date-fns";

interface Service {
  id: string;
  service_date: string;
  status: string;
}

interface Song {
  id: string;
  title: string;
  category: string;
  song_number: number | null;
}

interface SetlistItem {
  id: string;
  song_id: string;
  position: number;
  songs: Song;
}

const Setlists = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedService, setSelectedService] = useState<string>("");
  const [setlist, setSetlist] = useState<SetlistItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedSongId, setSelectedSongId] = useState<string>("");

  useEffect(() => {
    checkAuth();
    fetchServices();
    fetchSongs();
  }, []);

  useEffect(() => {
    if (selectedService) {
      fetchSetlist();
    }
  }, [selectedService]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin/auth");
    }
  };

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("service_date", { ascending: false });

      if (error) throw error;
      setServices(data || []);
      if (data && data.length > 0) {
        setSelectedService(data[0].id);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSongs = async () => {
    try {
      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .order("title", { ascending: true });

      if (error) throw error;
      setSongs(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchSetlist = async () => {
    try {
      const { data, error } = await supabase
        .from("setlists")
        .select(`
          *,
          songs (
            id,
            title,
            category,
            song_number
          )
        `)
        .eq("service_id", selectedService)
        .order("position", { ascending: true });

      if (error) throw error;
      setSetlist(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddSong = async () => {
    if (!selectedSongId) return;

    try {
      const nextPosition = setlist.length + 1;
      const { error } = await supabase.from("setlists").insert([{
        service_id: selectedService,
        song_id: selectedSongId,
        position: nextPosition
      }]);

      if (error) throw error;
      
      // Update song usage count and last_used
      const { data: songData } = await supabase
        .from("songs")
        .select("usage_count")
        .eq("id", selectedSongId)
        .single();
      
      if (songData) {
        await supabase
          .from("songs")
          .update({ 
            usage_count: (songData.usage_count || 0) + 1,
            last_used: new Date().toISOString()
          })
          .eq("id", selectedSongId);
      }

      toast({ title: "Song added to setlist" });
      setDialogOpen(false);
      setSelectedSongId("");
      fetchSetlist();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRemoveSong = async (id: string) => {
    try {
      const { error } = await supabase.from("setlists").delete().eq("id", id);
      if (error) throw error;
      
      toast({ title: "Song removed from setlist" });
      fetchSetlist();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const applySuggestion = async (suggestion: string) => {
    const suggestions = {
      "3p2w": { praise: 3, worship: 2 },
      "2p2w": { praise: 2, worship: 2 },
      "2p3w": { praise: 2, worship: 3 },
      "1p1w": { praise: 1, worship: 1 },
      "1p": { praise: 1, worship: 0 }
    };

    const config = suggestions[suggestion as keyof typeof suggestions];
    const praiseSongs = songs.filter(s => s.category === "Praise").slice(0, config.praise);
    const worshipSongs = songs.filter(s => s.category === "Worship").slice(0, config.worship);
    const selectedSongs = [...praiseSongs, ...worshipSongs];

    try {
      const items = selectedSongs.map((song, index) => ({
        service_id: selectedService,
        song_id: song.id,
        position: index + 1
      }));

      const { error } = await supabase.from("setlists").insert(items);
      if (error) throw error;

      toast({ title: "Suggestion applied successfully" });
      fetchSetlist();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const selectedServiceData = services.find(s => s.id === selectedService);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Setlists</h1>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <Card className="col-span-2">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Current Lineup</CardTitle>
                      {selectedServiceData && (
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(selectedServiceData.service_date), "MMMM d, yyyy")}
                        </p>
                      )}
                    </div>
                    <Button onClick={() => setDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Song
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {setlist.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No songs in this setlist yet
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {setlist.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <GripVertical className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{item.position}</span>
                            <div>
                              <p className="font-medium">{item.songs.title}</p>
                              <Badge variant="outline" className="text-xs">
                                {item.songs.category}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveSong(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Select Service</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select value={selectedService} onValueChange={setSelectedService}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {format(new Date(service.service_date), "MMM d, yyyy")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Suggestions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => applySuggestion("3p2w")}
                    >
                      3 Praise + 2 Worship
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => applySuggestion("2p2w")}
                    >
                      2 Praise + 2 Worship
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => applySuggestion("2p3w")}
                    >
                      2 Praise + 3 Worship
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => applySuggestion("1p1w")}
                    >
                      1 Praise + 1 Worship
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => applySuggestion("1p")}
                    >
                      1 Praise Only
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Song to Setlist</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Select value={selectedSongId} onValueChange={setSelectedSongId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a song" />
                    </SelectTrigger>
                    <SelectContent>
                      {songs.map((song) => (
                        <SelectItem key={song.id} value={song.id}>
                          #{song.song_number} - {song.title} ({song.category})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddSong} disabled={!selectedSongId}>
                      Add Song
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Setlists;