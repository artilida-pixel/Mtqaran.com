export type VillageMapItem = {
  id: string;
  slug: string;
  regionSlug: string;
  nameHy: string;
  nameRu: string;
  nameEn: string;
  lat: number;
  lng: number;
  workoutStatus: string;
};

export type RegionListItem = {
  id: string;
  slug: string;
  nameHy: string;
  nameRu: string;
  nameEn: string;
  lat: number;
  lng: number;
  villages: VillageMapItem[];
};

export const STATUS_COLORS: Record<string, string> = {
  proposed: "#9ca3af",
  funding: "#f2a950",
  building: "#1f3a5f",
  completed: "#3f7a5c",
};
