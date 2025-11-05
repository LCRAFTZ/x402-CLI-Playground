declare module './commands/config.js' {
  export function configInit(globalOpts: any, logger: any): Promise<void>;
}