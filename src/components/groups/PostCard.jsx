import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

const reactionEmojis = ['❤️', '🔥', '👏', '💡', '🎉'];

export default function PostCard({ post, currentUserEmail, onReact }) {
  const reactions = post.reactions || {};
  const initials = post.author_name 
    ? post.author_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : post.author_email?.charAt(0).toUpperCase() || '?';
  
  const hasUserReacted = (emoji) => {
    return reactions[emoji]?.includes(currentUserEmail);
  };
  
  const getReactionCount = (emoji) => {
    return reactions[emoji]?.length || 0;
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-5 border-0 shadow-md hover:shadow-lg transition-shadow bg-white">
        <div className="flex gap-4">
          <Avatar className="w-10 h-10 bg-gradient-to-br from-violet-400 to-purple-500">
            <AvatarFallback className="bg-transparent text-white font-semibold text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-slate-800">
                {post.author_name || 'Anonymous'}
              </span>
              <span className="text-slate-400 text-sm">·</span>
              <span className="text-slate-400 text-sm">
                {formatDistanceToNow(new Date(post.created_date), { addSuffix: true })}
              </span>
            </div>
            
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
            
            <div className="flex gap-1 mt-4 flex-wrap">
              {reactionEmojis.map((emoji) => {
                const count = getReactionCount(emoji);
                const hasReacted = hasUserReacted(emoji);
                
                return (
                  <Button
                    key={emoji}
                    variant="ghost"
                    size="sm"
                    onClick={() => onReact(post.id, emoji)}
                    className={`h-8 px-3 rounded-full transition-all ${
                      hasReacted 
                        ? 'bg-violet-100 hover:bg-violet-200 border-violet-200 border' 
                        : 'hover:bg-slate-100 border border-transparent'
                    }`}
                  >
                    <span className="mr-1">{emoji}</span>
                    {count > 0 && (
                      <span className={`text-xs ${hasReacted ? 'text-violet-600' : 'text-slate-500'}`}>
                        {count}
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}