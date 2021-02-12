export type ExtensionMetadata = {
  id: number;
  name: string;
  url: string;
  version: number;
  notice: string;
};

export type PageRequesterData = {
  server: string;
  hash: string;
  numPages: number;
  pageFilenames: string[];
};
