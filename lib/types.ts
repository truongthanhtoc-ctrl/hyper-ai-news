export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  date: string;
  isTranslated: boolean;
  imageUrl?: string;
}

export interface NewsResponse {
  news: NewsItem[];
  lastUpdated: string;
}
