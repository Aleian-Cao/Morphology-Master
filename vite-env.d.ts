/// <reference types="vite/client" />

declare module '*?raw' {
  const content: string;
  export default content;
}

declare module '*.yaml' {
  const data: any;
  export default data;
}
