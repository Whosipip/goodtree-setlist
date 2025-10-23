import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, Search, Globe, Lock } from "lucide-react";
import { format } from "date-fns";

interface Song {
  id: string;
  title: string;
  youtube_url: string | null;
  lyrics: string | null;
  category: string;
  song_number: number | null;
  last_used: string | null;
  usage_count: number;
  service_date: string;
  published: boolean;
  scheduled_for: string | null;
  locked_until: string | null;
}

const SongLibrary = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [songs, setSongs] = useState<Song[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    youtube_url: "",
    lyrics: "",
    category: "Praise",
    service_date: new Date().toISOString().split('T')[0],
    published: false,
    scheduled_for: "",
    locked_until: ""
  });

  useEffect(() => {
    checkAuth();
    fetchSongs();
  }, []);

  useEffect(() => {
    filterSongs();
  }, [songs, searchQuery, categoryFilter]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin/auth");
    }
  };

  const fetchSongs = async () => {
    try {
      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .order("song_number", { ascending: true });

      if (error) throw error;
      setSongs(data || []);
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

  const filterSongs = () => {
    let filtered = songs;

    if (searchQuery) {
      filtered = filtered.filter(song =>
        song.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(song => song.category === categoryFilter);
    }

    setFilteredSongs(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSong) {
        const { error } = await supabase
          .from("songs")
          .update(formData)
          .eq("id", editingSong.id);
        if (error) throw error;
        toast({ title: "Song updated successfully" });
      } else {
        const { error } = await supabase.from("songs").insert([formData]);
        if (error) throw error;
        toast({ title: "Song added successfully" });
      }
      
      setDialogOpen(false);
      resetForm();
      fetchSongs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this song?")) return;
    
    try {
      const { error } = await supabase.from("songs").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Song deleted successfully" });
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
    setFormData({
      title: song.title,
      youtube_url: song.youtube_url || "",
      lyrics: song.lyrics || "",
      category: song.category,
      service_date: song.service_date,
      published: song.published || false,
      scheduled_for: song.scheduled_for || "",
      locked_until: song.locked_until || ""
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingSong(null);
    setFormData({
      title: "",
      youtube_url: "",
      lyrics: "",
      category: "Praise",
      service_date: new Date().toISOString().split('T')[0],
      published: false,
      scheduled_for: "",
      locked_until: ""
    });
  };

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
              <h1 className="text-3xl font-bold">Song Library</h1>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Song
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingSong ? "Edit Song" : "Add New Song"}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Praise">Praise</SelectItem>
                          <SelectItem value="Worship">Worship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="service_date">Service Date</Label>
                      <Input
                        id="service_date"
                        type="date"
                        value={formData.service_date}
                        onChange={(e) => setFormData({ ...formData, service_date: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="youtube_url">YouTube URL</Label>
                      <Input
                        id="youtube_url"
                        type="url"
                        value={formData.youtube_url}
                        onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lyrics">Lyrics</Label>
                      <Textarea
                        id="lyrics"
                        value={formData.lyrics}
                        onChange={(e) => setFormData({ ...formData, lyrics: e.target.value })}
                        rows={10}
                        className="font-mono text-sm"
                      />
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Globe className="w-4 h-4" />
                        <Label className="text-base font-semibold">Publishing Settings</Label>
                      </div>
                      <div className="space-y-4 pl-6">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="published"
                            checked={formData.published}
                            onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                            className="w-4 h-4"
                          />
                          <Label htmlFor="published" className="cursor-pointer">
                            Publish to main page
                          </Label>
                        </div>
                        {formData.published && (
                          <>
                            <div>
                              <Label htmlFor="scheduled_for">Scheduled For</Label>
                              <Input
                                id="scheduled_for"
                                type="date"
                                value={formData.scheduled_for}
                                onChange={(e) => setFormData({ ...formData, scheduled_for: e.target.value })}
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                When this song will be performed
                              </p>
                            </div>
                            <div>
                              <Label htmlFor="locked_until">Lock Until</Label>
                              <Input
                                id="locked_until"
                                type="date"
                                value={formData.locked_until}
                                onChange={(e) => setFormData({ ...formData, locked_until: e.target.value })}
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Song will be hidden from main page until this date
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">{editingSong ? "Update" : "Add"} Song</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Search & Filter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search songs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Praise">Praise</SelectItem>
                      <SelectItem value="Worship">Worship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Used</TableHead>
                      <TableHead>Usage Count</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSongs.map((song) => (
                      <TableRow key={song.id}>
                        <TableCell className="font-medium">{song.song_number}</TableCell>
                        <TableCell>{song.title}</TableCell>
                        <TableCell>
                          <Badge variant={song.category === "Praise" ? "default" : "secondary"}>
                            {song.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {song.published ? (
                            <div className="flex items-center gap-1">
                              <Globe className="w-3 h-3 text-green-600" />
                              <span className="text-xs text-green-600">Published</span>
                              {song.locked_until && new Date(song.locked_until) > new Date() && (
                                <Lock className="w-3 h-3 text-orange-600 ml-1" />
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Draft</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {song.last_used 
                            ? format(new Date(song.last_used), "MMM d, yyyy")
                            : "Never"}
                        </TableCell>
                        <TableCell>{song.usage_count}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(song)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(song.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default SongLibrary;