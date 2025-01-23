import { Logo } from "@/components/Logo";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Steganography } from "@/components/Steganography";
import { useState } from "react";

const Index = () => {
  const [showSteganography, setShowSteganography] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-stego-background to-white">
      <div className="container mx-auto px-4 py-8">
        {!showSteganography ? (
          <>
            <div className="flex justify-center mb-12 animate-fade-in">
              <Logo />
            </div>
            <Hero onGetStarted={() => setShowSteganography(true)} />
            <Features />
          </>
        ) : (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-8">
              <Logo />
              <button
                onClick={() => setShowSteganography(false)}
                className="text-stego-primary hover:text-stego-accent transition-colors"
              >
                Back to Home
              </button>
            </div>
            <Steganography />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;