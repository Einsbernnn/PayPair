import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Session, Expense, Split, User } from 'src/types';
import type { ExpenseInput } from 'src/types/schemas';
import * as sessionService from 'src/services/sessionService';
import * as expenseService from 'src/services/expenseService';
import * as userService from 'src/services/userService';

export const useSessionStore = defineStore('session', () => {
  const sessions = ref<Session[]>([]);
  const currentSession = ref<Session | null>(null);
  const expenses = ref<Expense[]>([]);
  const splits = ref<Split[]>([]);
  const participants = ref<User[]>([]);
  const allUsers = ref<User[]>([]);
  const loading = ref(false);
  const showAddExpense = ref(false);

  async function fetchSessions() {
    loading.value = true;
    try {
      sessions.value = await sessionService.fetchSessions();
    } finally {
      loading.value = false;
    }
  }

  async function fetchSessionById(id: string) {
    loading.value = true;
    try {
      currentSession.value = await sessionService.fetchSessionById(id);
      participants.value = await sessionService.fetchParticipants(id);
      expenses.value = await expenseService.fetchExpensesBySession(id);
      splits.value = await expenseService.fetchSplitsBySession(id);
    } finally {
      loading.value = false;
    }
  }

  async function createSession(title: string, date: string): Promise<Session> {
    loading.value = true;
    try {
      const session = await sessionService.createSession(title, date);
      sessions.value.unshift(session);
      return session;
    } finally {
      loading.value = false;
    }
  }

  async function addExpense(input: ExpenseInput) {
    loading.value = true;
    try {
      const participantIds = participants.value.map((p) => p.id);
      const expense = await expenseService.addExpense(input, participantIds);
      expenses.value.push(expense);
      splits.value = await expenseService.fetchSplitsBySession(input.session_id);
    } finally {
      loading.value = false;
    }
  }

  async function deleteExpense(expenseId: string) {
    const sessionId = currentSession.value?.id;
    if (!sessionId) return;

    // Optimistic removal
    const prev = [...expenses.value];
    expenses.value = expenses.value.filter((e) => e.id !== expenseId);

    try {
      await expenseService.deleteExpense(expenseId);
      splits.value = await expenseService.fetchSplitsBySession(sessionId);
    } catch {
      expenses.value = prev;
      throw new Error('Failed to delete expense');
    }
  }

  async function fetchAllUsers() {
    allUsers.value = await userService.fetchUsers();
  }

  async function addParticipant(sessionId: string, userId: string) {
    await sessionService.addParticipant(sessionId, userId);
    participants.value = await sessionService.fetchParticipants(sessionId);
  }

  async function removeParticipant(sessionId: string, userId: string) {
    await sessionService.removeParticipant(sessionId, userId);
    participants.value = participants.value.filter((p) => p.id !== userId);
  }

  async function deleteSession(sessionId: string) {
    await sessionService.deleteSession(sessionId);
    sessions.value = sessions.value.filter((s) => s.id !== sessionId);
  }

  async function createUser(name: string): Promise<User> {
    const user = await userService.createUser(name);
    allUsers.value.push(user);
    return user;
  }

  return {
    sessions,
    currentSession,
    expenses,
    splits,
    participants,
    allUsers,
    loading,
    showAddExpense,
    fetchSessions,
    fetchSessionById,
    createSession,
    addExpense,
    deleteExpense,
    fetchAllUsers,
    addParticipant,
    removeParticipant,
    deleteSession,
    createUser,
  };
});
