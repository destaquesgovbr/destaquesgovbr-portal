import { expect, test } from '@playwright/test'

test.describe('Home Page', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/')

    // Check that the page has loaded with the main heading
    await expect(page).toHaveTitle(/Destaques/)

    // Check that the main content area exists
    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should display news cards', async ({ page }) => {
    await page.goto('/')

    // Wait for at least one news card to be visible
    const newsCard = page.locator('article').first()
    await expect(newsCard).toBeVisible({ timeout: 10000 })
  })

  test('should have working navigation', async ({ page }) => {
    await page.goto('/')

    // Check that the header navigation exists
    const header = page.locator('header')
    await expect(header).toBeVisible()

    // Check for navigation links
    const articlesLink = page.getByRole('link', { name: /artigos/i })
    await expect(articlesLink).toBeVisible()
  })
})

test.describe('Search', () => {
  test('should navigate to search page', async ({ page }) => {
    await page.goto('/busca')

    // Check that search page loads
    await expect(page).toHaveURL(/busca/)
  })

  test('should have search input', async ({ page }) => {
    await page.goto('/busca')

    // Look for search input
    const searchInput = page.getByPlaceholder(/buscar|pesquisar/i)
    await expect(searchInput).toBeVisible()
  })
})
