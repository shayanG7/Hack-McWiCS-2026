import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, LogOut, ArrowRight } from "lucide-react";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

const gradients = {
  coral: "from-rose-400 to-orange-300",
  purple: "from-violet-400 to-purple-300",
  teal: "from-teal-400 to-cyan-300",
  amber: "from-amber-400 to-yellow-300",
  blue: "from-blue-400 to-indigo-300",
  pink: "from-pink-400 to-rose-300",
};

export default function GroupCard({ group, isMember, onJoin, onLeave, isLoading }) {
  const gradient = gradients[group.cover_color] || gradients.coral;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 dark:bg-slate-800">
        <div className={`h-24 bg-gradient-to-br ${gradient} relative`}>
          {group.cover_image && (
            <img src={group.cover_image} alt={group.name} className="absolute inset-0 w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute bottom-3 left-4 right-4">
            <h3 className="text-white font-bold text-lg truncate drop-shadow-md">
              {group.name}
            </h3>
          </div>
        </div>
        
        <div className="p-4 bg-white dark:bg-slate-800">
          <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2 mb-4 min-h-[40px]">
            {group.description || group.prompt}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm">
              <Users className="w-4 h-4" />
              <span>{group.member_count || 0} members</span>
            </div>
            
            {isMember ? (
              <div className="flex gap-2">
                <Link to={createPageUrl(`Group?id=${group.id}`)}>
                  <Button size="sm" className="bg-slate-800 hover:bg-slate-900 gap-1">
                    Open <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => onLeave(group.id)}
                  disabled={isLoading}
                  className="text-slate-500 hover:text-rose-500 hover:bg-rose-50"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button 
                size="sm"
                onClick={() => onJoin(group.id)}
                disabled={isLoading}
                className={`bg-gradient-to-r ${gradient} text-white border-0 hover:opacity-90`}
              >
                Join Group
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}