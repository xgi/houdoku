declare module '*.scss' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.png' {
  // biome-ignore lint/suspicious/noExplicitAny: arbitrary
  const value: any;
  export = value;
}

declare module '*.jpg' {
  // biome-ignore lint/suspicious/noExplicitAny: arbitrary
  const value: any;
  export = value;
}

declare module '*.svg' {
  // biome-ignore lint/suspicious/noExplicitAny: arbitrary
  const value: any;
  export = value;
}
