import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { base44 } from '@/api/base44Client';

const colorOptions = [
  { id: 'coral', gradient: 'from-rose-400 to-orange-300' },
  { id: 'purple', gradient: 'from-violet-400 to-purple-300' },
  { id: 'teal', gradient: 'from-teal-400 to-cyan-300' },
  { id: 'amber', gradient: 'from-amber-400 to-yellow-300' },
  { id: 'blue', gradient: 'from-blue-400 to-indigo-300' },
  { id: 'pink', gradient: 'from-pink-400 to-rose-300' },
];

export default function CreateGroupModal({ open, onOpenChange, onSubmit, isLoading }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [prompt, setPrompt] = useState('');
  const [coverColor, setCoverColor] = useState('purple');
  const [coverImage, setCoverImage] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setCoverImage(file_url);
    setUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && prompt.trim()) {
      onSubmit({ name, description, prompt, cover_color: coverColor, cover_image: coverImage || null, member_count: 0 });
      setName('');
      setDescription('');
      setPrompt('');
      setCoverColor('purple');
      setCoverImage('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md dark:bg-slate-900 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="dark:text-white">Create New Group</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="dark:text-slate-200">Group Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Morning Reflections"
              className="mt-1 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
              required
            />
          </div>
          <div>
            <Label htmlFor="description" className="dark:text-slate-200">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this group about?"
              className="mt-1 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
            />
          </div>
          <div>
            <Label htmlFor="prompt" className="dark:text-slate-200">Writing Prompt</Label>
            <Input
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., What made you smile today?"
              className="mt-1 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
              required
            />
          </div>
          <div>
            <Label className="dark:text-slate-200">Cover Image (optional)</Label>
            <div className="mt-2">
              {coverImage ? (
                <div className="relative w-full h-24 rounded-lg overflow-hidden">
                  <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setCoverImage('')}
                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-violet-400 transition-colors">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  {uploading ? (
                    <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                  ) : (
                    <div className="text-center">
                      <ImagePlus className="w-6 h-6 text-slate-400 mx-auto" />
                      <span className="text-xs text-slate-500 dark:text-slate-400">Upload image</span>
                    </div>
                  )}
                </label>
              )}
            </div>
          </div>
          <div>
            <Label className="dark:text-slate-200">Cover Color {coverImage && "(fallback)"}</Label>
            <div className="flex gap-2 mt-2">
              {colorOptions.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => setCoverColor(color.id)}
                  className={`w-8 h-8 rounded-full bg-gradient-to-br ${color.gradient} transition-all ${
                    coverColor === color.id ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-offset-slate-900' : ''
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="dark:border-slate-600 dark:text-slate-200">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !name.trim() || !prompt.trim()}
              className="bg-gradient-to-r from-violet-500 to-purple-500"
            >
              Create Group
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}