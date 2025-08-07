import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ServiceCardProps {
  date: string;
  title: string;
  status: "upcoming" | "completed";
  songCount?: number;
}

export const ServiceCard = ({ date, title, status, songCount }: ServiceCardProps) => {
  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-card border-0 p-6 cursor-pointer hover:shadow-soft transition-all duration-200 hover:scale-105">
      <div className="text-sm text-muted-foreground mb-2">{date}</div>
      <h3 className="text-lg font-semibold text-foreground mb-3">{title}</h3>
      <div className="flex items-center justify-between">
        <Badge 
          variant={status === "upcoming" ? "default" : "secondary"}
          className={status === "upcoming" ? "bg-primary hover:bg-primary-dark text-primary-foreground" : ""}
        >
          {status === "upcoming" ? "Upcoming" : "Completed"}
        </Badge>
        {songCount && (
          <span className="text-sm text-muted-foreground">{songCount} songs</span>
        )}
      </div>
    </Card>
  );
};