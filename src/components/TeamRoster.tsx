import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

type Category = "Highschool" | "Elementary";

interface Slot {
  role: string;
  count: number;
}

const SLOTS: Slot[] = [
  { role: "Songleader", count: 1 },
  { role: "Backup Singer", count: 4 },
  { role: "Guitarist", count: 2 },
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

interface Props {
  serviceId: string;
  editable: boolean;
}

export const TeamRoster = ({ serviceId, editable }: Props) => {
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    load();
  }, [serviceId]);

  const load = async () => {
    const { data } = await supabase
      .from("team_members")
      .select("*")
      .eq("service_id", serviceId);
    setMembers((data as any) || []);
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
    // Upsert each filled-in member; delete empty ones that exist
    for (const m of members) {
      if (!m.name.trim()) {
        if (m.id) await supabase.from("team_members").delete().eq("id", m.id);
        continue;
      }
      if (m.id) {
        await supabase
          .from("team_members")
          .update({ name: m.name })
          .eq("id", m.id);
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
                      <Input
                        key={pos}
                        placeholder={`${slot.role} ${slot.count > 1 ? pos : ""} name`}
                        value={name}
                        onChange={(e) => setName(cat, slot.role, pos, e.target.value)}
                        className="rounded-full"
                      />
                    ) : (
                      <div
                        key={pos}
                        className="px-4 py-2 bg-muted rounded-full text-sm"
                      >
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
        <Button onClick={save} className="w-full">
          Save Team
        </Button>
      )}
    </div>
  );
};
