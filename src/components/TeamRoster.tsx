import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, X } from "lucide-react";

type Category = "Highschool" | "Elementary";

interface Slot {
  role: string;
  count: number;
}

const SLOTS: Slot[] = [
  { role: "Songleader", count: 1 },
  { role: "Backup Singer", count: 4 },
  { role: "Guitarist", count: 3 },
  { role: "Bassist", count: 1 },
  { role: "Pianist", count: 1 },
  { role: "Drummer", count: 1 },
];

const CATEGORIES: Category[] = ["Highschool", "Elementary"];

interface Member {
  id?: string;
  service_id: string;
  category: Category;
  role: string;
  position: number;
  name: string;
}

interface Person {
  id: string;
  name: string;
}

interface Preset {
  id: string;
  name: string;
  data: Member[];
}

interface Props {
  serviceId: string;
  editable: boolean;
}

const NONE_VALUE = "__none__";

export const TeamRoster = ({ serviceId, editable }: Props) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [newPerson, setNewPerson] = useState("");
  const [newPresetName, setNewPresetName] = useState("");

  useEffect(() => {
    load();
    loadPeople();
    loadPresets();
  }, [serviceId]);

  const load = async () => {
    const { data } = await supabase
      .from("team_members")
      .select("*")
      .eq("service_id", serviceId);
    setMembers((data as any) || []);
  };

  const loadPeople = async () => {
    const { data } = await supabase.from("roster_people").select("*").order("name");
    setPeople((data as any) || []);
  };

  const loadPresets = async () => {
    const { data } = await supabase.from("team_presets").select("*").order("name");
    setPresets((data as any) || []);
  };

  const getName = (cat: Category, role: string, pos: number) =>
    members.find((m) => m.category === cat && m.role === role && m.position === pos)?.name || "";

  const setName = (cat: Category, role: string, pos: number, name: string) => {
    setMembers((prev) => {
      const idx = prev.findIndex(
        (m) => m.category === cat && m.role === role && m.position === pos
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], name };
        return next;
      }
      return [...prev, { service_id: serviceId, category: cat, role, position: pos, name }];
    });
  };

  const save = async () => {
    for (const m of members) {
      if (!m.name.trim()) {
        if (m.id) await supabase.from("team_members").delete().eq("id", m.id);
        continue;
      }
      if (m.id) {
        await supabase.from("team_members").update({ name: m.name }).eq("id", m.id);
      } else {
        await supabase.from("team_members").insert({
          service_id: m.service_id,
          category: m.category,
          role: m.role,
          position: m.position,
          name: m.name,
        });
      }
    }
    await load();
    toast({ title: "Team saved" });
  };

  const clearAll = async () => {
    if (!confirm("Clear ALL team assignments for this service?")) return;
    await supabase.from("team_members").delete().eq("service_id", serviceId);
    setMembers([]);
    toast({ title: "Team cleared" });
  };

  const addPerson = async () => {
    const n = newPerson.trim();
    if (!n) return;
    const { error } = await supabase.from("roster_people").insert({ name: n });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setNewPerson("");
    await loadPeople();
  };

  const deletePerson = async (id: string) => {
    await supabase.from("roster_people").delete().eq("id", id);
    await loadPeople();
  };

  const savePreset = async () => {
    const n = newPresetName.trim();
    if (!n) {
      toast({ title: "Preset name required", variant: "destructive" });
      return;
    }
    const data = members
      .filter((m) => m.name.trim())
      .map(({ category, role, position, name }) => ({ category, role, position, name }));
    const { error } = await supabase.from("team_presets").insert({ name: n, data: data as any });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setNewPresetName("");
    await loadPresets();
    toast({ title: "Preset saved" });
  };

  const applyPreset = async (preset: Preset) => {
    if (!confirm(`Apply preset "${preset.name}"? This replaces current assignments.`)) return;
    await supabase.from("team_members").delete().eq("service_id", serviceId);
    const rows = (preset.data || []).map((d: any) => ({
      service_id: serviceId,
      category: d.category,
      role: d.role,
      position: d.position,
      name: d.name,
    }));
    if (rows.length) await supabase.from("team_members").insert(rows);
    await load();
    toast({ title: `Applied "${preset.name}"` });
  };

  const deletePreset = async (id: string) => {
    if (!confirm("Delete this preset?")) return;
    await supabase.from("team_presets").delete().eq("id", id);
    await loadPresets();
  };

  return (
    <div className="space-y-4">
      {CATEGORIES.map((cat) => (
        <Card key={cat} className="p-4 bg-white/95">
          <h3 className="font-bold text-lg mb-3 text-primary">{cat}</h3>
          <div className="space-y-4">
            {SLOTS.map((slot) => (
              <div key={slot.role}>
                <div className="text-sm font-semibold mb-2 text-foreground">
                  {slot.role}
                  {slot.count > 1 ? "s" : ""} ({slot.count})
                </div>
                <div className="space-y-2">
                  {Array.from({ length: slot.count }).map((_, i) => {
                    const pos = i + 1;
                    const name = getName(cat, slot.role, pos);
                    return editable ? (
                      <Select
                        key={pos}
                        value={name || NONE_VALUE}
                        onValueChange={(v) => setName(cat, slot.role, pos, v === NONE_VALUE ? "" : v)}
                      >
                        <SelectTrigger className="rounded-full">
                          <SelectValue placeholder="Choose member" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NONE_VALUE}>— None —</SelectItem>
                          {people.map((p) => (
                            <SelectItem key={p.id} value={p.name}>
                              {p.name}
                            </SelectItem>
                          ))}
                          {name && !people.some((p) => p.name === name) && (
                            <SelectItem value={name}>{name}</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div key={pos} className="px-4 py-2 bg-muted rounded-full text-sm">
                        {name || <span className="text-muted-foreground italic">— Not assigned —</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}

      {editable && (
        <>
          <div className="flex gap-2">
            <Button onClick={save} className="flex-1">Save Team</Button>
            <Button onClick={clearAll} variant="destructive">
              <Trash2 className="w-4 h-4 mr-1" /> Clear All
            </Button>
          </div>

          {/* Member directory */}
          <Card className="p-4 bg-white/95">
            <h3 className="font-bold mb-3">Members</h3>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="New member name"
                value={newPerson}
                onChange={(e) => setNewPerson(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addPerson()}
              />
              <Button onClick={addPerson} size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {people.length === 0 && (
                <p className="text-sm text-muted-foreground">No members yet.</p>
              )}
              {people.map((p) => (
                <div key={p.id} className="flex items-center gap-1 bg-muted rounded-full pl-3 pr-1 py-1 text-sm">
                  <span>{p.name}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => deletePerson(p.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Presets */}
          <Card className="p-4 bg-white/95">
            <h3 className="font-bold mb-3">Team Presets</h3>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Preset name (e.g. Team A)"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
              />
              <Button onClick={savePreset}>Save Current</Button>
            </div>
            <div className="space-y-2">
              {presets.length === 0 && (
                <p className="text-sm text-muted-foreground">No presets saved yet.</p>
              )}
              {presets.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm font-medium">{p.name}</span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => applyPreset(p)}>
                      Apply
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => deletePreset(p.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
