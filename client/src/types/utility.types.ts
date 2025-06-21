// Utility type to extract the return type of a function
export type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;