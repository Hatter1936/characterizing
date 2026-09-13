module.exports = {
  launch: async () => ({
    newPage: async () => ({
      setViewport: async () => {},
      setContent: async () => {},
      screenshot: async () => Buffer.from('fake-png'),
      pdf: async () => Buffer.from('fake-pdf'),
    }),
    close: async () => {},
  }),
}