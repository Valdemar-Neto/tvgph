'use client';

import { useState, useTransition } from 'react';
import { MessageSquare, Send, Trash2, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { postCommentAction, deleteCommentAction } from '@/app/actions/social';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
    role: string;
  };
}

interface CommentSectionProps {
  reportId: string;
  initialComments: any[];
  currentUserId: string;
  currentUserRole: string;
}

export function CommentSection({ reportId, initialComments, currentUserId, currentUserRole }: CommentSectionProps) {
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState('');

  // Nota: Em um app real usaríamos revalidation do server components, 
  // mas aqui vamos tratar o estado local para feedback instantâneo.
  const [comments, setComments] = useState<Comment[]>(initialComments);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isPending) return;

    startTransition(async () => {
      const result = await postCommentAction(reportId, content);
      if (result.success) {
        setContent('');
        toast.success('COMS_ACK: Mensagem transmitida.');
        // O revalidatePath cuidará do resto, mas o ideal seria um router.refresh() 
        // ou deixar o NextJS gerenciar a atualização.
        window.location.reload(); // Simples para garantir sincronia completa aqui
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('CONFIRM_ERASE: Deseja deletar esta entrada?')) return;

    startTransition(async () => {
      const result = await deleteCommentAction(commentId);
      if (result.success) {
        toast.success('DELETED: Entrada removida do buffer.');
        window.location.reload();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="space-y-8 font-mono">
      <div className="flex items-center gap-3 px-1">
        <MessageSquare className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-bold tracking-widest uppercase">
          COMMENTS <span className="text-primary/50">({comments.length})</span>
        </h3>
      </div>

      {/* Input Area */}
      <div className="circuit-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          COMMENT READY
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="WRITE YOUR COMMENT HERE..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px] bg-background/50 border-primary/20 focus-visible:ring-primary/30 text-xs font-bold uppercase tracking-tight"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isPending || !content.trim()}
              className="circuit-border border-primary text-primary bg-primary/5 hover:bg-primary/10 text-[10px] font-bold uppercase tracking-widest h-9 px-6"
            >
              <Send className="h-3 w-3 mr-2" /> SEND COMMENT
            </Button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="p-12 circuit-border border-dashed border-muted text-center space-y-3 opacity-40">
            <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em]">NO COMMENTS</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="group flex gap-4 animate-in fade-in slide-in-from-left-2 duration-500">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 circuit-border border-primary/30 p-0.5 overflow-hidden bg-background">
                  <img
                    src={comment.user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user.name}`}
                    alt={comment.user.name}
                    className="h-full w-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                  />
                </div>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-foreground tracking-tight uppercase">
                      {comment.user.name}
                    </span>
                    <span className="px-1.5 py-0.5 circuit-border border-muted text-[8px] text-muted-foreground font-bold uppercase tracking-tighter">
                      {comment.user.role}
                    </span>
                    <span className="text-[9px] text-muted-foreground uppercase opacity-50">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ptBR })}
                    </span>
                  </div>

                  {(comment.user.id === currentUserId || ['MANAGER', 'PROFESSOR'].includes(currentUserRole)) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(comment.id)}
                      className="h-6 w-6 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                <div className="p-4 circuit-border border-primary/10 bg-primary/[0.02] relative overflow-hidden group-hover:bg-primary/[0.04] transition-colors">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary/40 transition-colors" />
                  <p className="text-xs text-foreground/80 leading-relaxed font-bold uppercase tracking-tighter whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
