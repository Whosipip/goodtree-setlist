import { Music, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Admin Access Button */}
      <div className="absolute top-4 right-4">
        <Link to="/admin/auth">
          <Button 
            variant="ghost" 
            size="icon"
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm animate-fade-in"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-6">
              <Music className="w-16 h-16 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Good Tree Music Team</h1>
          <p className="text-white/80 text-xl">Welcome to the Worship Management System</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
