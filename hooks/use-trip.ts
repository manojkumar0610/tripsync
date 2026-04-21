"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export function useTripRealtime(tripId: string) {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [votes, setVotes] = useState<any[]>([]);
  const supabase = createClient();

  const fetchExpenses = useCallback(async () => {
    const { data } = await supabase
      .from("expenses")
      .select("*, payer:users!expenses_paid_by_fkey(*), splits:expense_splits(*, user:users(*))")
      .eq("trip_id", tripId)
      .order("created_at", { ascending: false });
    if (data) setExpenses(data);
  }, [tripId]);

  const fetchMembers = useCallback(async () => {
    const { data } = await supabase
      .from("trip_members")
      .select("*, user:users(*)")
      .eq("trip_id", tripId);
    if (data) setMembers(data);
  }, [tripId]);

  const fetchVotes = useCallback(async () => {
    const { data } = await supabase
      .from("votes")
      .select("*, responses:vote_responses(*, user:users(*))")
      .eq("trip_id", tripId)
      .order("created_at", { ascending: false });
    if (data) setVotes(data);
  }, [tripId]);

  useEffect(() => {
    fetchExpenses();
    fetchMembers();
    fetchVotes();

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`trip-${tripId}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "expenses",
        filter: `trip_id=eq.${tripId}`,
      }, () => fetchExpenses())
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "trip_members",
        filter: `trip_id=eq.${tripId}`,
      }, () => fetchMembers())
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "vote_responses",
      }, () => fetchVotes())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tripId, fetchExpenses, fetchMembers, fetchVotes]);

  return { expenses, members, votes, refetchExpenses: fetchExpenses, refetchMembers: fetchMembers };
}

export function useCurrentUser() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .single();
        setUser(profile ?? authUser);
      }
      setLoading(false);
    };
    getUser();
  }, []);

  return { user, loading };
}

export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    if (!userId) return;

    const fetch = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.is_read).length);
      }
    };

    fetch();

    const channel = supabase
      .channel(`notifications-${userId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      }, () => fetch())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  const markAllRead = async () => {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  return { notifications, unreadCount, markAllRead };
}
