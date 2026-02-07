import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LogIn, LogOut, Users, Compass, Plus, Moon, Sun } from "lucide-react";
import GroupCard from "@/components/groups/GroupCard";
import CreateGroupModal from "@/components/groups/CreateGroupModal";
import { AnimatePresence } from "framer-motion";

export default function Home() {
  const queryClient = useQueryClient();
  const [loadingGroupId, setLoadingGroupId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);
  
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) return null;
      return base44.auth.me();
    },
  });
  
  const { data: groups = [], isLoading: groupsLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: () => base44.entities.Group.list(),
  });
  
  const { data: memberships = [] } = useQuery({
    queryKey: ['memberships', user?.email],
    queryFn: () => base44.entities.GroupMembership.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });
  
  const joinMutation = useMutation({
    mutationFn: async (groupId) => {
      setLoadingGroupId(groupId);
      await base44.entities.GroupMembership.create({
        user_email: user.email,
        group_id: groupId,
      });
      const group = groups.find(g => g.id === groupId);
      if (group) {
        await base44.entities.Group.update(groupId, {
          member_count: (group.member_count || 0) + 1
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memberships'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      setLoadingGroupId(null);
    },
    onError: () => setLoadingGroupId(null),
  });
  
  const leaveMutation = useMutation({
    mutationFn: async (groupId) => {
      setLoadingGroupId(groupId);
      const membership = memberships.find(m => m.group_id === groupId);
      if (membership) {
        await base44.entities.GroupMembership.delete(membership.id);
        const group = groups.find(g => g.id === groupId);
        if (group && group.member_count > 0) {
          await base44.entities.Group.update(groupId, {
            member_count: group.member_count - 1
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memberships'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      setLoadingGroupId(null);
    },
    onError: () => setLoadingGroupId(null),
  });

  const createGroupMutation = useMutation({
    mutationFn: async (groupData) => {
      const group = await base44.entities.Group.create(groupData);
      // Auto-join the created group
      await base44.entities.GroupMembership.create({
        user_email: user.email,
        group_id: group.id,
      });
      await base44.entities.Group.update(group.id, { member_count: 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['memberships'] });
      setShowCreateModal(false);
    },
  });
  
  const memberGroupIds = new Set(memberships.map(m => m.group_id));
  const myGroups = groups.filter(g => memberGroupIds.has(g.id));
  const discoverGroups = groups.filter(g => !memberGroupIds.has(g.id));
  
  const handleLogin = () => base44.auth.redirectToLogin();
  const handleLogout = () => base44.auth.logout();
  
  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-rose-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950`}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">J</span>
            </div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">Journeys</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
              className="text-slate-600 dark:text-slate-300"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            
            {userLoading ? (
              <Skeleton className="w-24 h-9" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600 dark:text-slate-300 hidden sm:block">
                  {user.full_name || user.email}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="gap-2 dark:border-slate-600 dark:text-slate-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Log out</span>
                </Button>
              </div>
            ) : (
              <Button 
                onClick={handleLogin}
                className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 gap-2"
              >
                <LogIn className="w-4 h-4" />
                Sign in
              </Button>
            )}
          </div>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* My Groups Section */}
        {user && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-violet-500" />
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">My Groups</h2>
              </div>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Group
              </Button>
            </div>
            
            {groupsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-48 rounded-xl" />
                ))}
              </div>
            ) : myGroups.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center border border-dashed border-slate-200 dark:border-slate-700">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center">
                  <Users className="w-8 h-8 text-violet-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                  No groups yet
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  Join a group below to start your journaling journey
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {myGroups.map(group => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      isMember={true}
                      onLeave={(id) => leaveMutation.mutate(id)}
                      isLoading={loadingGroupId === group.id}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </section>
        )}
        
        {/* Discover Section */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Compass className="w-5 h-5 text-rose-500" />
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Discover Groups</h2>
          </div>
          
          {groupsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : discoverGroups.length === 0 && user ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center border border-dashed border-slate-200 dark:border-slate-700">
              <p className="text-slate-500 dark:text-slate-400">
                You've joined all available groups! 🎉
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {(user ? discoverGroups : groups).map(group => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    isMember={false}
                    onJoin={(id) => {
                      if (!user) {
                        base44.auth.redirectToLogin();
                        return;
                      }
                      joinMutation.mutate(id);
                    }}
                    isLoading={loadingGroupId === group.id}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </main>

      <CreateGroupModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={(data) => createGroupMutation.mutate(data)}
        isLoading={createGroupMutation.isPending}
      />
    </div>
  );
}