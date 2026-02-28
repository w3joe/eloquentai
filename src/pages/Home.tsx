import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Clock, Home, History, User, Loader2, MessageCircle } from 'lucide-react';
import { mockScenarios } from '@/lib/mock-data';
import { Scenario, UserProfile } from '@/lib/types';
import { generateScenarios, generateCustomScenario } from '@/lib/gemini';
import { getProfile as getStoredProfile } from '@/lib/storage';

const difficultyColor = (d: string) => {
  if (d === 'Beginner') return 'bg-success/20 text-success';
  if (d === 'Intermediate') return 'bg-primary/20 text-primary';
  return 'bg-destructive/20 text-destructive';
};

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const profile: UserProfile | null = location.state?.profile || getStoredProfile();
  const whatsappScenarios: Scenario[] | undefined = location.state?.whatsappScenarios;
  const [customScenario, setCustomScenario] = useState('');
  const [scenarios, setScenarios] = useState<Scenario[]>(mockScenarios);
  const [whatsappGeneratedScenarios, setWhatsappGeneratedScenarios] = useState<Scenario[]>([]);
  const [loadingScenarios, setLoadingScenarios] = useState(false);
  const [loadingCustom, setLoadingCustom] = useState(false);

  useEffect(() => {
    if (whatsappScenarios?.length) {
      setWhatsappGeneratedScenarios(whatsappScenarios);
    }
  }, [whatsappScenarios]);

  useEffect(() => {
    if (!profile) return;
    let cancelled = false;
    setLoadingScenarios(true);
    generateScenarios(profile)
      .then(generated => {
        if (!cancelled) setScenarios(generated);
      })
      .catch(err => {
        console.error('Failed to generate scenarios:', err);
      })
      .finally(() => {
        if (!cancelled) setLoadingScenarios(false);
      });
    return () => { cancelled = true; };
  }, [profile]);

  const handleScenarioClick = (scenario: Scenario) => {
    navigate('/briefing', { state: { scenario, profile } });
  };

  const handleCustomScenario = async () => {
    if (!customScenario.trim() || !profile) return;
    setLoadingCustom(true);
    try {
      const scenario = await generateCustomScenario(customScenario, profile);
      navigate('/briefing', { state: { scenario, profile } });
    } catch (err) {
      console.error('Failed to generate custom scenario:', err);
    } finally {
      setLoadingCustom(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 max-w-lg mx-auto w-full p-4 pb-24 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-8 space-y-1"
        >
          <h1 className="text-2xl font-bold text-foreground">
            {profile?.display_name ? `Hey, ${profile.display_name}` : 'Welcome to Eloquent'}
          </h1>
          <p className="text-muted-foreground">Ready to practice?</p>
        </motion.div>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Suggested for you</h2>
          {loadingScenarios ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            </div>
          ) : (
          <div className="space-y-3">
            {scenarios.map((scenario, i) => (
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card
                  className="gradient-border border-0 cursor-pointer hover:bg-secondary/50 transition-colors"
                  onClick={() => handleScenarioClick(scenario)}
                >
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{scenario.icon}</span>
                      <div className="flex-1 space-y-1">
                        <h3 className="font-semibold text-foreground text-sm leading-tight">{scenario.title}</h3>
                        <p className="text-xs text-muted-foreground">{scenario.description}</p>
                        <div className="flex items-center gap-2 pt-1">
                          <Badge variant="secondary" className={`text-[10px] px-2 py-0 border-0 ${difficultyColor(scenario.difficulty)}`}>
                            {scenario.difficulty}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {scenario.duration} min
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          )}
        </section>

        {whatsappGeneratedScenarios.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-[#25D366]" />
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">From your WhatsApp</h2>
            </div>
            <div className="space-y-3">
              {whatsappGeneratedScenarios.map((scenario, i) => (
                <motion.div
                  key={`wa-${scenario.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card
                    className="gradient-border border-0 cursor-pointer hover:bg-secondary/50 transition-colors ring-1 ring-[#25D366]/20"
                    onClick={() => handleScenarioClick(scenario)}
                  >
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{scenario.icon}</span>
                        <div className="flex-1 space-y-1">
                          <h3 className="font-semibold text-foreground text-sm leading-tight">{scenario.title}</h3>
                          <p className="text-xs text-muted-foreground">{scenario.description}</p>
                          <div className="flex items-center gap-2 pt-1">
                            <Badge variant="secondary" className={`text-[10px] px-2 py-0 border-0 ${difficultyColor(scenario.difficulty)}`}>
                              {scenario.difficulty}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {scenario.duration} min
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Custom scenario</h2>
          <div className="flex gap-2">
            <Input
              className="bg-secondary border-0 flex-1"
              placeholder="Describe a conversation you want to practice..."
              value={customScenario}
              onChange={e => setCustomScenario(e.target.value)}
            />
            <Button size="sm" disabled={!customScenario.trim() || loadingCustom} onClick={handleCustomScenario}>
              {loadingCustom ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Go'}
            </Button>
          </div>
        </section>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-lg border-t border-border">
        <div className="max-w-lg mx-auto flex justify-around py-3">
          {[
            { icon: Home, label: 'Home', path: '/home', active: true },
            { icon: History, label: 'History', path: '/history', active: false },
            { icon: User, label: 'Profile', path: '/profile', active: false },
          ].map(({ icon: Icon, label, path, active }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 text-xs transition-colors ${active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default HomePage;
