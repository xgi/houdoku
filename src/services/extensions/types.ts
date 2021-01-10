export type ExtensionMetadata = {
  id: number;
  name: string;
  url: string;
  version: number;
};

export type PageRequesterData = {
  server: string;
  hash: string;
  numPages: number;
  pageFilenames: string[];
};
