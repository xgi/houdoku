export type ExtensionMetadata = {
  id: number;
  name: string;
  url: string;
  version: number;
  notice: string;
  noticeUrl: string;
};

export type PageRequesterData = {
  server: string;
  hash: string;
  numPages: number;
  pageFilenames: string[];
};
