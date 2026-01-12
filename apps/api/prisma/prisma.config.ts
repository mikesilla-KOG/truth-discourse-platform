export default {
  datasources: {
    db: {
      provider: 'postgresql',
      // Read connection URL from environment at runtime
      url: process.env.DATABASE_URL,
    },
  },
};
