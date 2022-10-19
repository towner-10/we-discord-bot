/*eslint @typescript-eslint/no-explicit-any: ["error", { "ignoreRestArgs": false }]*/

export interface Event {
    name: string;
    once: boolean;
    execute: (...args: unknown[]) => Promise<void>;
}