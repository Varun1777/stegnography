import { Button } from "@/components/ui/button";
import { Shield, Key, MessageSquare } from "lucide-react";

interface HeroProps {
  onGetStarted: () => void;
}

export const Hero = ({ onGetStarted }: HeroProps) => {
  return (
    <div className="text-center max-w-3xl mx-auto mb-16 space-y-6 animate-fade-in">
      <h1 className="text-4xl md:text-5xl font-bold text-stego-primary mb-4">
        Secure Your Messages with Advanced Steganography
      </h1>
      
      <p className="text-lg text-stego-muted mb-8">
        Embed and extract secret messages within your media files using cutting-edge steganography techniques. 
        Keep your communications private and secure.
      </p>
      
      <Button
        onClick={onGetStarted}
        size="lg"
        className="bg-stego-accent hover:bg-stego-accent/90 text-white transform transition-all hover:scale-105 shadow-lg"
      >
        Get Started
        <Key className="ml-2" />
      </Button>
    </div>
  );
};