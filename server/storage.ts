
import { db } from "./db";
import {
  places,
  reviews,
  type Place,
  type InsertPlace,
  type Review,
  type InsertReview,
  type PlaceResponse
} from "@shared/schema";
import { eq, ilike, arrayContains, sql } from "drizzle-orm";

export interface IStorage {
  getPlaces(search?: string, vibe?: string): Promise<Place[]>;
  getPlace(id: number): Promise<Place | undefined>;
  createPlace(place: InsertPlace): Promise<Place>;
  
  createReview(review: InsertReview): Promise<Review>;
  getReviewsByPlace(placeId: number): Promise<Review[]>;
}

export class DatabaseStorage implements IStorage {
  async getPlaces(search?: string, vibe?: string): Promise<Place[]> {
    let query = db.select().from(places);
    const filters = [];

    if (search) {
      filters.push(ilike(places.name, `%${search}%`));
    }

    if (vibe) {
      // Postgres array contains check for text[]
      filters.push(sql`${places.vibeTags} @> ARRAY[${vibe}]::text[]`);
    }

    if (filters.length > 0) {
      // @ts-ignore
      query = query.where(sql.join(filters, sql` AND `));
    }

    return await query;
  }

  async getPlace(id: number): Promise<Place | undefined> {
    const [place] = await db.select().from(places).where(eq(places.id, id));
    return place;
  }

  async createPlace(place: InsertPlace): Promise<Place> {
    const [newPlace] = await db.insert(places).values(place).returning();
    return newPlace;
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  async getReviewsByPlace(placeId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.placeId, placeId));
  }
}

export const storage = new DatabaseStorage();
