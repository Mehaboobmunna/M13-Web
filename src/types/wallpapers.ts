export interface Wallpaper {
  id: string;
  title: string;
  category: string;
  device: 'desktop' | 'mobile' | 'ultrawide';
  resolution: string;
  aspect: string;
  views: number;
  author: string;
  url: string;
  downloadUrl: string;
  tags: string[];
  palette: string[];
}

export type DeviceFilter = 'all' | 'desktop' | 'mobile' | 'ultrawide';
export type SortOption = 'newest' | 'popular' | 'name';
