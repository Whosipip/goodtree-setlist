import { Music } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { ServiceCard } from "@/components/ServiceCard";
import { HowToUse } from "@/components/HowToUse";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <div className="text-center pt-8 pb-6">
        <div className="flex justify-center mb-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
            <Music className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Good Tree Music Team</h1>
        <p className="text-white/80 text-lg">Choose a service to view chords and lyrics</p>
      </div>

      {/* Stats Cards */}
      <div className="px-4 mb-8">
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          <StatsCard number="1" label="Upcoming" />
          <StatsCard number="1" label="With Songs" />
          <StatsCard number="6" label="Total Songs" />
        </div>
      </div>

      {/* Available Lineups Section */}
      <div className="px-4 pb-8">
        <div className="max-w-md mx-auto space-y-6">
          <h2 className="text-xl font-semibold text-white mb-4">Available Lineups</h2>
          
          <ServiceCard 
            date="Aug 9"
            title="Sunday Morning Worship"
            status="upcoming"
            songCount={5}
          />

          <HowToUse />
        </div>
      </div>
    </div>
  );
};

export default Index;
