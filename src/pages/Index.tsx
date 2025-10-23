import { Music, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
      <div className="text-center px-4">
        <div className="flex justify-center mb-6">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-6">
            <Music className="w-16 h-16 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Good Tree Music Team</h1>
        <p className="text-white/80 text-lg mb-8">Worship Service Management System</p>
        
        <Link to="/admin/auth">
          <Button 
            size="icon"
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm rounded-full h-12 w-12"
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;
