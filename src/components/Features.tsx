import { Shield, Lock, MessageSquare, Image } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Features = () => {
  const features = [
    {
      title: "Secure Encryption",
      description: "Advanced encryption to protect your hidden messages",
      icon: Shield,
    },
    {
      title: "Media Support",
      description: "Hide messages in images, audio, and video files",
      icon: Image,
    },
    {
      title: "Private Communication",
      description: "Send secret messages that only intended recipients can read",
      icon: MessageSquare,
    },
    {
      title: "Password Protection",
      description: "Additional security layer with password-protected messages",
      icon: Lock,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in [--animate-delay:200ms]">
      {features.map((feature, index) => (
        <Card key={index} className="border border-stego-primary/10 hover:shadow-md transition-shadow">
          <CardHeader>
            <feature.icon className="w-12 h-12 text-stego-accent mb-4" />
            <CardTitle className="text-stego-primary">{feature.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-stego-muted">{feature.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};