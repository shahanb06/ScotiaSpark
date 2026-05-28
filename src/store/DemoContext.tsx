import React, { createContext, useContext, useState, useCallback } from 'react';
import { SCENE_REWARD_GOALS, checkGoalUnlocks, getProgressForGoal, getCurrentGoal } from '../lib/rewards';
import type { RewardGoal } from '../lib/rewards';
import { getQuote } from '../lib/quotes';

export interface Account {
  id: string;
  type: 'FHSA' | 'TFSA' | 'RRSP' | 'RESP' | 'Non-registered' | 'Chequing' | 'Savings';
  name: string;
  balance: number;
  goal?: number;
  allocation: string[];
}

export interface WatchlistItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface Milestone {
  icon: string;
  title: string;
  date: string;
  points: number;
}

export interface LessonData {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

export interface Holding {
  ticker: string;
  name: string;
  type: 'etf' | 'stock' | 'bond';
  shares: number;
  avgCostBasis: number;
  heldSince: string;
}

interface DemoState {
  userName: string;
  userAge: number;
  investingSince: string | null;
  hasOnboarded: boolean;
  selectedGoal: string | null;
  timeHorizon: number;
  riskComfort: string | null;

  // Accounts
  chequingBalance: number;
  idleCashAmount: number;
  idleCashDays: number;
  accounts: Account[];
  totalInvestable: number;

  // Scene+
  scenePoints: number;

  // Rewards
  unlockedGoalIds: string[];
  lifetimeInvested: number;

  // Holdings
  holdings: Holding[];

  // Spark feed
  hasDismissedIdleCash: boolean;
  briefingCardsRead: number;

  // Watchlist
  watchlist: WatchlistItem[];

  // Lessons
  lessons: LessonData[];
  certificateEarned: boolean;

  // Milestones
  milestones: Milestone[];

  // Recurring
  recurringAmount: number;
  recurringFrequency: string;
  recurringEnabled: boolean;

  // Circles
  circleGoal: string;
  circleProgress: number;
  circleGoalTarget: number;
}

const initialLessons: LessonData[] = [
  { id: 1, title: 'What is investing?', description: 'Your money grows by owning a piece of something that grows.', completed: false },
  { id: 2, title: 'Stocks vs. ETFs', description: 'One company vs. a basket — and why beginners love baskets.', completed: false },
  { id: 3, title: 'What is an ETF?', description: 'A single purchase that instantly diversifies your money across hundreds of companies.', completed: false },
  { id: 4, title: 'Risk and reward', description: 'Higher potential returns come with higher ups and downs. Time smooths the ride.', completed: false },
  { id: 5, title: 'TFSA explained', description: 'Invest inside a tax shelter. Your gains stay yours — tax-free.', completed: false },
  { id: 6, title: 'FHSA explained', description: 'Save for your first home with tax deductions going in and tax-free gains coming out.', completed: false },
  { id: 7, title: 'RRSP explained', description: 'Lower your tax bill today. Pay taxes later when you withdraw in retirement.', completed: false },
  { id: 8, title: 'Compound growth', description: 'Your gains earn gains. Time is the most powerful ingredient.', completed: false },
  { id: 9, title: 'Diversification', description: 'Don\'t put all your eggs in one basket. Spread across sectors and geographies.', completed: false },
  { id: 10, title: 'Dollar-cost averaging', description: 'Invest the same amount regularly. You automatically buy more when prices dip.', completed: false },
  { id: 11, title: 'Fees matter', description: 'A 1% fee doesn\'t sound like much, but over 30 years it can cost you tens of thousands.', completed: false },
  { id: 12, title: 'Your first investment', description: 'You don\'t need $10,000 to start. $25 is enough. The best time to start is now.', completed: false },
];

const getInitialState = (): DemoState => ({
  userName: 'Alex',
  userAge: 24,
  investingSince: null,
  hasOnboarded: true,
  selectedGoal: null,
  timeHorizon: 5,
  riskComfort: null,
  chequingBalance: 8450.00,
  idleCashAmount: 4200.00,
  idleCashDays: 89,
  accounts: [
    { id: 'tfsa', type: 'TFSA', name: 'Scotia Tax-Free Investment Account', balance: 4830.08, goal: 25000, allocation: ['Equities', 'Bonds', 'Cash'] },
    { id: 'fhsa', type: 'FHSA', name: 'Scotia First Home Savings Account', balance: 5820.15, goal: 40000, allocation: ['Equities', 'Bonds', 'Cash'] },
    { id: 'personal', type: 'Non-registered', name: 'Personal Investing', balance: 1800.00, goal: 10000, allocation: ['Equities', 'Bonds', 'Cash'] },
    { id: 'cheq', type: 'Chequing', name: 'Chequing', balance: 8450.00, allocation: [] },
  ],
  totalInvestable: 12450.23,
  scenePoints: 0,
  unlockedGoalIds: [],
  lifetimeInvested: 0,
  holdings: [],
  hasDismissedIdleCash: false,
  briefingCardsRead: 0,
  watchlist: [],
  lessons: [...initialLessons],
  certificateEarned: false,
  milestones: [],
  recurringAmount: 50,
  recurringFrequency: 'Biweekly',
  recurringEnabled: false,
  circleGoal: 'First Home Fund',
  circleProgress: 3200,
  circleGoalTarget: 40000,
});

interface ToastInfo {
  message: string;
}

interface DemoContextType extends DemoState {
  completeOnboarding: (goal: string, horizon: number, risk: string) => void;
  moveIdleCash: () => ToastInfo[];
  addToWatchlist: (item: WatchlistItem) => void;
  removeFromWatchlist: (symbol: string) => void;
  completeLesson: (id: number) => ToastInfo[];
  addScenePoints: (amount: number, reason: string) => void;
  setupRecurring: (amount: number, frequency: string) => ToastInfo[];
  buyShares: (ticker: string, dollarAmount: number, fromAccountId: string, quote: { price: number; name: string; type: 'etf' | 'stock' | 'bond' }) => ToastInfo;
  sellShares: (ticker: string, sharesAmount: number, quote: { price: number }) => ToastInfo;
  deposit: (amount: number, toAccountId: string) => ToastInfo;
  withdraw: (amount: number, fromAccountId: string) => ToastInfo;
  resetDemo: () => void;
  setHasOnboarded: (v: boolean) => void;
  getRewardState: () => { completedLessonCount: number; lifetimeInvested: number; recurringSetupCount: number; fhsaPercent: number; unlockedGoalIds: string[] };
}

const DemoContext = createContext<DemoContextType | null>(null);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DemoState>(getInitialState());

