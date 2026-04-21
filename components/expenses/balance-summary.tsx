"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency, getInitials } from "@/lib/utils";

interface BalanceSummaryProps {
  expenses: any[];
  members: any[];
  currentUser: any;
}

export function BalanceSummary({ expenses, members, currentUser }: BalanceSummaryProps) {
  const [settling, setSettling] = useState<string | null>(null);
  const supabase = createClient();

  // Calculate net balance per person
  const balances: Record<string, number> = {};
  const memberMap: Record<string, any> = {};

  members.forEach((m: any) => {
    balances[m.user_id] = 0;
    memberMap[m.user_id] = m.user;
  });

  expenses.forEach((expense: any) => {
    // Payer gets credited
    if (balances[expense.paid_by] !== undefined) {
      balances[expense.paid_by] += Number(expense.amount);
    }
    // Each person owes their split
    expense.splits?.forEach((split: any) => {
      if (!split.is_settled && balances[split.user_id] !== undefined) {
        balances[split.user_id] -= Number(split.amount);
      }
    });
  });

  // Build simplified debts
  const debtors = Object.entries(balances)
    .filter(([, b]) => b < -0.01)
    .map(([id, balance]) => ({ id, balance }))
    .sort((a, b) => a.balance - b.balance);

  const creditors = Object.entries(balances)
    .filter(([, b]) => b > 0.01)
    .map(([id, balance]) => ({ id, balance }))
    .sort((a, b) => b.balance - a.balance);

  // Simplified debts
  type Debt = { from: string; to: string; amount: number };
  const debts: Debt[] = [];
  const debtorsCopy = debtors.map((d) => ({ ...d }));
  const creditorsCopy = creditors.map((c) => ({ ...c }));

  let i = 0, j = 0;
  while (i < debtorsCopy.length && j < creditorsCopy.length) {
    const debtor = debtorsCopy[i];
    const creditor = creditorsCopy[j];
    const amount = Math.min(-debtor.balance, creditor.balance);
    if (amount > 0.01) {
      debts.push({ from: debtor.id, to: creditor.id, amount });
    }
    debtor.balance += amount;
    creditor.balance -= amount;
    if (Math.abs(debtor.balance) < 0.01) i++;
    if (Math.abs(creditor.balance) < 0.01) j++;
  }

  const settleDebt = async (fromId: string, toId: string) => {
    const key = `${fromId}-${toId}`;
    setSettling(key);
    try {
      // Find all unsettled splits where fromId owes toId
      const relevantExpenses = expenses.filter((e: any) => e.paid_by === toId);
      for (const expense of relevantExpenses) {
        const split = expense.splits?.find(
          (s: any) => s.user_id === fromId && !s.is_settled
        );
        if (split) {
          await supabase
            .from("expense_splits")
            .update({ is_settled: true, settled_at: new Date().toISOString() })
            .eq("id", split.id);
        }
      }
      toast.success("Settled up!");
      window.location.reload();
    } catch {
      toast.error("Failed to settle");
    } finally {
      setSettling(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Individual balances */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Individual Balances</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {members.map((m: any) => {
            const balance = balances[m.user_id] ?? 0;
            const isYou = m.user_id === currentUser?.id;
            return (
              <div key={m.user_id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={m.user?.avatar_url ?? ""} />
                  <AvatarFallback className="text-xs">
                    {getInitials(m.user?.full_name ?? m.user?.email ?? "?")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {m.user?.full_name ?? m.user?.email ?? "Unknown"}
                    {isYou && <span className="text-muted-foreground text-xs"> (you)</span>}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-syne font-semibold ${
                    balance > 0.01 ? "text-emerald-600" :
                    balance < -0.01 ? "text-red-500" :
                    "text-muted-foreground"
                  }`}>
                    {balance > 0.01 ? "+" : ""}{formatCurrency(balance)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {balance > 0.01 ? "gets back" : balance < -0.01 ? "owes" : "settled"}
                  </p>
                </div>
                {balance > 0.01 ? (
                  <TrendingUp size={14} className="text-emerald-500 shrink-0" />
                ) : balance < -0.01 ? (
                  <TrendingDown size={14} className="text-red-400 shrink-0" />
                ) : (
                  <CheckCircle2 size={14} className="text-muted-foreground shrink-0" />
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Who owes whom */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Settlement Plan</CardTitle>
        </CardHeader>
        <CardContent>
          {debts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
              <CheckCircle2 size={32} className="text-emerald-500" />
              <p className="font-semibold">All settled up!</p>
              <p className="text-sm text-muted-foreground">No outstanding balances.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {debts.map((debt) => {
                const fromUser = memberMap[debt.from];
                const toUser = memberMap[debt.to];
                const isYouOwe = debt.from === currentUser?.id;
                const isOwedToYou = debt.to === currentUser?.id;
                const key = `${debt.from}-${debt.to}`;

                return (
                  <div
                    key={key}
                    className={`flex items-center gap-3 rounded-xl p-3 border ${
                      isYouOwe ? "border-red-200 bg-red-50/50 dark:border-red-900/30 dark:bg-red-950/10" :
                      isOwedToYou ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-950/10" :
                      "border-border bg-muted/30"
                    }`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={fromUser?.avatar_url ?? ""} />
                      <AvatarFallback className="text-xs">
                        {getInitials(fromUser?.full_name ?? fromUser?.email ?? "?")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {isYouOwe ? "You" : fromUser?.full_name?.split(" ")[0] ?? "?"}
                        </span>
                        {" "}owe{isYouOwe ? "" : "s"}{" "}
                        <span className="font-medium text-foreground">
                          {isOwedToYou ? "you" : toUser?.full_name?.split(" ")[0] ?? "?"}
                        </span>
                      </p>
                      <p className={`font-syne font-bold ${isYouOwe ? "text-red-600" : "text-emerald-600"}`}>
                        {formatCurrency(debt.amount)}
                      </p>
                    </div>
                    <ArrowRight size={14} className="text-muted-foreground shrink-0" />
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={toUser?.avatar_url ?? ""} />
                      <AvatarFallback className="text-xs">
                        {getInitials(toUser?.full_name ?? toUser?.email ?? "?")}
                      </AvatarFallback>
                    </Avatar>
                    {(isYouOwe || isOwedToYou) && (
                      <Button
                        size="sm"
                        variant={isYouOwe ? "destructive" : "outline"}
                        className="text-xs h-7 ml-1"
                        disabled={settling === key}
                        onClick={() => settleDebt(debt.from, debt.to)}
                      >
                        {settling === key ? "..." : "Settle"}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
