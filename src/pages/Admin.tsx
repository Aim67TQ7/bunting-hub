import { HubLayout } from '@/components/hub/HubLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Bell, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function Admin() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in both title and content.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    // TODO: Implement announcement posting to database
    // For now, just show a success message
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: 'Announcement posted',
      description: 'Your announcement has been published.',
    });
    
    setTitle('');
    setContent('');
    setIsSubmitting(false);
  };

  return (
    <HubLayout>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="w-full py-4 px-6">
          <div className="max-w-3xl mx-auto flex items-center gap-4">
            <Link to="/">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Hub
              </Button>
            </Link>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 pb-8">
          <div className="max-w-3xl mx-auto">
            <div className="glass-panel rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[hsl(var(--accent-glow))/0.2] flex items-center justify-center">
                  <Bell className="h-6 w-6 text-[hsl(var(--accent-glow))]" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Post Announcement</h1>
                  <p className="text-white/60">Create a new announcement for all users</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium text-white/80">
                    Title
                  </label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Announcement title..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[hsl(var(--accent-glow))]"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="content" className="text-sm font-medium text-white/80">
                    Content
                  </label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your announcement..."
                    rows={6}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[hsl(var(--accent-glow))] resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[hsl(var(--accent-glow))] hover:bg-[hsl(var(--accent-glow))]/90 text-white"
                >
                  {isSubmitting ? (
                    'Posting...'
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Post Announcement
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </HubLayout>
  );
}
