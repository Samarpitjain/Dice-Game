// Playwright E2E Tests
import { test, expect } from '@playwright/test';

test.describe('Dice Game E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('should login and display game interface', async ({ page }) => {
    // Login
    await page.fill('input[placeholder="Enter username"]', 'testuser');
    await page.click('button:has-text("Start Playing")');

    // Wait for game interface
    await expect(page.locator('h1:has-text("Dice Game")')).toBeVisible();
    await expect(page.locator('text=Balance')).toBeVisible();
    await expect(page.locator('text=1000.00')).toBeVisible();
  });

  test('should place manual bet successfully', async ({ page }) => {
    // Login
    await page.fill('input[placeholder="Enter username"]', 'testuser');
    await page.click('button:has-text("Start Playing")');

    // Wait for interface
    await page.waitForSelector('button:has-text("Roll Dice")');

    // Set bet amount
    await page.fill('input[type="number"]', '10');

    // Place bet
    await page.click('button:has-text("Roll Dice")');

    // Wait for result
    await page.waitForSelector('text=Rolling...', { state: 'hidden' });

    // Check that a roll result is displayed
    const rollResult = page.locator('.font-mono.font-bold').first();
    await expect(rollResult).toBeVisible();
  });

  test('should switch between manual and auto modes', async ({ page }) => {
    // Login
    await page.fill('input[placeholder="Enter username"]', 'testuser');
    await page.click('button:has-text("Start Playing")');

    // Check manual mode is active
    await expect(page.locator('button:has-text("Manual").bg-accent-blue')).toBeVisible();
    await expect(page.locator('button:has-text("Roll Dice")')).toBeVisible();

    // Switch to auto mode
    await page.click('button:has-text("Auto")');
    await expect(page.locator('button:has-text("Auto").bg-accent-blue')).toBeVisible();
    await expect(page.locator('button:has-text("Start Auto Bet")')).toBeVisible();
  });

  test('should open and interact with fairness modal', async ({ page }) => {
    // Login
    await page.fill('input[placeholder="Enter username"]', 'testuser');
    await page.click('button:has-text("Start Playing")');

    // Open fairness modal
    await page.click('button:has-text("Fairness")');

    // Check modal content
    await expect(page.locator('h2:has-text("Provable Fairness")')).toBeVisible();
    await expect(page.locator('text=Server Seed Hash')).toBeVisible();
    await expect(page.locator('text=Client Seed')).toBeVisible();

    // Close modal
    await page.click('button[aria-label="Close"]');
    await expect(page.locator('h2:has-text("Provable Fairness")')).not.toBeVisible();
  });

  test('should display bet history after placing bets', async ({ page }) => {
    // Login
    await page.fill('input[placeholder="Enter username"]', 'testuser');
    await page.click('button:has-text("Start Playing")');

    // Place a bet
    await page.fill('input[type="number"]', '5');
    await page.click('button:has-text("Roll Dice")');
    await page.waitForSelector('text=Rolling...', { state: 'hidden' });

    // Check bet history
    await expect(page.locator('h3:has-text("Recent Bets")')).toBeVisible();
    await expect(page.locator('.bg-background.rounded-lg').first()).toBeVisible();
  });
});