  const getRewardState = useCallback(() => {
    const completedLessonCount = state.lessons.filter(l => l.completed).length;
    const fhsa = state.accounts.find(a => a.type === 'FHSA');
    const fhsaPercent = fhsa && fhsa.goal ? (fhsa.balance / fhsa.goal) * 100 : 0;
    return {
      completedLessonCount,
      lifetimeInvested: state.lifetimeInvested,
      recurringSetupCount: state.recurringEnabled ? 1 : 0,
      fhsaPercent,
      unlockedGoalIds: state.unlockedGoalIds,
    };
  }, [state]);

  const processGoalUnlocks = (newState: DemoState): { state: DemoState; toasts: ToastInfo[] } => {
    const completedLessonCount = newState.lessons.filter(l => l.completed).length;
    const fhsa = newState.accounts.find(a => a.type === 'FHSA');
    const fhsaPercent = fhsa && fhsa.goal ? (fhsa.balance / fhsa.goal) * 100 : 0;
    const rewardState = {
      completedLessonCount,
      lifetimeInvested: newState.lifetimeInvested,
      recurringSetupCount: newState.recurringEnabled ? 1 : 0,
      fhsaPercent,
      unlockedGoalIds: newState.unlockedGoalIds,
    };
    const newlyUnlocked = checkGoalUnlocks(rewardState);
    const toasts: ToastInfo[] = [];
    if (newlyUnlocked.length > 0) {
      let pointsEarned = 0;
      const newMilestones = [...newState.milestones];
      for (const goalId of newlyUnlocked) {
        const goal = SCENE_REWARD_GOALS.find(g => g.id === goalId)!;
        pointsEarned += goal.pointsOnUnlock;
        newMilestones.unshift({
          icon: '🎯',
          title: goal.title,
          date: new Date().toLocaleDateString('en-CA'),
          points: goal.pointsOnUnlock,
        });
        toasts.push({ message: `Goal unlocked · ${goal.title} · +${goal.pointsOnUnlock} Scene+` });
      }
      newState = {
        ...newState,
        scenePoints: newState.scenePoints + pointsEarned,
        unlockedGoalIds: [...newState.unlockedGoalIds, ...newlyUnlocked],
        milestones: newMilestones,
        certificateEarned: newState.certificateEarned || newlyUnlocked.includes('goal_basics'),
      };
    }
    return { state: newState, toasts };
  };

