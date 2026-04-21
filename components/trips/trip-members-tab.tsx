"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Copy, Check, Share2, UserMinus, Crown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { getInitials, formatRelativeTime } from "@/lib/utils";

interface TripMembersTabProps {
  trip: any;
  members: any[];
  currentUser: any;
  userRole: string;
}

export function TripMembersTab({ trip, members, currentUser, userRole }: TripMembersTabProps) {
  const [copied, setCopied] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const supabase = createClient();

  const copyInviteLink = () => {
    const link = `${window.location.origin}/join?code=${trip.invite_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Invite link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const removeMember = async (memberId: string, userId: string) => {
    if (userId === trip.created_by) {
      toast.error("Cannot remove the trip owner");
      return;
    }
    setRemoving(memberId);
    const { error } = await supabase
      .from("trip_members")
      .delete()
      .eq("id", memberId);
    if (error) toast.error("Failed to remove member");
    else {
      toast.success("Member removed");
      window.location.reload();
    }
    setRemoving(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {members.length} Member{members.length !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {members.map((m: any) => {
              const isOwner = m.user_id === trip.created_by;
              const isSelf = m.user_id === currentUser?.id;
              return (
                <div key={m.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={m.user?.avatar_url ?? ""} />
                    <AvatarFallback>
                      {getInitials(m.user?.full_name ?? m.user?.email ?? "?")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">
                        {m.user?.full_name ?? m.user?.email ?? "Unknown"}
                      </p>
                      {isSelf && <span className="text-xs text-muted-foreground">(you)</span>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{m.user?.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Joined {formatRelativeTime(m.joined_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isOwner && (
                      <Badge variant="info" className="gap-1">
                        <Crown size={10} /> Owner
                      </Badge>
                    )}
                    {!isOwner && m.role === "admin" && (
                      <Badge variant="warning">Admin</Badge>
                    )}
                    {!isOwner && !isSelf && userRole === "owner" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        disabled={removing === m.id}
                        onClick={() => removeMember(m.id, m.user_id)}
                      >
                        <UserMinus size={14} />
                      </Button>
                    )}
                    {isSelf && !isOwner && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-muted-foreground hover:text-destructive"
                        onClick={() => removeMember(m.id, m.user_id)}
                      >
                        Leave
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Invite panel */}
      <div className="space-y-4">
        <Card className="border-blue-200 dark:border-blue-900/30 bg-blue-50/30 dark:bg-blue-950/10">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Share2 size={16} className="text-blue-600" /> Invite People
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-2">Share this join code</p>
              <div className="rounded-xl border bg-background p-4 text-center">
                <p className="font-syne text-3xl font-bold tracking-[0.2em] text-blue-600">
                  {trip.invite_code}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Or share this link</p>
              <div className="flex gap-2">
                <Input
                  value={`${typeof window !== "undefined" ? window.location.origin : ""}/join?code=${trip.invite_code}`}
                  readOnly
                  className="text-xs h-9"
                />
                <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={copyInviteLink}>
                  {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
