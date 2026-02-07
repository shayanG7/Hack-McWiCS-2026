import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles } from "lucide-react";

export default function ComposeBox({ onSubmit, isLoading, prompt }) {
  const [content, setContent] = useState('');
  
  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content);
      setContent('');
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };
  
  return (
    <Card className="p-4 border-0 shadow-lg bg-white">
      <div className="flex items-center gap-2 mb-3 text-violet-600">
        <Sparkles className="w-4 h-4" />
        <span className="text-sm font-medium">{prompt}</span>
      </div>
      
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Share your thoughts..."
        className="min-h-[100px] border-slate-200 focus:border-violet-300 focus:ring-violet-200 resize-none"
      />
      
      <div className="flex justify-between items-center mt-3">
        <span className="text-xs text-slate-400">
          Press ⌘ + Enter to post
        </span>
        <Button 
          onClick={handleSubmit}
          disabled={!content.trim() || isLoading}
          className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 gap-2"
        >
          <Send className="w-4 h-4" />
          Post
        </Button>
      </div>
    </Card>
  );
}