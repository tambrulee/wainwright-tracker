// types/dashboard.ts

export type SortOption = "name" | "height-high" | "height-low" | "section";

export type StatusFilter =
  | "All"
  | "Not completed"
  | "Completed"
  | "Planned"
  | "Priority";

export type DashboardView = "overview" | "map" | "route" | "saved";