  const completeOnboarding = useCallback((goal: string, horizon: number, risk: string) => {
    setState(prev => ({
      ...prev,
      hasOnboarded: true,
      selectedGoal: goal,
      timeHorizon: horizon,
      riskComfort: risk,
      investingSince: new Date().toLocaleDateString('en-CA', { month: 'long', year: 'numeric' }),
      scenePoints: prev.scenePoints + 250,
      milestones: [{ icon: '🌱', title: 'Started your investing journey', date: new Date().toLocaleDateString('en-CA'), points: 250 }, ...prev.milestones],
    }));
  }, []);

  const moveIdleCash = useCallback((): ToastInfo[] => {
    let toasts: ToastInfo[] = [];
    setState(prev => {
      const fhsaIndex = prev.accounts.findIndex(a => a.type === 'FHSA');
      const cheqIndex = prev.accounts.findIndex(a => a.type === 'Chequing');
      const newAccounts = [...prev.accounts];
      if (fhsaIndex >= 0) {
        newAccounts[fhsaIndex] = { ...newAccounts[fhsaIndex], balance: newAccounts[fhsaIndex].balance + prev.idleCashAmount };
      }
      if (cheqIndex >= 0) {
        newAccounts[cheqIndex] = { ...newAccounts[cheqIndex], balance: newAccounts[cheqIndex].balance - prev.idleCashAmount };
      }
      let newState: DemoState = {
        ...prev,
        chequingBalance: prev.chequingBalance - prev.idleCashAmount,
        idleCashAmount: 0,
        hasDismissedIdleCash: true,
        accounts: newAccounts,
        totalInvestable: prev.totalInvestable + 4200,
        lifetimeInvested: prev.lifetimeInvested + 4200,
      };
      const result = processGoalUnlocks(newState);
      toasts = result.toasts;
      return result.state;
    });
    return toasts;
  }, []);

  const addToWatchlist = useCallback((item: WatchlistItem) => {
    setState(prev => ({
      ...prev,
      watchlist: prev.watchlist.some(w => w.symbol === item.symbol) ? prev.watchlist : [...prev.watchlist, item],
    }));
  }, []);

  const removeFromWatchlist = useCallback((symbol: string) => {
    setState(prev => ({ ...prev, watchlist: prev.watchlist.filter(w => w.symbol !== symbol) }));
  }, []);

  const completeLesson = useCallback((id: number): ToastInfo[] => {
    let toasts: ToastInfo[] = [];
    setState(prev => {
      const lesson = prev.lessons.find(l => l.id === id);
      if (!lesson || lesson.completed) return prev;
      const newLessons = prev.lessons.map(l => l.id === id ? { ...l, completed: true } : l);
      const completedCount = newLessons.filter(l => l.completed).length;
      let newState: DemoState = {
        ...prev,
        lessons: newLessons,
        milestones: [
          { icon: '📖', title: `Completed: ${lesson.title}`, date: new Date().toLocaleDateString('en-CA'), points: 0 },
          ...prev.milestones,
        ],
      };
      toasts = [{ message: `Lesson complete · ${completedCount} of 12 toward Scotia Basics Reward` }];
      const result = processGoalUnlocks(newState);
      toasts = [...toasts, ...result.toasts];
      return result.state;
    });
    return toasts;
  }, []);

  const addScenePoints = useCallback((amount: number, _reason: string) => {
    setState(prev => ({ ...prev, scenePoints: prev.scenePoints + amount }));
  }, []);

  const setupRecurring = useCallback((amount: number, frequency: string): ToastInfo[] => {
    let toasts: ToastInfo[] = [];
    setState(prev => {
      let newState: DemoState = {
        ...prev,
        recurringAmount: amount,
        recurringFrequency: frequency,
        recurringEnabled: true,
        milestones: [
          { icon: '🔄', title: 'Set up recurring contributions', date: new Date().toLocaleDateString('en-CA'), points: 0 },
          ...prev.milestones,
        ],
      };
      const result = processGoalUnlocks(newState);
      toasts = result.toasts;
      return result.state;
    });
    return toasts;
  }, []);

