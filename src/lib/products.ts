export type Product = {
  id: string;
  name: string;
  category: "Audio" | "Wearables" | "Home" | "Accessories";
  price: number;
  emoji: string;
  description: string;
};

export const products: Product[] = [
  { id: "aurora-headphones", name: "Aurora Wireless Headphones", category: "Audio", price: 149, emoji: "🎧", description: "Over-ear headphones with active noise cancelling and 40-hour battery life." },
  { id: "pulse-earbuds", name: "Pulse Earbuds", category: "Audio", price: 89, emoji: "🎵", description: "Compact true-wireless earbuds with a pocketable charging case." },
  { id: "boom-speaker", name: "Boom Portable Speaker", category: "Audio", price: 69, emoji: "🔊", description: "Waterproof Bluetooth speaker with 360° sound." },
  { id: "stride-watch", name: "Stride Smartwatch", category: "Wearables", price: 199, emoji: "⌚", description: "Fitness tracking, heart-rate monitoring and a week of battery." },
  { id: "loop-band", name: "Loop Fitness Band", category: "Wearables", price: 49, emoji: "📿", description: "Lightweight band that tracks steps, sleep and workouts." },
  { id: "vista-glasses", name: "Vista Blue-Light Glasses", category: "Wearables", price: 39, emoji: "👓", description: "Reduce eye strain during long screen sessions." },
  { id: "glow-lamp", name: "Glow Smart Lamp", category: "Home", price: 59, emoji: "💡", description: "Dimmable lamp with 16 million colors and app control." },
  { id: "brew-kettle", name: "Brew Temperature Kettle", category: "Home", price: 79, emoji: "🫖", description: "Gooseneck kettle with precise temperature presets." },
  { id: "breeze-fan", name: "Breeze Desk Fan", category: "Home", price: 34, emoji: "🌀", description: "Quiet USB-powered fan with three speeds." },
  { id: "dock-charger", name: "Dock 3-in-1 Charger", category: "Accessories", price: 45, emoji: "🔌", description: "Charge your phone, watch and earbuds from one stand." },
  { id: "carry-backpack", name: "Carry Tech Backpack", category: "Accessories", price: 95, emoji: "🎒", description: "Water-resistant backpack with a padded laptop sleeve." },
  { id: "grip-stand", name: "Grip Phone Stand", category: "Accessories", price: 19, emoji: "📱", description: "Adjustable aluminium stand for phones and small tablets." },
];

export const categories = ["All", "Audio", "Wearables", "Home", "Accessories"] as const;

export function getProduct(id: string) {
  return products.find((p) => p.id === id);
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}
