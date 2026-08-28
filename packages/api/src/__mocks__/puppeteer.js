import { jest } from '@jest/globals'

export default {
    launch: jest.fn().mockResolvedValue({
        newPage: jest.fn().mockResolvedValue({
            setViewport: jest.fn(),
            setContent: jest.fn(),
            screenshot: jest.fn().mockResolvedValue(Buffer.from('fake-png')),
            pdf: jest.fn().mockResolvedValue(Buffer.from('fake-pdf')),
        }),
        close: jest.fn(),
    }),
}