  const buyShares = useCallback((ticker: string, dollarAmount: number, fromAccountId: string, quote: { price: number; name: string; type: 'etf' | 'stock' | 'bond' }): ToastInfo => {
    const sharesToAdd = Math.round((dollarAmount / quote.price) * 10000) / 10000;
    setState(prev => {
      const newAccounts = prev.accounts.map(a =>
        a.id === fromAccountId ? { ...a, balance: a.balance - dollarAmount } : a
      );
      const cheqIndex = newAccounts.findIndex(a => a.type === 'Chequing');
      if (fromAccountId === 'cheq' && cheqIndex >= 0) {
        // chequingBalance is redundant but keep in sync
      }
      const existingIdx = prev.holdings.findIndex(h => h.ticker === ticker);
      let newHoldings = [...prev.holdings];
      if (existingIdx >= 0) {
        const old = newHoldings[existingIdx];
        const newShares = old.shares + sharesToAdd;
        const newCost = ((old.shares * old.avgCostBasis) + (sharesToAdd * quote.price)) / newShares;
        newHoldings[existingIdx] = { ...old, shares: newShares, avgCostBasis: newCost };
      } else {
        newHoldings.push({
          ticker,
          name: quote.name,
          type: quote.type,
          shares: sharesToAdd,
          avgCostBasis: quote.price,
          heldSince: new Date().toISOString().split('T')[0],
        });
      }
      return {
        ...prev,
        accounts: newAccounts,
        chequingBalance: fromAccountId === 'cheq' ? prev.chequingBalance - dollarAmount : prev.chequingBalance,
        holdings: newHoldings,
        // NO lifetimeInvested increment, NO Scene+ event
      };
    });
    return { message: `Bought ${sharesToAdd.toFixed(4)} shares of ${ticker}` };
  }, []);

  const sellShares = useCallback((ticker: string, sharesAmount: number, quote: { price: number }): ToastInfo => {
    const proceeds = Math.round(sharesAmount * quote.price * 100) / 100;
    setState(prev => {
      let newHoldings = prev.holdings.map(h => {
        if (h.ticker !== ticker) return h;
        return { ...h, shares: Math.round((h.shares - sharesAmount) * 10000) / 10000 };
      }).filter(h => h.shares > 0.0001);
      const cheqIndex = prev.accounts.findIndex(a => a.type === 'Chequing');
      const newAccounts = [...prev.accounts];
      if (cheqIndex >= 0) {
        newAccounts[cheqIndex] = { ...newAccounts[cheqIndex], balance: newAccounts[cheqIndex].balance + proceeds };
      }
      return {
        ...prev,
        holdings: newHoldings,
        accounts: newAccounts,
        chequingBalance: prev.chequingBalance + proceeds,
        // NO lifetimeInvested increment, NO Scene+ event
      };
    });
    return { message: `Sold ${sharesAmount.toFixed(4)} shares of ${ticker} · $${proceeds.toFixed(2)} returned to chequing` };
  }, []);

  const deposit = useCallback((amount: number, toAccountId: string): ToastInfo => {
    setState(prev => {
      const newAccounts = prev.accounts.map(a =>
        a.id === toAccountId ? { ...a, balance: a.balance + amount } : a
      );
      return {
        ...prev,
        accounts: newAccounts,
        chequingBalance: toAccountId === 'cheq' ? prev.chequingBalance + amount : prev.chequingBalance,
      };
    });
    const acctName = toAccountId === 'cheq' ? 'chequing' : toAccountId;
    return { message: `$${amount.toFixed(0)} deposited to ${acctName}` };
  }, []);

  const withdraw = useCallback((amount: number, fromAccountId: string): ToastInfo => {
    setState(prev => {
      const newAccounts = prev.accounts.map(a =>
        a.id === fromAccountId ? { ...a, balance: a.balance - amount } : a
      );
      return {
        ...prev,
        accounts: newAccounts,
        chequingBalance: fromAccountId === 'cheq' ? prev.chequingBalance - amount : prev.chequingBalance,
      };
    });
    return { message: `$${amount.toFixed(0)} withdrawn to your external account` };
  }, []);

  const resetDemo = useCallback(() => {
    setState(getInitialState());
  }, []);

  const setHasOnboarded = useCallback((v: boolean) => {
    setState(prev => ({ ...prev, hasOnboarded: v }));
  }, []);

  return (
    <DemoContext.Provider value={{
      ...state,
      completeOnboarding,
      moveIdleCash,
      addToWatchlist,
      removeFromWatchlist,
      completeLesson,
      addScenePoints,
      setupRecurring,
      buyShares,
      sellShares,
      deposit,
      withdraw,
      resetDemo,
      setHasOnboarded,
      getRewardState,
    }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemo must be used within DemoProvider');
  return ctx;
}
