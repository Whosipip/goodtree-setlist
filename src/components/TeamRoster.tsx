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
import { Plus, Trash2, X, Settings, Minus, Pencil } from "lucide-react";

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
  const [viewMode, setViewMode] = useState<"auto" | "joint" | "department">("auto");
  const [countsOpen, setCountsOpen] = useState(false);
  const [draftCounts, setDraftCounts] = useState<Record<string, number>>({});

  // Add-member dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [step, setStep] = useState<"name" | "category" | "roles">("name");
  const [draftName, setDraftName] = useState("");
  const [draftCategory, setDraftCategory] = useState<Category | null>(null);
  const [draftRoles, setDraftRoles] = useState<string[]>([]);

  // Edit-roles dialog state
  const [editRolesPerson, setEditRolesPerson] = useState<Person | null>(null);
  const [editRolesDraft, setEditRolesDraft] = useState<string[]>([]);

  useEffect(() => {
    load();
    loadPeople();
    loadPresets();
    loadServiceConfig();
  }, [serviceId]);

  const load = async () => {
    const { data } = await supabase.from("team_members").select("*").eq("service_id", serviceId);
    const list = ((data as any) || []) as Member[];
    setMembers(list);
    // Auto-expand slots so every assigned member is visible (prevents Media/Tambourine
    // names from being hidden when role count was saved lower than max position).
    setSlots((prev) => expandSlotsForMembers(prev, list));
  };

  const expandSlotsForMembers = (current: Slot[], list: Member[]): Slot[] => {
    const maxPos: Record<string, number> = {};
    list.forEach((m) => {
      if (m.name && m.name.trim()) {
        maxPos[m.role] = Math.max(maxPos[m.role] || 0, m.position);
      }
    });
    const next = current.map((s) => ({ ...s, count: Math.max(s.count, maxPos[s.role] || 0) }));
    // Append any roles found on members that aren't in slots at all
    Object.keys(maxPos).forEach((role) => {
      if (!next.find((s) => s.role === role)) {
        next.push({ role, count: maxPos[role] });
      }
    });
    return next;
  };

  const loadServiceConfig = async () => {
    const { data } = await supabase.from("services").select("role_counts, team_view_mode").eq("id", serviceId).maybeSingle();
    const rc = (data as any)?.role_counts;
    const tvm = (data as any)?.team_view_mode;
    if (tvm === "joint" || tvm === "department" || tvm === "auto") {
      setViewMode(tvm);
    } else {
      setViewMode("auto");
    }
    if (rc && typeof rc === "object") {
      // Start with defaults, override with any saved counts, then append any custom roles
      const merged: Slot[] = DEFAULT_SLOTS.map((s) => ({ role: s.role, count: rc[s.role] ?? s.count }));
      Object.keys(rc).forEach((role) => {
        if (!merged.find((s) => s.role === role)) {
          merged.push({ role, count: Number(rc[role]) || 0 });
        }
      });
      setSlots(merged);
    } else {
      setSlots(DEFAULT_SLOTS);
    }
  };

  const addCustomRole = async () => {
    const name = prompt("New role name (e.g. Violin, Keyboard 2)")?.trim();
    if (!name) return;
    if (slots.find((s) => s.role.toLowerCase() === name.toLowerCase())) {
      toast({ title: "Role already exists", variant: "destructive" });
      return;
    }
    const next = [...slots, { role: name, count: 1 }];
    setSlots(next);
    const cleaned: Record<string, number> = {};
    next.forEach((s) => (cleaned[s.role] = s.count));
    await supabase.from("services").update({ role_counts: cleaned as any }).eq("id", serviceId);
    toast({ title: `Role "${name}" added` });
  };

  const removeCustomRole = async (role: string) => {
    if (DEFAULT_SLOTS.find((s) => s.role === role)) {
      toast({ title: "Cannot remove a default role", variant: "destructive" });
      return;
    }
    if (!confirm(`Remove the "${role}" role from this service?`)) return;
    const next = slots.filter((s) => s.role !== role);
    setSlots(next);
    setMembers((prev) => prev.filter((m) => m.role !== role));
    await supabase.from("team_members").delete().eq("service_id", serviceId).eq("role", role);
    const cleaned: Record<string, number> = {};
    next.forEach((s) => (cleaned[s.role] = s.count));
    await supabase.from("services").update({ role_counts: cleaned as any }).eq("id", serviceId);
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
    // Persist current slot counts (expanded to fit assignments) so Media/Tambourine
    // and any other roles with assigned names retain their visible slots on reload.
    const expanded = expandSlotsForMembers(slots, members.filter((m) => m.name.trim()));
    const cleaned: Record<string, number> = {};
    expanded.forEach((s) => (cleaned[s.role] = s.count));
    await supabase.from("services").update({ role_counts: cleaned as any }).eq("id", serviceId);
    setSlots(expanded);
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

  const openEditRoles = (p: Person) => {
    setEditRolesPerson(p);
    setEditRolesDraft(p.roles || []);
  };

  const toggleEditRole = (role: string) => {
    setEditRolesDraft((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const saveEditRoles = async () => {
    if (!editRolesPerson) return;
    const { error } = await supabase
      .from("roster_people")
      .update({ roles: editRolesDraft })
      .eq("id", editRolesPerson.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setEditRolesPerson(null);
    await loadPeople();
    toast({ title: "Roles updated" });
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
    const namedMembers = members.filter((m) => m.name.trim());
    const memberData = namedMembers.map(({ category, role, position, name }) => ({ category, role, position, name }));
    // Expand counts to fit named assignments so Media/Tambourine etc. survive round-trip.
    const expanded = expandSlotsForMembers(slots, namedMembers);
    const counts: Record<string, number> = {};
    expanded.forEach((s) => (counts[s.role] = s.count));
    const payload = { members: memberData, counts };
    const { error } = await supabase.from("team_presets").insert({ name: n, data: payload as any });
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
    const raw: any = preset.data;
    // Backward compat: old presets stored a plain array of members.
    const memberRows: any[] = Array.isArray(raw) ? raw : raw?.members || [];
    const counts: Record<string, number> | undefined = Array.isArray(raw) ? undefined : raw?.counts;

    await supabase.from("team_members").delete().eq("service_id", serviceId);
    const rows = memberRows.map((d: any) => ({
      service_id: serviceId,
      category: d.category,
      role: d.role,
      position: d.position,
      name: d.name,
    }));
    if (rows.length) await supabase.from("team_members").insert(rows);

    // Start from defaults + preset counts + any custom roles
    const cleaned: Record<string, number> = {};
    DEFAULT_SLOTS.forEach((s) => {
      cleaned[s.role] = counts && counts[s.role] !== undefined ? Number(counts[s.role]) : s.count;
    });
    if (counts) {
      Object.keys(counts).forEach((role) => {
        if (cleaned[role] === undefined) cleaned[role] = Number(counts[role]) || 0;
      });
    }
    // Make sure every role with named members gets enough slots
    const namedRows = rows.filter((r) => r.name && r.name.trim());
    namedRows.forEach((r) => {
      cleaned[r.role] = Math.max(cleaned[r.role] || 0, r.position);
    });
    const nextSlots: Slot[] = DEFAULT_SLOTS.map((s) => ({ role: s.role, count: cleaned[s.role] }));
    Object.keys(cleaned).forEach((role) => {
      if (!nextSlots.find((s) => s.role === role)) nextSlots.push({ role, count: cleaned[role] });
    });
    await supabase.from("services").update({ role_counts: cleaned as any }).eq("id", serviceId);
    setSlots(nextSlots);
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
    slots.forEach((s) => {
      const v = Math.max(0, Math.min(20, Number(draftCounts[s.role] ?? s.count) || 0));
      cleaned[s.role] = v;
    });
    await supabase.from("services").update({ role_counts: cleaned as any }).eq("id", serviceId);
    setSlots(slots.map((s) => ({ role: s.role, count: cleaned[s.role] ?? s.count })));
    setCountsOpen(false);
    toast({ title: "Role counts updated" });
  };

  const bumpSlot = async (role: string, delta: number) => {
    const next = slots.map((s) =>
      s.role === role ? { ...s, count: Math.max(0, Math.min(20, s.count + delta)) } : s
    );
    setSlots(next);
    // Persist immediately to services.role_counts so it survives reloads.
    if (editable) {
      const cleaned: Record<string, number> = {};
      next.forEach((s) => (cleaned[s.role] = s.count));
      // If removing a slot, also clear any name stored at that position.
      if (delta < 0) {
        const removedPos = (slots.find((s) => s.role === role)?.count ?? 0);
        const victims = members.filter(
          (m) => m.role === role && m.position === removedPos
        );
        for (const v of victims) {
          if (v.id) await supabase.from("team_members").delete().eq("id", v.id);
        }
        setMembers((prev) => prev.filter((m) => !(m.role === role && m.position === removedPos)));
      }
      await supabase.from("services").update({ role_counts: cleaned as any }).eq("id", serviceId);
    }
  };

  const renderRosterFor = (cat: Category | null, label: string) => (
    <Card className="p-4 bg-white/95">
      <h3 className="font-bold text-lg mb-4 text-primary flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-primary inline-block" />
        {label}
      </h3>
      <div className="space-y-5">
        {slots.map((slot) => {
          const storeCat: Category = cat ?? "Highschool";
          return (
            <div key={slot.role}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                  {slot.role} ({slot.count})
                </div>
                {editable && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => bumpSlot(slot.role, -1)}
                      className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-primary"
                      aria-label={`Remove one ${slot.role}`}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => bumpSlot(slot.role, 1)}
                      className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-primary"
                      aria-label={`Add one ${slot.role}`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                {Array.from({ length: slot.count }).map((_, i) => {
                  const pos = i + 1;
                  const name = getName(storeCat, slot.role, pos);
                  const options = eligiblePeople(cat, slot.role);
                  return (
                    <div key={pos} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-6 shrink-0">{pos}:</span>
                      <div className="flex-1 min-w-0">
                        {editable ? (
                          name ? (
                            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium max-w-full">
                              <span className="truncate">{name}</span>
                              <button
                                type="button"
                                onClick={() => setName(storeCat, slot.role, pos, "")}
                                className="shrink-0 hover:text-destructive"
                                aria-label="Clear"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <Select
                              value={NONE_VALUE}
                              onValueChange={(v) =>
                                setName(storeCat, slot.role, pos, v === NONE_VALUE ? "" : v)
                              }
                            >
                              <SelectTrigger className="rounded-full h-8 text-sm border-dashed">
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
                              </SelectContent>
                            </Select>
                          )
                        ) : name ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium max-w-full">
                            <span className="truncate">{name}</span>
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">— Not assigned —</span>
                        )}
                      </div>
                      {editable && (
                        <button
                          type="button"
                          onClick={() => bumpSlot(slot.role, 1)}
                          className="shrink-0 w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-primary"
                          aria-label="Add slot"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
                {slot.count === 0 && (
                  <p className="text-xs text-muted-foreground italic pl-8">No slots — press + to add.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );

  const hasHS = members.some((m) => m.category === "Highschool" && m.name.trim());
  const hasElem = members.some((m) => m.category === "Elementary" && m.name.trim());
  const showByDeptAuto = hasHS && hasElem;
  const effectiveJoint = editable ? joint : !showByDeptAuto;

  return (
    <div className="space-y-4">
      {editable && (
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
          <Button size="sm" variant="secondary" onClick={addCustomRole}>
            <Plus className="w-4 h-4 mr-1" /> Role
          </Button>
          <Button size="sm" variant="secondary" onClick={openCountsDialog}>
            <Settings className="w-4 h-4 mr-1" /> Counts
          </Button>
        </div>
      )}

      {effectiveJoint
        ? renderRosterFor(null, "Joint (All Departments)")
        : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderRosterFor("Highschool", "Highschool")}
            {renderRosterFor("Elementary", "Elementary")}
          </div>
        )}

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
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => openEditRoles(p)}
                      aria-label="Edit roles"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => deletePerson(p.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
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
                {slots.map((s) => {
                  const isCustom = !DEFAULT_SLOTS.find((d) => d.role === s.role);
                  return (
                    <div key={s.role} className="flex items-center justify-between gap-3">
                      <Label className="flex-1">
                        {s.role}
                        {isCustom && <span className="ml-1 text-xs text-muted-foreground">(custom)</span>}
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        max={20}
                        value={draftCounts[s.role] ?? s.count}
                        onChange={(e) =>
                          setDraftCounts((p) => ({ ...p, [s.role]: Number(e.target.value) }))
                        }
                        className="w-20"
                      />
                      {isCustom && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => {
                            setCountsOpen(false);
                            removeCustomRole(s.role);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  );
                })}
                <Button size="sm" variant="outline" className="w-full" onClick={addCustomRole}>
                  <Plus className="w-4 h-4 mr-1" /> Add custom role
                </Button>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setCountsOpen(false)}>Cancel</Button>
                <Button onClick={saveCounts}>Save Counts</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit roles dialog */}
          <Dialog open={!!editRolesPerson} onOpenChange={(o) => !o && setEditRolesPerson(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Edit roles · {editRolesPerson?.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                <Label>Select all roles this member can do</Label>
                {slots.map((s) => s.role).map((r) => (
                  <label key={r} className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer">
                    <Checkbox
                      checked={editRolesDraft.includes(r)}
                      onCheckedChange={() => toggleEditRole(r)}
                    />
                    <span className="text-sm">{r}</span>
                  </label>
                ))}
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setEditRolesPerson(null)}>Cancel</Button>
                <Button onClick={saveEditRoles}>Save</Button>
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
                    {slots.map((s) => s.role).map((r) => (
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
