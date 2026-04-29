import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, addDays, isWednesday, startOfDay, parseISO } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BottomNav } from "@/components/BottomNav";
import { TeamRoster } from "@/components/TeamRoster";
import { toast } from "@/hooks/use-toast";
import { LogOut, Plus, Trash2, Music, Calendar as CalIcon, ArrowLeft } from "lucide-react";

const WEDNESDAY_START = new Date(2026, 5, 24); // June 24, 2026

interface Song {
  id: string;
  title: string;
  youtube_url: string | null;
  lyrics: string | null;
}

interface SetlistEntry {
  id: string;
  song_id: string;
  position: number;
  song_time: string | null;
  songs: Song;
}

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(WEDNESDAY_START);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [serviceNotes, setServiceNotes] = useState<string>("");
  const [setlist, setSetlist] = useState<SetlistEntry[]>([]);
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [showAddSong, setShowAddSong] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [songTime, setSongTime] = useState("");
  const [newSong, setNewSong] = useState({ title: "", youtube_url: "", lyrics: "" });
  const [otherDate, setOtherDate] = useState<string>("");
  const [otherName, setOtherName] = useState<string>("");

  useEffect(() => {
    document.title = "Admin Dashboard | Good Tree Music";
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    loadAllSongs();
  }, []);

  useEffect(() => {
    if (selectedDate) loadServiceForDate(selectedDate);
  }, [selectedDate]);

  const loadAllSongs = async () => {
    const { data } = await supabase.from("songs").select("id,title,youtube_url,lyrics").order("title");
    const seen = new Set<string>();
    const unique = ((data as Song[]) || []).filter((s) => {
      const key = s.title.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    setAllSongs(unique);
  };

  const loadServiceForDate = async (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const { data: service } = await supabase
      .from("services")
      .select("id,notes")
      .eq("service_date", dateStr)
      .maybeSingle();

    if (!service) {
      setServiceId(null);
      setServiceNotes("");
      setSetlist([]);
      return;
    }
    setServiceId(service.id);
    setServiceNotes(service.notes || "");
    const { data: items } = await supabase
      .from("setlists")
      .select("id,song_id,position,song_time,songs(id,title,youtube_url,lyrics)")
      .eq("service_id", service.id)
      .order("position");
    setSetlist((items as any) || []);
  };

  const ensureService = async (): Promise<string | null> => {
    if (serviceId) return serviceId;
    if (!selectedDate) return null;
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const { data, error } = await supabase
      .from("services")
      .insert({ service_date: dateStr, status: "planning", created_by: user?.id })
      .select("id")
      .single();
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return null;
    }
    setServiceId(data.id);
    return data.id;
  };

  const saveServiceNotes = async (notes: string) => {
    if (!serviceId) return;
    await supabase.from("services").update({ notes }).eq("id", serviceId);
  };

  const createOtherEvent = async () => {
    if (!otherDate) {
      toast({ title: "Pick a date", variant: "destructive" });
      return;
    }
    if (!otherName.trim()) {
      toast({ title: "Service name required", variant: "destructive" });
      return;
    }
    // Check if a service already exists for that date
    const { data: existing } = await supabase
      .from("services")
      .select("id")
      .eq("service_date", otherDate)
      .maybeSingle();

    if (existing) {
      await supabase.from("services").update({ notes: otherName.trim() }).eq("id", existing.id);
    } else {
      const { error } = await supabase.from("services").insert({
        service_date: otherDate,
        status: "planning",
        created_by: user?.id,
        notes: otherName.trim(),
      });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }
    }
    toast({ title: `Event saved: ${otherName.trim()}` });
    const d = parseISO(otherDate);
    setSelectedDate(d);
    setOtherDate("");
    setOtherName("");
  };

  const handleCreateSong = async () => {
    if (!newSong.title.trim()) {
      toast({ title: "Title required", variant: "destructive" });
      return;
    }
    const titleNorm = newSong.title.trim().toLowerCase();
    const existing = allSongs.find((s) => s.title.trim().toLowerCase() === titleNorm);
    if (existing) {
      const useExisting = window.confirm(
        `"${existing.title}" is already in the library.\n\nClick OK to add the existing song to this lineup instead, or Cancel to edit the title.`
      );
      if (!useExisting) return;
      await handleAddExisting(existing.id);
      setNewSong({ title: "", youtube_url: "", lyrics: "" });
      setShowAddSong(false);
      return;
    }
    const sid = await ensureService();
    if (!sid) return;
    const { data: song, error } = await supabase
      .from("songs")
      .insert({
        title: newSong.title.trim(),
        youtube_url: newSong.youtube_url || null,
        lyrics: newSong.lyrics || null,
        service_date: format(selectedDate!, "yyyy-MM-dd"),
        published: true,
      })
      .select("id")
      .single();
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    await supabase.from("setlists").insert({
      service_id: sid,
      song_id: song.id,
      position: setlist.length + 1,
      song_time: songTime || null,
    });
    setNewSong({ title: "", youtube_url: "", lyrics: "" });
    setSongTime("");
    setShowAddSong(false);
    await loadAllSongs();
    await loadServiceForDate(selectedDate!);
    toast({ title: "Song added" });
  };

  const handleAddExisting = async (songId: string) => {
    const sid = await ensureService();
    if (!sid) return;
    await supabase.from("setlists").insert({
      service_id: sid,
      song_id: songId,
      position: setlist.length + 1,
      song_time: songTime || null,
    });
    setSongTime("");
    setShowLibrary(false);
    await loadServiceForDate(selectedDate!);
    toast({ title: "Song added to lineup" });
  };

  const handleRemove = async (id: string) => {
    await supabase.from("setlists").delete().eq("id", id);
    await loadServiceForDate(selectedDate!);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const isWednesdayOrAfter = (date: Date) => {
    return startOfDay(date) >= startOfDay(WEDNESDAY_START) && isWednesday(date);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-hero pb-24">
      <div className="px-4 pt-8 pb-6 max-w-4xl mx-auto">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Main
        </Button>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-white/80 text-sm">{user.email}</p>
            {!isAdmin && (
              <p className="text-yellow-200 text-xs mt-1">⚠ Admin role required to save changes.</p>
            )}
          </div>
          <Button variant="secondary" size="sm" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Card className="p-4 bg-white/95">
            <div className="flex items-center mb-3">
              <CalIcon className="w-5 h-5 mr-2 text-primary" />
              <h2 className="font-semibold">Pick a Wednesday Service</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Wednesdays only, starting June 24, 2026.
            </p>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => !isWednesdayOrAfter(date)}
              defaultMonth={WEDNESDAY_START}
              className="p-3 pointer-events-auto rounded-md border"
            />
            {selectedDate && (
              <div className="mt-3 p-3 bg-primary/10 rounded text-sm font-medium text-center">
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
                {serviceNotes && (
                  <div className="text-xs text-primary mt-1">📌 {serviceNotes}</div>
                )}
              </div>
            )}
          </Card>

          <Card className="p-4 bg-white/95">
            <div className="flex items-center mb-3">
              <Plus className="w-5 h-5 mr-2 text-primary" />
              <h2 className="font-semibold">Other Event</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Add a service for any other day (e.g. Friday Youth Night).
            </p>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Date</Label>
                <Input
                  type="date"
                  value={otherDate}
                  onChange={(e) => setOtherDate(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs">Service name</Label>
                <Input
                  placeholder="e.g. Friday Youth Praise"
                  value={otherName}
                  onChange={(e) => setOtherName(e.target.value)}
                />
              </div>
              <Button onClick={createOtherEvent} className="w-full" size="sm">
                Save Event
              </Button>

              {selectedDate && serviceId && (
                <div className="pt-3 border-t">
                  <Label className="text-xs">Rename current service</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      placeholder="Leave empty for default title"
                      value={serviceNotes}
                      onChange={(e) => setServiceNotes(e.target.value)}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        await saveServiceNotes(serviceNotes);
                        toast({ title: "Service updated" });
                      }}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {selectedDate && (
          <Card className="p-4 mb-4 bg-white/95">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold flex items-center">
                <Music className="w-5 h-5 mr-2 text-primary" />
                Lineup ({setlist.length})
              </h2>
              <div className="flex gap-2">
                <Dialog open={showLibrary} onOpenChange={setShowLibrary}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">From Library</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add Existing Song</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                      <div>
                        <Label>Time slot (optional)</Label>
                        <Input type="time" value={songTime} onChange={(e) => setSongTime(e.target.value)} />
                      </div>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {allSongs.length === 0 && (
                          <p className="text-sm text-muted-foreground">No songs yet.</p>
                        )}
                        {allSongs.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => handleAddExisting(s.id)}
                            className="w-full text-left p-2 rounded hover:bg-muted border text-sm"
                          >
                            {s.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog open={showAddSong} onOpenChange={setShowAddSong}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      New Song
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Song</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                      <div>
                        <Label>Title *</Label>
                        <Input value={newSong.title} onChange={(e) => setNewSong({ ...newSong, title: e.target.value })} />
                      </div>
                      <div>
                        <Label>YouTube URL</Label>
                        <Input value={newSong.youtube_url} onChange={(e) => setNewSong({ ...newSong, youtube_url: e.target.value })} />
                      </div>
                      <div>
                        <Label>Time slot (optional)</Label>
                        <Input type="time" value={songTime} onChange={(e) => setSongTime(e.target.value)} />
                      </div>
                      <div>
                        <Label>Chords & Lyrics</Label>
                        <Textarea
                          rows={8}
                          value={newSong.lyrics}
                          onChange={(e) => setNewSong({ ...newSong, lyrics: e.target.value })}
                        />
                      </div>
                      <Button onClick={handleCreateSong} className="w-full">Save Song</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {setlist.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No songs yet. Add one above.
              </p>
            ) : (
              <div className="space-y-2">
                {setlist.map((item, i) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded">
                    <div>
                      <div className="font-medium text-sm">
                        {i + 1}. {item.songs?.title}
                      </div>
                      {item.song_time && (
                        <div className="text-xs text-muted-foreground">
                          {item.song_time.slice(0, 5)}
                        </div>
                      )}
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => handleRemove(item.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {selectedDate && serviceId && (
          <div className="mb-4">
            <h2 className="font-semibold text-white mb-2 px-1">Team Roster</h2>
            <TeamRoster serviceId={serviceId} editable={true} />
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Admin;
