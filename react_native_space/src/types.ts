export interface User {
  id: string;
  email: string;
  name: string;
  nickname: string;
  subscriptionLevel: 'basic' | 'gold' | 'platinum';
  isSuperuser: boolean;
  emailVerified: boolean;
  phone?: string;
  createdAt?: string;
  gossipCount?: number;
  approvedGossipCount?: number;
}

export interface Gossip {
  id: string;
  content: string;
  status: string;
  neighborhoodName: string;
  districtName: string;
  provinceName: string;
  authorNickname: string;
  createdAt: string;
  approveCount: number;
  disapproveCount: number;
  userReaction: string | null;
}

export interface PendingGossip {
  id: string;
  content: string;
  status: string;
  neighborhoodName: string;
  districtName: string;
  provinceName: string;
  authorNickname: string;
  createdAt: string;
}

export interface LocationItem {
  id: string;
  name: string;
}

export interface LocationFilter {
  provinceId?: string;
  provinceName?: string;
  districtId?: string;
  districtName?: string;
  neighborhoodId?: string;
  neighborhoodName?: string;
}

export interface SelectedLocation {
  provinceId: string;
  provinceName: string;
  districtId: string;
  districtName: string;
  neighborhoodId: string;
  neighborhoodName: string;
}
