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

  test('should display news content', async ({ page }) => {
    await page.goto('/')

    // Wait for page to fully load and check for any content
    // Look for links that go to /artigos (news articles)
    const articleLinks = page.locator('a[href*="/artigos/"]')
    await expect(articleLinks.first()).toBeVisible({ timeout: 15000 })
  })

  test('should have header', async ({ page }) => {
    await page.goto('/')

    // Check that the header exists
    const header = page.locator('header')
    await expect(header).toBeVisible()
  })
})

test.describe('Search Page', () => {
  test('should navigate to search page', async ({ page }) => {
    await page.goto('/busca')

    // Check that search page loads
    await expect(page).toHaveURL(/busca/)
  })

  test('should have search functionality', async ({ page }) => {
    await page.goto('/busca')

    // The search input exists (may be hidden on mobile due to responsive design)
    // Just check that it's in the DOM
    const searchInput = page.locator('input[placeholder*="Buscar"]')
    await expect(searchInput).toHaveCount(1)
  })
})

test.describe('Articles Page', () => {
  test('should load articles page', async ({ page }) => {
    await page.goto('/artigos')

    // Check that articles page loads
    await expect(page).toHaveURL(/artigos/)

    // Wait for some content to load
    const main = page.locator('main')
    await expect(main).toBeVisible()
  })
})
