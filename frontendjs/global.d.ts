
declare module "*.css";

declare global {
  namespace NodeJS {
    // Extend the Global interface
    interface Global {
      // Declare your custom function here with its type
      mariadbPool: Pool;
    }
  }
}

// Make the file a module (required for global augmentation)
export {};
