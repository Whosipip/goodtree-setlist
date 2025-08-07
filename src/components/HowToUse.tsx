import { Card } from "@/components/ui/card";

export const HowToUse = () => {
  const instructions = [
    "Tap any service to view its song lineup",
    "Use +/- buttons to transpose songs", 
    "Swipe or tap arrows to navigate songs",
    "Copy lyrics & chords to share"
  ];

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-card border-0 p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">How to Use</h3>
      <ul className="space-y-2">
        {instructions.map((instruction, index) => (
          <li key={index} className="flex items-start text-sm text-muted-foreground">
            <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
            {instruction}
          </li>
        ))}
      </ul>
    </Card>
  );
};