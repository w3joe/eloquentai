import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Mic } from 'lucide-react';
import { Scenario, UserProfile, LANGUAGES } from '@/lib/types';
import { mockScenarios } from '@/lib/mock-data';
import { useState } from 'react';

const Briefing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const scenario: Scenario = location.state?.scenario || mockScenarios[0];
  const profile: UserProfile | null = location.state?.profile || null;
  const [tipsOpen, setTipsOpen] = useState(false);

  const targetLang = LANGUAGES.find(l => l.code === (profile?.target_language || 'es'));

  const startConversation = () => {
    navigate('/conversation', { state: { scenario, profile } });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg space-y-6"
      >
        <div className="text-center space-y-2">
          <span className="text-4xl">{scenario.icon}</span>
          <h1 className="text-xl font-bold text-foreground">{scenario.title}</h1>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="secondary" className="bg-primary/20 text-primary border-0 text-xs">
              {targetLang?.flag} {targetLang?.name} · {scenario.difficulty}
            </Badge>
          </div>
        </div>

        <Card className="gradient-border border-0">
          <CardContent className="p-6 space-y-4">
            <p className="text-sm text-foreground/90 leading-relaxed italic">"{scenario.scene}"</p>

            <div className="bg-secondary rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                  {scenario.character.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{scenario.character.name}</p>
                  <p className="text-xs text-muted-foreground">{scenario.character.role}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{scenario.character.personality}</p>
              <p className="text-[10px] text-muted-foreground/70">{scenario.character.voiceLabel}</p>
            </div>

            <Collapsible open={tipsOpen} onOpenChange={setTipsOpen}>
              <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <ChevronDown className={`h-3 w-3 transition-transform ${tipsOpen ? 'rotate-180' : ''}`} />
                Tips for this conversation
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <ul className="space-y-1">
                  {scenario.tips.map((tip, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span> {tip}
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <motion.button
            onClick={startConversation}
            className="relative w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30"
            whileTap={{ scale: 0.95 }}
            animate={{ boxShadow: ['0 0 0 0 hsl(244 98% 69% / 0.4)', '0 0 0 20px hsl(244 98% 69% / 0)', '0 0 0 0 hsl(244 98% 69% / 0.4)'] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Mic className="h-8 w-8 text-primary-foreground" />
          </motion.button>
        </div>
        <p className="text-center text-xs text-muted-foreground">Tap to start conversation</p>
      </motion.div>
    </div>
  );
};

export default Briefing;
