"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { AddExpenseDialog } from "@/components/expenses/add-expense-dialog";
import { BalanceSummary } from "@/components/expenses/balance-summary";
import {
  PlusCircle, Receipt, DollarSign, TrendingUp, TrendingDown, ArrowRight
} from "lucide-react";
import {
  formatCurrency, formatDate, getExpenseCategoryIcon, getInitials
} from "@/lib/utils";

interface ExpensesTabProps {
  trip: any;
  expenses: any[];
  members: any[];
  currentUser: any;
}

export function ExpensesTab({ trip, expenses, members, currentUser }: ExpensesTabProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [view, setView] = useState<"list" | "balances">("list");

  const totalExpenses = expenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0);

  // Per-category breakdown
  const byCategory = expenses.reduce((acc: Record<string, number>, e: any) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
    return acc;
  }, {});

  // Per-person paid
  const byPerson = expenses.reduce((acc: Record<string, number>, e: any) => {
    acc[e.paid_by] = (acc[e.paid_by] || 0) + Number(e.amount);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={view === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("list")}
          >
            Expenses
          </Button>
          <Button
            variant={view === "balances" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("balances")}
          >
            Balances
          </Button>
        </div>
        <Button
          variant="gradient"
          size="sm"
          className="gap-2"
          onClick={() => setShowAddDialog(true)}
        >
          <PlusCircle size={16} /> Add Expense
        </Button>
      </div>

      {view === "list" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Expense list */}
          <div className="lg:col-span-2 space-y-3">
            {expenses.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="rounded-full bg-muted p-4">
                    <Receipt size={28} className="text-muted-foreground" />
                  </div>
                  <p className="font-semibold">No expenses yet</p>
                  <p className="text-sm text-muted-foreground">Add your first trip expense</p>
                  <Button variant="gradient" size="sm" onClick={() => setShowAddDialog(true)}>
                    Add Expense
                  </Button>
                </CardContent>
              </Card>
            ) : (
              expenses.map((expense: any) => {
                const userSplit = expense.splits?.find((s: any) => s.user_id === currentUser?.id);
                const isOwed = expense.paid_by !== currentUser?.id && userSplit && !userSplit.is_settled;
                const isPayer = expense.paid_by === currentUser?.id;

                return (
                  <Card key={expense.id} className="transition-all hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-xl shrink-0">
                          {getExpenseCategoryIcon(expense.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium">{expense.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Paid by{" "}
                                <span className="font-medium text-foreground">
                                  {isPayer ? "you" : expense.payer?.full_name ?? expense.payer?.email ?? "Unknown"}
                                </span>{" "}
                                · {formatDate(expense.created_at)}
                              </p>
                            </div>
                            <p className="font-syne font-bold text-lg shrink-0">
                              {formatCurrency(expense.amount)}
                            </p>
                          </div>

                          {expense.notes && (
                            <p className="text-xs text-muted-foreground mt-1 italic">{expense.notes}</p>
                          )}

                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Badge variant="secondary" className="text-[10px] capitalize">
                              {expense.category}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] capitalize">
                              Split {expense.split_type}
                            </Badge>
                            {isOwed && (
                              <Badge variant="warning" className="text-[10px]">
                                You owe {formatCurrency(userSplit?.amount)}
                              </Badge>
                            )}
                            {isPayer && (
                              <Badge variant="success" className="text-[10px]">
                                You paid
                              </Badge>
                            )}
                          </div>

                          {/* Split breakdown */}
                          {expense.splits && expense.splits.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {expense.splits.map((split: any) => (
                                <div
                                  key={split.id}
                                  className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] border ${
                                    split.is_settled
                                      ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900/30 dark:text-emerald-400"
                                      : "bg-muted border-border"
                                  }`}
                                >
                                  <Avatar className="h-3.5 w-3.5">
                                    <AvatarFallback className="text-[8px]">
                                      {getInitials(split.user?.full_name ?? split.user?.email ?? "?")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{split.user?.full_name?.split(" ")[0] ?? "?"}</span>
                                  <span className="font-semibold">{formatCurrency(split.amount)}</span>
                                  {split.is_settled && <span>✓</span>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Summary sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Spent</span>
                  <span className="font-syne font-bold text-lg">{formatCurrency(totalExpenses)}</span>
                </div>
                {trip.budget > 0 && (
                  <>
                    <Progress value={Math.min((totalExpenses / trip.budget) * 100, 100)} />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{((totalExpenses / trip.budget) * 100).toFixed(0)}% of budget</span>
                      <span>{formatCurrency(trip.budget - totalExpenses)} left</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* By category */}
            {Object.keys(byCategory).length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">By Category</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Object.entries(byCategory)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .map(([cat, amount]) => (
                      <div key={cat} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 capitalize">
                          <span>{getExpenseCategoryIcon(cat)}</span>
                          {cat}
                        </span>
                        <span className="font-medium">{formatCurrency(amount as number)}</span>
                      </div>
                    ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <BalanceSummary expenses={expenses} members={members} currentUser={currentUser} />
      )}

      <AddExpenseDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        trip={trip}
        members={members}
        currentUser={currentUser}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}
