import { Steganography } from "@/components/Steganography";
import { Card, CardContent } from "@/components/ui/card";
import { Lock } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stego-background to-stego-accent/5 p-6">
      {/* Header */}
      <header className="mb-8">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <Lock className="w-8 h-8 text-stego-accent" />
            <span className="text-2xl font-bold text-stego-primary">GetStego</span>
          </div>
          <div className="flex gap-6">
            <a href="/" className="text-stego-primary hover:text-stego-accent transition-colors">
              Home
            </a>
            <a href="#about" className="text-stego-primary hover:text-stego-accent transition-colors">
              About
            </a>
            <a href="#help" className="text-stego-primary hover:text-stego-accent transition-colors">
              Help
            </a>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto">
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-stego-accent/20">
          <CardContent className="p-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-stego-primary mb-4 animate-fade-in">
                Encode & Decode Secret Messages
              </h1>
              <p className="text-stego-muted">
                Securely hide your messages within files using advanced steganography
              </p>
            </div>
            
            <Steganography />
          </CardContent>
        </Card>
      </main>

      {/* Floating Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-stego-accent/5 rounded-full blur-3xl animate-spin-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-stego-primary/5 rounded-full blur-3xl animate-spin-slow" />
      </div>
    </div>
  );
};

export default Index;