import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, ArrowRight, Loader2, MessageCircle, Check } from 'lucide-react';
import { LANGUAGES, UserProfile } from '@/lib/types';
import { mockProfile } from '@/lib/mock-data';
import { extractProfile, generateScenariosFromMessages } from '@/lib/gemini';
import { saveProfile } from '@/lib/storage';
import { dummyWhatsAppThreads } from '@/lib/whatsapp-messages';

const Onboarding = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile>({ ...mockProfile, display_name: '' });
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'loading' | 'summary'>('form');

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !profile.context_tags.includes(tag)) {
      setProfile(p => ({ ...p, context_tags: [...p.context_tags, tag] }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setProfile(p => ({ ...p, context_tags: p.context_tags.filter(t => t !== tag) }));
  };

  const handleBuildProfile = async () => {
    setStep('loading');
    try {
      const extracted = await extractProfile(profile.bio, profile.context_tags, profile.target_language);
      setProfile(p => ({
        ...p,
        profession: extracted.profession,
        interests: extracted.interests,
        conversation_topics: extracted.conversationTopics,
        display_name: extracted.displayName,
        level: extracted.level,
      }));
    } catch (err) {
      console.error('Profile extraction failed:', err);
      const words = profile.bio.split(/\s+/).filter(Boolean);
      setProfile(p => ({
        ...p,
        profession: p.context_tags[0] || 'Professional',
        interests: p.context_tags.slice(0, 3),
        conversation_topics: ['Daily conversations', 'Work discussions', 'Casual socializing'],
        display_name: words.slice(0, 2).join(' ') || 'User',
        level: 'Intermediate',
      }));
    }
    setStep('summary');
  };

  const [whatsappConnected, setWhatsappConnected] = useState(false);
  const [whatsappLoading, setWhatsappLoading] = useState(false);
  const [whatsappScenariosLoading, setWhatsappScenariosLoading] = useState(false);

  const handleConnectWhatsApp = async () => {
    setWhatsappLoading(true);
    // Simulate WhatsApp connection delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setWhatsappConnected(true);
    setWhatsappLoading(false);

    // Now generate scenarios from the dummy messages
    setWhatsappScenariosLoading(true);
    try {
      const scenarios = await generateScenariosFromMessages(profile);
      saveProfile(profile);
      navigate('/home', { state: { profile, whatsappScenarios: scenarios } });
    } catch (err) {
      console.error('Failed to generate scenarios from messages:', err);
      setWhatsappScenariosLoading(false);
    }
  };

  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const startEdit = (field: string, value: string) => {
    setEditingField(field);
    setEditValue(value);
  };

  const saveEdit = (field: keyof UserProfile) => {
    if (field === 'interests' || field === 'conversation_topics') {
      setProfile(p => ({ ...p, [field]: editValue.split(',').map(s => s.trim()) }));
    } else {
      setProfile(p => ({ ...p, [field]: editValue }));
    }
    setEditingField(null);
  };

  const targetLang = LANGUAGES.find(l => l.code === profile.target_language);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {step === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-lg"
          >
            <Card className="gradient-border border-0">
              <CardContent className="p-8 space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-bold text-foreground">Welcome to Eloquent</h1>
                  <p className="text-muted-foreground text-sm">Tell us about yourself so we can personalize your practice</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Native language</label>
                      <Select value={profile.native_language} onValueChange={v => setProfile(p => ({ ...p, native_language: v }))}>
                        <SelectTrigger className="bg-secondary border-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LANGUAGES.map(l => (
                            <SelectItem key={l.code} value={l.code}>{l.flag} {l.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Target language</label>
                      <Select value={profile.target_language} onValueChange={v => setProfile(p => ({ ...p, target_language: v }))}>
                        <SelectTrigger className="bg-secondary border-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LANGUAGES.map(l => (
                            <SelectItem key={l.code} value={l.code}>{l.flag} {l.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">About you</label>
                    <Textarea
                      className="bg-secondary border-0 min-h-[120px] resize-none"
                      placeholder="Paste your LinkedIn bio, describe your job, your interests, what you talk about day to day..."
                      value={profile.bio}
                      onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Context tags</label>
                    <div className="flex gap-2">
                      <Input
                        className="bg-secondary border-0 flex-1"
                        placeholder="e.g. startup founder"
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      />
                      <Button variant="secondary" size="sm" onClick={addTag} className="shrink-0">Add</Button>
                    </div>
                    {profile.context_tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {profile.context_tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                            {tag}
                            <button onClick={() => removeTag(tag)} className="hover:text-foreground transition-colors">
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  className="w-full gap-2"
                  size="lg"
                  onClick={handleBuildProfile}
                  disabled={!profile.bio.trim()}
                >
                  Build My Profile <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center space-y-4"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center animate-breathe">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
            <p className="text-lg font-medium text-foreground">Learning about you...</p>
            <p className="text-sm text-muted-foreground">Building your personalized profile</p>
          </motion.div>
        )}

        {step === 'summary' && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-lg"
          >
            <Card className="gradient-border border-0">
              <CardContent className="p-8 space-y-6">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center text-xl font-bold text-primary">
                    {profile.display_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <h2 className="text-xl font-bold text-foreground">Here's what Eloquent knows</h2>
                </div>

                <div className="space-y-4">
                  {[
                    { label: 'Profession', field: 'profession' as const, value: profile.profession },
                    { label: 'Key Interests', field: 'interests' as const, value: profile.interests.join(', ') },
                    { label: 'Conversation Topics', field: 'conversation_topics' as const, value: profile.conversation_topics.join(', ') },
                    { label: 'Target Language', field: 'level' as const, value: `${targetLang?.flag} ${targetLang?.name} · ${profile.level}` },
                  ].map(({ label, field, value }) => (
                    <div key={field} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-muted-foreground">{label}</label>
                        <button
                          onClick={() => editingField === field ? saveEdit(field) : startEdit(field, value)}
                          className="text-xs text-primary hover:underline"
                        >
                          {editingField === field ? 'Save' : 'Edit'}
                        </button>
                      </div>
                      {editingField === field ? (
                        <Input
                          className="bg-secondary border-0"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && saveEdit(field)}
                          autoFocus
                        />
                      ) : (
                        <p className="text-sm text-foreground bg-secondary rounded-lg px-3 py-2">{value || '—'}</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* WhatsApp Connect Section */}
                <div className="space-y-3 pt-2">
                  <p className="text-xs text-muted-foreground">Personalize even further with your real conversations</p>

                  {whatsappScenariosLoading ? (
                    <div className="flex items-center justify-center gap-3 py-4">
                      <Loader2 className="h-5 w-5 text-[#25D366] animate-spin" />
                      <div className="text-sm">
                        <p className="font-medium text-foreground">Analyzing your conversations...</p>
                        <p className="text-xs text-muted-foreground">
                          Reading {dummyWhatsAppThreads.length} threads to build real-world scenarios
                        </p>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full gap-2 border-[#25D366]/30 hover:bg-[#25D366]/10 hover:border-[#25D366]/50 transition-all"
                      size="lg"
                      onClick={handleConnectWhatsApp}
                      disabled={whatsappLoading}
                    >
                      {whatsappLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-[#25D366]" />
                      ) : whatsappConnected ? (
                        <Check className="h-4 w-4 text-[#25D366]" />
                      ) : (
                        <MessageCircle className="h-4 w-4 text-[#25D366]" />
                      )}
                      <span className="text-[#25D366] font-medium">
                        {whatsappLoading ? 'Connecting...' : whatsappConnected ? 'Connected' : 'Connect WhatsApp'}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        Generate scenarios from your chats
                      </span>
                    </Button>
                  )}
                </div>

                <Button className="w-full gap-2" size="lg" onClick={() => { saveProfile(profile); navigate('/home', { state: { profile } }); }}>
                  Start Practicing <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Onboarding;
