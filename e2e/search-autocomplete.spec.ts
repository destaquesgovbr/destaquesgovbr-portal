import { expect, test } from '@playwright/test'

test.describe('Search Autocomplete', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should not show suggestions with less than 2 characters', async ({
    page,
  }) => {
    const searchInput = page.locator('input[placeholder*="Buscar"]')
    await searchInput.fill('a')

    // Wait a bit for any potential dropdown
    await page.waitForTimeout(500)

    // Dropdown should not be visible
    const dropdown = page.locator('[role="listbox"]')
    await expect(dropdown).not.toBeVisible()
  })

  test('should show suggestions after typing 2+ characters', async ({
    page,
  }) => {
    const searchInput = page.locator('input[placeholder*="Buscar"]')
    await searchInput.fill('min')

    // Wait for debounce and API response
    const dropdown = page.locator('[role="listbox"]')
    await expect(dropdown).toBeVisible({ timeout: 5000 })

    // Should have suggestion items
    const suggestions = page.locator('[role="option"]')
    await expect(suggestions.first()).toBeVisible()
  })

  test('should navigate suggestions with keyboard', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Buscar"]')
    await searchInput.fill('gov')

    // Wait for suggestions
    const dropdown = page.locator('[role="listbox"]')
    await expect(dropdown).toBeVisible({ timeout: 5000 })

    // Press ArrowDown to select first item
    await searchInput.press('ArrowDown')

    // First option should be selected (aria-selected="true")
    const firstOption = page.locator('[role="option"]').first()
    await expect(firstOption).toHaveAttribute('aria-selected', 'true')

    // Press ArrowDown again to select second item (if exists)
    const optionsCount = await page.locator('[role="option"]').count()
    if (optionsCount > 1) {
      await searchInput.press('ArrowDown')
      const secondOption = page.locator('[role="option"]').nth(1)
      await expect(secondOption).toHaveAttribute('aria-selected', 'true')
      await expect(firstOption).toHaveAttribute('aria-selected', 'false')
    }

    // Press ArrowUp to go back
    await searchInput.press('ArrowUp')
    await expect(firstOption).toHaveAttribute('aria-selected', 'true')
  })

  test('should close dropdown on Escape', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Buscar"]')
    await searchInput.fill('bra')

    // Wait for suggestions
    const dropdown = page.locator('[role="listbox"]')
    await expect(dropdown).toBeVisible({ timeout: 5000 })

    // Press Escape
    await searchInput.press('Escape')

    // Dropdown should be hidden
    await expect(dropdown).not.toBeVisible()
  })

  test('should navigate to article when clicking suggestion', async ({
    page,
  }) => {
    const searchInput = page.locator('input[placeholder*="Buscar"]')
    await searchInput.fill('min')

    // Wait for suggestions
    const dropdown = page.locator('[role="listbox"]')
    await expect(dropdown).toBeVisible({ timeout: 5000 })

    // Click first suggestion
    const firstSuggestion = page.locator('[role="option"]').first()
    await firstSuggestion.click()

    // Should navigate to article page
    await expect(page).toHaveURL(/\/artigos\//)
  })

  test('should navigate to article when pressing Enter on selected suggestion', async ({
    page,
  }) => {
    const searchInput = page.locator('input[placeholder*="Buscar"]')
    await searchInput.fill('gov')

    // Wait for suggestions
    const dropdown = page.locator('[role="listbox"]')
    await expect(dropdown).toBeVisible({ timeout: 5000 })

    // Select first item with ArrowDown
    await searchInput.press('ArrowDown')

    // Press Enter to navigate
    await searchInput.press('Enter')

    // Should navigate to article page
    await expect(page).toHaveURL(/\/artigos\//)
  })

  test('should go to search page when pressing Enter without selection', async ({
    page,
  }) => {
    const searchInput = page.locator('input[placeholder*="Buscar"]')
    await searchInput.fill('teste busca')

    // Press Enter without selecting any suggestion
    await searchInput.press('Enter')

    // Should navigate to search page with query
    await expect(page).toHaveURL(/\/busca\?q=teste%20busca/)
  })

  test('should close dropdown when clicking outside', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Buscar"]')
    await searchInput.fill('min')

    // Wait for suggestions
    const dropdown = page.locator('[role="listbox"]')
    await expect(dropdown).toBeVisible({ timeout: 5000 })

    // Click outside (on the body)
    await page.locator('body').click({ position: { x: 10, y: 10 } })

    // Dropdown should be hidden
    await expect(dropdown).not.toBeVisible()
  })

  test('should highlight matching text in suggestions', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Buscar"]')
    await searchInput.fill('min')

    // Wait for suggestions
    const dropdown = page.locator('[role="listbox"]')
    await expect(dropdown).toBeVisible({ timeout: 5000 })

    // Check for highlighted text (mark element)
    const highlightedText = page.locator('[role="option"] mark')
    await expect(highlightedText.first()).toBeVisible()
  })

  test('should find results ignoring accents (diacritics)', async ({
    page,
  }) => {
    const searchInput = page.locator('input[placeholder*="Buscar"]')

    // Search without accent
    await searchInput.fill('ministerio')

    // Wait for suggestions - should find "Ministério" even without accent
    const dropdown = page.locator('[role="listbox"]')
    await expect(dropdown).toBeVisible({ timeout: 5000 })

    // Should have at least one suggestion
    const suggestions = page.locator('[role="option"]')
    const count = await suggestions.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should clear search and close dropdown when clicking X button', async ({
    page,
  }) => {
    const searchInput = page.locator('input[placeholder*="Buscar"]')
    await searchInput.fill('gov')

    // Wait for suggestions
    const dropdown = page.locator('[role="listbox"]')
    await expect(dropdown).toBeVisible({ timeout: 5000 })

    // Click clear button
    const clearButton = page.locator('[aria-label="Limpar busca"]')
    await clearButton.click()

    // Input should be empty
    await expect(searchInput).toHaveValue('')

    // Dropdown should be hidden
    await expect(dropdown).not.toBeVisible()
  })

  test('should have proper ARIA attributes for accessibility', async ({
    page,
  }) => {
    const searchInput = page.locator('input[placeholder*="Buscar"]')

    // Check combobox role
    await expect(searchInput).toHaveAttribute('role', 'combobox')
    await expect(searchInput).toHaveAttribute('aria-autocomplete', 'list')
    await expect(searchInput).toHaveAttribute('aria-expanded', 'false')

    // Type to show suggestions
    await searchInput.fill('gov')

    // Wait for suggestions
    const dropdown = page.locator('[role="listbox"]')
    await expect(dropdown).toBeVisible({ timeout: 5000 })

    // aria-expanded should be true now
    await expect(searchInput).toHaveAttribute('aria-expanded', 'true')

    // Dropdown should have listbox role
    await expect(dropdown).toHaveAttribute('role', 'listbox')

    // Options should have option role
    const firstOption = page.locator('[role="option"]').first()
    await expect(firstOption).toHaveAttribute('role', 'option')
  })

  test('should not open dropdown when tab switching back to page', async ({
    page,
  }) => {
    const searchInput = page.locator('input[placeholder*="Buscar"]')
    await searchInput.fill('gov')

    // Wait for suggestions
    const dropdown = page.locator('[role="listbox"]')
    await expect(dropdown).toBeVisible({ timeout: 5000 })

    // Click on a suggestion to navigate
    const firstSuggestion = page.locator('[role="option"]').first()
    await firstSuggestion.click()

    // Should be on article page
    await expect(page).toHaveURL(/\/artigos\//)

    // Go back to home
    await page.goto('/')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Dropdown should not be visible (even though query might be cached)
    await expect(dropdown).not.toBeVisible()
  })
})
