import 'expect-puppeteer'

describe('Google', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:4444/example/index.html')
  })

  it('should display "google" text on page', async () => {
    await expect(page).toMatch('Cross origin Channel messaging demo')
  })
})
