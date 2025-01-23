import { Logo } from "@/components/Logo";
import { Steganography } from "@/components/Steganography";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stego-background to-white">
      <div className="container mx-auto py-8">
        <div className="flex justify-center mb-12">
          <Logo />
        </div>
        <Steganography />
      </div>
    </div>
  );
};

export default Index;