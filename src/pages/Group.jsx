import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Users, Sparkles } from "lucide-react";
import { createPageUrl } from "@/utils";
import PostCard from "@/components/groups/PostCard";
import ComposeBox from "@/components/groups/ComposeBox";
import { AnimatePresence } from "framer-motion";

const gradients = {
  coral: "from-rose-400 to-orange-300",
  purple: "from-violet-400 to-purple-300",
  teal: "from-teal-400 to-cyan-300",
  amber: "from-amber-400 to-yellow-300",
  blue: "from-blue-400 to-indigo-300",
  pink: "from-pink-400 to-rose-300",
};

export default function GroupPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const groupId = urlParams.get('id');
  const queryClient = useQueryClient();
  
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) return null;
      return base44.auth.me();
    },
  });
  
  const { data: group, isLoading: groupLoading } = useQuery({
    queryKey: ['group', groupId],
    queryFn: async () => {
      const groups = await base44.entities.Group.filter({ id: groupId });
      return groups[0];
    },
    enabled: !!groupId,
  });
  
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['posts', groupId],
    queryFn: () => base44.entities.Post.filter({ group_id: groupId }, '-created_date'),
    enabled: !!groupId,
  });
  
  const createPostMutation = useMutation({
    mutationFn: async (content) => {
      await base44.entities.Post.create({
        content,
        group_id: groupId,
        author_name: user?.full_name || 'Anonymous',
        author_email: user?.email,
        reactions: {},
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', groupId] });
    },
  });
  
  const reactMutation = useMutation({
    mutationFn: async ({ postId, emoji }) => {
      const post = posts.find(p => p.id === postId);
      if (!post || !user?.email) return;
      
      const reactions = { ...(post.reactions || {}) };
      const emojiReactions = reactions[emoji] || [];
      
      if (emojiReactions.includes(user.email)) {
        reactions[emoji] = emojiReactions.filter(e => e !== user.email);
        if (reactions[emoji].length === 0) delete reactions[emoji];
      } else {
        reactions[emoji] = [...emojiReactions, user.email];
      }
      
      await base44.entities.Post.update(postId, { reactions });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', groupId] });
    },
  });
  
  const gradient = gradients[group?.cover_color] || gradients.purple;
  
  if (!groupId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Group not found</h2>
          <Link to={createPageUrl('Home')}>
            <Button>Go back home</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-rose-50/30">
      {/* Hero Header */}
      <div className={`bg-gradient-to-br ${gradient} relative overflow-hidden`}>
        {group?.cover_image && (
          <img src={group.cover_image} alt={group.name} className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-black/20" />
        
        <div className="relative max-w-4xl mx-auto px-4 py-8">
          <Link to={createPageUrl('Home')}>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mb-6 text-white/90 hover:text-white hover:bg-white/20 gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to groups
            </Button>
          </Link>
          
          {groupLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-64 bg-white/20" />
              <Skeleton className="h-5 w-32 bg-white/20" />
            </div>
          ) : (
            <>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 drop-shadow-md">
                {group?.name}
              </h1>
              <div className="flex items-center gap-4 text-white/90">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>{group?.member_count || 0} members</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Prompt Banner */}
      {group?.prompt && (
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center gap-3 text-slate-700">
              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-violet-500" />
              </div>
              <p className="font-medium">{group.prompt}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Compose Box */}
        {user && (
          <div className="mb-8">
            <ComposeBox 
              onSubmit={(content) => createPostMutation.mutate(content)}
              isLoading={createPostMutation.isPending}
              prompt={group?.prompt || "Share your thoughts..."}
            />
          </div>
        )}
        
        {/* Posts Feed */}
        <div className="space-y-4">
          {postsLoading ? (
            [1, 2, 3].map(i => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-200">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-violet-100 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-violet-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                No posts yet
              </h3>
              <p className="text-slate-500">
                Be the first to share your thoughts!
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserEmail={user?.email}
                  onReact={(postId, emoji) => reactMutation.mutate({ postId, emoji })}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  );
}