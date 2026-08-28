import puppeteer from 'puppeteer'

export async function characterToPng(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({ headless: true })

    const page = await browser.newPage()
    await page.setViewport({ width: 1200, height: 800 })

    await page.setContent(html)
    await new Promise(resolve => setTimeout(resolve, 1000))
    const screen = await page.screenshot()
    await browser.close()
    return Buffer.from(screen)
}

export async function characterToPdf(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({ headless: true })

    const page = await browser.newPage()
    await page.setViewport({ width: 1200, height: 800 })

    await page.setContent(html)
    await new Promise(resolve => setTimeout(resolve, 1000))
    const pdf = await page.pdf({ format:'A4'})
    await browser.close()
    return Buffer.from(pdf)
}