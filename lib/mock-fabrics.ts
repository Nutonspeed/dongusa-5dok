export type MockFabric = {
  id: string; code: string; name: string; price_per_m: number; width_cm?: number;
  colors?: { name: string; hex: string }[];
  images?: { url: string; alt?: string }[];
};
export const mockFabrics: MockFabric[] = [
  { id: "FAB-001", code: "CT-220G", name: "Cotton Twill 220G", price_per_m: 199, width_cm: 150,
    colors: [{name:"Navy",hex:"#1f2a44"},{name:"Khaki",hex:"#cbb994"},{name:"Black",hex:"#111"}],
    images: [{ url: "/placeholder/fabric-cotton-twill.jpg", alt:"Twill" }]
  },
  { id: "FAB-002", code: "LN-180G", name: "Linen Blend 180G", price_per_m: 249, width_cm: 140,
    colors: [{name:"Natural",hex:"#d7c9a0"},{name:"Sage",hex:"#9fb59b"}],
    images: [{ url: "/placeholder/fabric-linen.jpg"}]
  },
  { id: "FAB-003", code: "PS-180G", name: "Poly Spandex Jersey 180G", price_per_m: 179, width_cm: 160,
    colors: [{name:"White",hex:"#fafafa"},{name:"Heather Grey",hex:"#b7b7b7"}],
    images: [{ url: "/placeholder/fabric-jersey.jpg"}]
  }
];
