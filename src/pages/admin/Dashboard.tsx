import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Music, Plus, LogOut, Trash2, Edit, Menu } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";

interface Song {
  id: string;
  title: string;
  youtube_url: string | null;
  lyrics: string | null;
  service_date: string;
  created_at: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Form states
  const [title, setTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [serviceDate, setServiceDate] = useState("");

  useEffect(() => {
    checkAuth();
    fetchSongs();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/admin/auth");
      return;
    }
    setUser(user);
  };

  const fetchSongs = async () => {
    try {
      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSongs(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch songs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/admin/auth");
  };

  const resetForm = () => {
    setTitle("");
    setYoutubeUrl("");
    setLyrics("");
    setServiceDate("");
    setEditingSong(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingSong) {
        const { error } = await supabase
          .from("songs")
          .update({
            title,
            youtube_url: youtubeUrl,
            lyrics,
            service_date: serviceDate,
          })
          .eq("id", editingSong.id);

        if (error) throw error;
        toast({ title: "Success!", description: "Song updated successfully" });
      } else {
        const { error } = await supabase.from("songs").insert({
          title,
          youtube_url: youtubeUrl,
          lyrics,
          service_date: serviceDate,
        });

        if (error) throw error;
        toast({ title: "Success!", description: "Song added successfully" });
      }

      resetForm();
      setIsAddDialogOpen(false);
      fetchSongs();
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this song?")) return;

    try {
      const { error } = await supabase.from("songs").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Success!", description: "Song deleted successfully" });
      fetchSongs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (song: Song) => {
    setEditingSong(song);
    setTitle(song.title);
    setYoutubeUrl(song.youtube_url || "");
    setLyrics(song.lyrics || "");
    setServiceDate(song.service_date);
    setIsAddDialogOpen(true);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col w-full">
          {/* Header */}
          <header className="border-b bg-card sticky top-0 z-10">
            <div className="px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="lg:hidden">
                  <Menu className="w-5 h-5" />
                </SidebarTrigger>
                <div className="bg-primary/10 rounded-full p-2">
                  <Music className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Song Library</h1>
                  <p className="text-sm text-muted-foreground">Manage worship songs</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 overflow-auto">
            <div className="grid gap-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Songs</CardDescription>
                  <CardTitle className="text-3xl">{songs.length}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Services</CardDescription>
                  <CardTitle className="text-3xl">
                    {new Set(songs.map(s => s.service_date)).size}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Admin User</CardDescription>
                  <CardTitle className="text-lg truncate">{user?.email}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Songs Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Songs</CardTitle>
                    <CardDescription>Complete collection of worship songs</CardDescription>
                  </div>
                  <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
                    setIsAddDialogOpen(open);
                    if (!open) resetForm();
                  }}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Song
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{editingSong ? "Edit Song" : "Add New Song"}</DialogTitle>
                        <DialogDescription>
                          {editingSong ? "Update song details" : "Enter the song details below"}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Song Title</Label>
                          <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Amazing Grace (Song #123)"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="serviceDate">Service Date</Label>
                          <Input
                            id="serviceDate"
                            value={serviceDate}
                            onChange={(e) => setServiceDate(e.target.value)}
                            placeholder="e.g., Oct. 29"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="youtubeUrl">YouTube URL (optional)</Label>
                          <Input
                            id="youtubeUrl"
                            type="url"
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lyrics">Lyrics (optional)</Label>
                          <Textarea
                            id="lyrics"
                            value={lyrics}
                            onChange={(e) => setLyrics(e.target.value)}
                            placeholder="Enter chords and lyrics..."
                            rows={10}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : editingSong ? "Update Song" : "Add Song"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsAddDialogOpen(false);
                              resetForm();
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {loading && songs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">Loading songs...</div>
                ) : songs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No songs yet. Click "Add Song" to get started.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Song Title</TableHead>
                        <TableHead>Service Date</TableHead>
                        <TableHead>YouTube</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {songs.map((song) => (
                        <TableRow key={song.id}>
                          <TableCell className="font-medium">{song.title}</TableCell>
                          <TableCell>{song.service_date}</TableCell>
                          <TableCell>
                            {song.youtube_url ? (
                              <a
                                href={song.youtube_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                Watch
                              </a>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(song)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(song.id)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;