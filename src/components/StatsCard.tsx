import { Card } from "@/components/ui/card";

interface StatsCardProps {
  number: string;
  label: string;
}

export const StatsCard = ({ number, label }: StatsCardProps) => {
  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-card border-0 p-4 text-center">
      <div className="text-2xl font-bold text-primary mb-1">{number}</div>
      <div className="text-sm text-muted-foreground font-medium">{label}</div>
    </Card>
  );
};