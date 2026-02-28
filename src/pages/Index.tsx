import { Button } from "@/components/ui/button";
import { Zap, Shield, BarChart3 } from "lucide-react";

const features = [
  { icon: Zap, title: "Lightning Fast", description: "Built for speed and performance from the ground up." },
  { icon: Shield, title: "Secure by Default", description: "Enterprise-grade security baked into every layer." },
  { icon: BarChart3, title: "Actionable Insights", description: "Beautiful analytics that help you make better decisions." },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <span className="text-lg font-bold tracking-tight">Acme Inc.</span>
          <nav className="hidden gap-6 md:flex">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</a>
            <a href="#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a>
          </nav>
          <Button size="sm">Get Started</Button>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-24 text-center md:py-32">
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
          Build something amazing, starting here.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          A clean starting point for your next great idea. Customize everything to make it yours.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Button size="lg">Get Started</Button>
          <Button size="lg" variant="outline">Learn More</Button>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">Features</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-lg border border-border bg-card p-6 text-card-foreground">
                <f.icon className="mb-4 h-8 w-8 text-primary" />
                <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="container mx-auto px-4 py-20 text-center">
        <h2 className="mb-4 text-3xl font-bold">About Us</h2>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          We're a team passionate about building tools that empower creators. This is a placeholder — replace it with your story.
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground md:flex-row">
          <span>&copy; 2026 Acme Inc. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" id="contact" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
