
import { pgTable, text, serial, integer, boolean, timestamp, jsonb, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const places = pgTable("places", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  address: text("address").notNull(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  category: text("category").notNull(), // 'cafe', 'restaurant', 'bistro'
  vibeTags: text("vibe_tags").array().notNull(), // ['cozy', 'work-friendly', 'date-night']
  averageCost: integer("average_cost").notNull(), // 1-5 scale or actual currency estimate
  images: text("images").array().notNull(), // Array of image URLs
  amenities: jsonb("amenities").notNull().default({}), // { wifi: true, outlets: true, petFriendly: true }
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  placeId: integer("place_id").references(() => places.id).notNull(),
  userId: integer("user_id"), // Optional if we allow anonymous reviews initially, or link to auth later
  rating: integer("rating").notNull(),
  comment: text("comment"),
  crowdLevel: text("crowd_level"), // 'quiet', 'moderate', 'busy', 'packed'
  createdAt: timestamp("created_at").defaultNow(),
});

// === SCHEMAS ===

export const insertPlaceSchema = createInsertSchema(places).omit({ 
  id: true, 
  createdAt: true 
});

export const insertReviewSchema = createInsertSchema(reviews).omit({ 
  id: true, 
  createdAt: true 
});

// === EXPLICIT API CONTRACT TYPES ===

export type Place = typeof places.$inferSelect;
export type InsertPlace = z.infer<typeof insertPlaceSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type CrowdPrediction = {
  placeId: number;
  currentLevel: 'quiet' | 'moderate' | 'busy' | 'packed';
  predictedLevelNextHour: 'quiet' | 'moderate' | 'busy' | 'packed';
  explanation: string; // AI generated explanation
};

// Request types
export type CreatePlaceRequest = InsertPlace;
export type CreateReviewRequest = InsertReview;

// Response types
export type PlaceResponse = Place & { 
  crowdPrediction?: CrowdPrediction 
};

export type PlacesListResponse = PlaceResponse[];

