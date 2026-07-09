export type BreadcrumbItem = {
  name: string;
  symbol: string;
  url?: string;
};

export type BreadcrumbTrail = readonly BreadcrumbItem[];
