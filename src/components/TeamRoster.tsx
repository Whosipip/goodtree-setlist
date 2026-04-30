import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, X, Settings } from "lucide-react";

type Category = "Highschool" | "Elementary";

interface Slot {
  role: string;
  count: number;
}

const DEFAULT_SLOTS: Slot[] = [
  { role: "Songleader", count: 1 },
  { role: "Backup Singer", count: 4 },
  { role: "Guitarist", count: 3 },
  { role: "Bassist", count: 1 },
  { role: "Pianist", count: 1 },
  { role: "Drummer", count: 1 },
  { role: "Media", count: 1 },
  { role: "Tambourine", count: 2 },
];

const ALL_ROLES = DEFAULT_SLOTS.map((s) => s.role);
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
  category: Category | null;
  roles: string[];
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
  const [newPresetName, setNewPresetName] = useState("");
  const [slots, setSlots] = useState<Slot[]>(DEFAULT_SLOTS);
  const [joint, setJoint] = useState(false);
  const [countsOpen, setCountsOpen] = useState(false);
  const [draftCounts, setDraftCounts] = useState<Record<string, number>>({});

  // Add-member dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [step, setStep] = useState<"name" | "category" | "roles">("name");
  const [draftName, setDraftName] = useState("");
  const [draftCategory, setDraftCategory] = useState<Category | null>(null);
  const [draftRoles, setDraftRoles] = useState<string[]>([]);

  useEffect(() => {
    load();
    loadPeople();
    loadPresets();
    loadServiceConfig();
  }, [serviceId]);

  const load = async () => {
    const { data } = await supabase.from("team_members").select("*").eq("service_id", serviceId);
    setMembers((data as any) || []);
  };

  const loadServiceConfig = async () => {
    const { data } = await supabase.from("services").select("role_counts").eq("id", serviceId).maybeSingle();
    const rc = (data as any)?.role_counts;
    if (rc && typeof rc === "object") {
      setSlots(DEFAULT_SLOTS.map((s) => ({ role: s.role, count: rc[s.role] ?? s.count })));
    } else {
      setSlots(DEFAULT_SLOTS);
    }
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

  const eligiblePeople = (cat: Category | null, role: string) =>
    people.filter(
      (p) =>
        (cat === null || !p.category || p.category === cat) &&
        (p.roles?.length ? p.roles.includes(role) : true)
    );

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

  const resetDialog = () => {
    setDraftName("");
    setDraftCategory(null);
    setDraftRoles([]);
    setStep("name");
  };

  const submitNewMember = async () => {
    const n = draftName.trim();
    if (!n || !draftCategory || draftRoles.length === 0) return;
    const { error } = await supabase.from("roster_people").insert({
      name: n,
      category: draftCategory,
      roles: draftRoles,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setDialogOpen(false);
    resetDialog();
    await loadPeople();
    toast({ title: "Member added" });
  };

  const deletePerson = async (id: string) => {
    await supabase.from("roster_people").delete().eq("id", id);
    await loadPeople();
  };

  const toggleDraftRole = (role: string) => {
    setDraftRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
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

  const openCountsDialog = () => {
    const map: Record<string, number> = {};
    slots.forEach((s) => (map[s.role] = s.count));
    setDraftCounts(map);
    setCountsOpen(true);
  };

  const saveCounts = async () => {
    const cleaned: Record<string, number> = {};
    DEFAULT_SLOTS.forEach((s) => {
      const v = Math.max(0, Math.min(20, Number(draftCounts[s.role]) || 0));
      cleaned[s.role] = v;
    });
    await supabase.from("services").update({ role_counts: cleaned as any }).eq("id", serviceId);
    setSlots(DEFAULT_SLOTS.map((s) => ({ role: s.role, count: cleaned[s.role] ?? s.count })));
    setCountsOpen(false);
    toast({ title: "Role counts updated" });
  };

  const renderRosterFor = (cat: Category | null, label: string) => (
    <Card className="p-4 bg-white/95">
      <h3 className="font-bold text-lg mb-3 text-primary">{label}</h3>
      <div className="space-y-4">
        {slots.filter((s) => s.count > 0).map((slot) => (
          <div key={slot.role}>
            <div className="text-sm font-semibold mb-2 text-foreground">
              {slot.role}
              {slot.count > 1 ? "s" : ""} ({slot.count})
            </div>
            <div className="space-y-2">
              {Array.from({ length: slot.count }).map((_, i) => {
                const pos = i + 1;
                // For "Joint" we still store under Highschool category to keep one row per slot.
                const storeCat: Category = cat ?? "Highschool";
                const name = getName(storeCat, slot.role, pos);
                const options = eligiblePeople(cat, slot.role);
                return editable ? (
                  <Select
                    key={pos}
                    value={name || NONE_VALUE}
                    onValueChange={(v) => setName(storeCat, slot.role, pos, v === NONE_VALUE ? "" : v)}
                  >
                    <SelectTrigger className="rounded-full">
                      <SelectValue placeholder="Choose member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE_VALUE}>— None —</SelectItem>
                      {options.map((p) => (
                        <SelectItem key={p.id} value={p.name}>
                          {p.name}
                          {p.category ? ` · ${p.category}` : ""}
                        </SelectItem>
                      ))}
                      {name && !options.some((p) => p.name === name) && (
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
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={joint ? "outline" : "default"}
          onClick={() => setJoint(false)}
          className="flex-1"
        >
          By Department
        </Button>
        <Button
          size="sm"
          variant={joint ? "default" : "outline"}
          onClick={() => setJoint(true)}
          className="flex-1"
        >
          Joint
        </Button>
        {editable && (
          <Button size="sm" variant="secondary" onClick={openCountsDialog}>
            <Settings className="w-4 h-4 mr-1" /> Counts
          </Button>
        )}
      </div>

      {joint
        ? renderRosterFor(null, "Joint (All Departments)")
        : CATEGORIES.map((cat) => (
            <div key={cat}>{renderRosterFor(cat, cat)}</div>
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
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold">Members</h3>
              <Button
                size="sm"
                onClick={() => {
                  resetDialog();
                  setDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-1" /> Add Member
              </Button>
            </div>
            <div className="space-y-2">
              {people.length === 0 && (
                <p className="text-sm text-muted-foreground">No members yet.</p>
              )}
              {people.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-2 bg-muted rounded-lg p-2">
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate">{p.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.category || "—"} · {p.roles?.length ? p.roles.join(", ") : "no roles"}
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 shrink-0"
                    onClick={() => deletePerson(p.id)}
                  >
                    <X className="w-4 h-4" />
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

          {/* Counts dialog */}
          <Dialog open={countsOpen} onOpenChange={setCountsOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adjust people per role</DialogTitle>
              </DialogHeader>
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {DEFAULT_SLOTS.map((s) => (
                  <div key={s.role} className="flex items-center justify-between gap-3">
                    <Label className="flex-1">{s.role}</Label>
                    <Input
                      type="number"
                      min={0}
                      max={20}
                      value={draftCounts[s.role] ?? s.count}
                      onChange={(e) =>
                        setDraftCounts((p) => ({ ...p, [s.role]: Number(e.target.value) }))
                      }
                      className="w-24"
                    />
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setCountsOpen(false)}>Cancel</Button>
                <Button onClick={saveCounts}>Save Counts</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Add member dialog */}
          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetDialog(); }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {step === "name" && "New Member · Name"}
                  {step === "category" && "Choose Department"}
                  {step === "roles" && "Choose Role(s)"}
                </DialogTitle>
              </DialogHeader>

              {step === "name" && (
                <div className="space-y-2">
                  <Label>Member name</Label>
                  <Input
                    autoFocus
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    placeholder="e.g. Juan Dela Cruz"
                    onKeyDown={(e) => e.key === "Enter" && draftName.trim() && setStep("category")}
                  />
                </div>
              )}

              {step === "category" && (
                <div className="space-y-2">
                  <Label>Department</Label>
                  {CATEGORIES.map((c) => (
                    <Button
                      key={c}
                      variant={draftCategory === c ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setDraftCategory(c)}
                    >
                      {c}
                    </Button>
                  ))}
                </div>
              )}

              {step === "roles" && (
                <div className="space-y-2">
                  <Label>Select all roles this member can do</Label>
                  <div className="space-y-2">
                    {ALL_ROLES.map((r) => (
                      <label key={r} className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer">
                        <Checkbox
                          checked={draftRoles.includes(r)}
                          onCheckedChange={() => toggleDraftRole(r)}
                        />
                        <span className="text-sm">{r}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <DialogFooter className="flex-row justify-between sm:justify-between">
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (step === "category") setStep("name");
                    else if (step === "roles") setStep("category");
                    else setDialogOpen(false);
                  }}
                >
                  {step === "name" ? "Cancel" : "Back"}
                </Button>
                {step === "name" && (
                  <Button disabled={!draftName.trim()} onClick={() => setStep("category")}>
                    Next
                  </Button>
                )}
                {step === "category" && (
                  <Button disabled={!draftCategory} onClick={() => setStep("roles")}>
                    Next
                  </Button>
                )}
                {step === "roles" && (
                  <Button disabled={draftRoles.length === 0} onClick={submitNewMember}>
                    Add Member
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};
