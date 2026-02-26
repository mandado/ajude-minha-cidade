export type PointType = "shelter" | "collection" | "distribution";
export type PointStatus = "active" | "inactive" | "pending";
export type PriorityLevel = "high" | "medium" | "low";
export type ModerationAction = "approve" | "reject" | "flag" | "remove";

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Point {
  id: string;
  created_by: string | null;
  name: string;
  description: string | null;
  type: PointType;
  status: PointStatus;
  priority: PriorityLevel;
  latitude: number;
  longitude: number;
  address: string | null;
  city: string | null;
  state: string | null;
  neighborhood: string | null;
  phone: string | null;
  operating_hours: string | null;
  created_at: string;
  updated_at: string;
}

export interface Need {
  id: string;
  point_id: string;
  description: string;
  quantity: number | null;
  unit: string | null;
  is_fulfilled: boolean;
  created_at: string;
}

export interface ModerationLog {
  id: string;
  point_id: string;
  moderator_id: string | null;
  action: ModerationAction;
  reason: string | null;
  created_at: string;
}
