import React, { createContext, useContext, useState } from "react";

type Transaction = {
  id: string;
  amount: number;
  description: string;
  category: string;
};

type TransactionsContextType = {
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, "id">) => void;
};

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

export const TransactionsProvider = ({ children }: { children: React.ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const addTransaction = (tx: Omit<Transaction, "id">) => {
    const newTx = {
      ...tx,
      id: Date.now().toString(),
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  return (
    <TransactionsContext.Provider value={{ transactions, addTransaction }}>
      {children}
    </TransactionsContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionsContext);
  if (!context) {
    throw new Error("useTransactions must be used inside TransactionsProvider");
  }
  return context;
};