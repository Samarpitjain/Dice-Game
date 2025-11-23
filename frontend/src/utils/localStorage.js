const DEMO_USER_KEY = 'demoUserId';
const BALANCE_KEY_PREFIX = 'balance';
const HISTORY_KEY_PREFIX = 'history';
const MAX_HISTORY = 50;

export const generateDemoUserId = () => {
  const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `Demo_${randomId}`;
};

export const getDemoUserId = () => {
  let userId = localStorage.getItem(DEMO_USER_KEY);
  if (!userId) {
    userId = generateDemoUserId();
    localStorage.setItem(DEMO_USER_KEY, userId);
  }
  return userId;
};

export const getBalance = (userId) => {
  const key = `${userId}_${BALANCE_KEY_PREFIX}`;
  const balance = localStorage.getItem(key);
  return balance ? parseFloat(balance) : 1000;
};

export const setBalance = (userId, balance) => {
  const key = `${userId}_${BALANCE_KEY_PREFIX}`;
  localStorage.setItem(key, balance.toString());
};

export const getHistory = (userId) => {
  const key = `${userId}_${HISTORY_KEY_PREFIX}`;
  const history = localStorage.getItem(key);
  return history ? JSON.parse(history) : [];
};

export const addHistoryEntry = (userId, entry) => {
  const key = `${userId}_${HISTORY_KEY_PREFIX}`;
  const history = getHistory(userId);
  history.unshift(entry);
  const trimmedHistory = history.slice(0, MAX_HISTORY);
  localStorage.setItem(key, JSON.stringify(trimmedHistory));
};
