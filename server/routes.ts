
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";

// OpenAI client setup (integration handles the key if available, or we check env)
const openai = new OpenAI({ 
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || "https://api.openai.com/v1"
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Places Routes
  app.get(api.places.list.path, async (req, res) => {
    try {
      const search = req.query.search as string | undefined;
      const vibe = req.query.vibe as string | undefined;
      const places = await storage.getPlaces(search, vibe);
      res.json(places);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.places.get.path, async (req, res) => {
    const id = Number(req.params.id);
    const place = await storage.getPlace(id);
    
    if (!place) {
      return res.status(404).json({ message: "Place not found" });
    }

    // Mock crowd prediction for now, or use real data if we had it
    // In a real app, this might come from a separate service or DB
    const crowdPrediction = {
      placeId: id,
      currentLevel: ['quiet', 'moderate', 'busy', 'packed'][Math.floor(Math.random() * 4)],
      predictedLevelNextHour: ['quiet', 'moderate', 'busy', 'packed'][Math.floor(Math.random() * 4)],
      explanation: "Based on historical data for this time of day." // Default fallback
    };

    res.json({ ...place, crowdPrediction });
  });

  app.post(api.places.create.path, async (req, res) => {
    try {
      const input = api.places.create.input.parse(req.body);
      const place = await storage.createPlace(input);
      res.status(201).json(place);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  // Reviews Routes
  app.post(api.reviews.create.path, async (req, res) => {
    try {
      const input = api.reviews.create.input.parse(req.body);
      const review = await storage.createReview(input);
      res.status(201).json(review);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  app.get(api.reviews.listByPlace.path, async (req, res) => {
    const id = Number(req.params.id);
    const reviews = await storage.getReviewsByPlace(id);
    res.json(reviews);
  });

  // AI Crowd Prediction Route
  app.get(api.ai.predictCrowd.path, async (req, res) => {
    const id = Number(req.params.id);
    const place = await storage.getPlace(id);

    if (!place) {
      return res.status(404).json({ message: "Place not found" });
    }

    try {
      // Simulate/Predict using OpenAI
      // In a real scenario, we'd feed historical data here.
      // For MVP, we ask OpenAI to "hallucinate" a plausible prediction based on the vibe and time.
      
      const currentHour = new Date().getHours();
      const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });

      const prompt = `
        Predict the crowd level for a place named "${place.name}" which is a "${place.category}" 
        with vibes "${place.vibeTags.join(', ')}".
        It is currently ${dayOfWeek} at ${currentHour}:00.
        
        Return a JSON object with:
        - currentLevel: 'quiet', 'moderate', 'busy', or 'packed'
        - predictedLevelNextHour: 'quiet', 'moderate', 'busy', or 'packed'
        - explanation: A short 1-sentence explanation of why (e.g., "Lunch rush is starting", "Quiet afternoon for work").
      `;

      const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "gpt-5.1",
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(completion.choices[0].message.content || "{}");

      res.json({
        placeId: id,
        currentLevel: result.currentLevel || 'moderate',
        predictedLevelNextHour: result.predictedLevelNextHour || 'moderate',
        explanation: result.explanation || "AI analysis of current trends."
      });

    } catch (error) {
      console.error("OpenAI Error:", error);
      // Fallback
      res.json({
        placeId: id,
        currentLevel: 'moderate',
        predictedLevelNextHour: 'moderate',
        explanation: "Live data unavailable, showing average estimation."
      });
    }
  });

  // Initialize seed data
  await seedDatabase();

  return httpServer;
}

// Seed function to populate DB if empty
export async function seedDatabase() {
  const existing = await storage.getPlaces();
  if (existing.length === 0) {
    console.log("Seeding database...");
    await storage.createPlace({
      name: "The Cozy Corner",
      description: "A quiet spot perfect for reading or working. Excellent coffee.",
      address: "123 Maple St, Downtown",
      lat: 40.7128, 
      lng: -74.0060, // NYC coordinates example
      category: "cafe",
      vibeTags: ["quiet", "work-friendly", "cozy"],
      averageCost: 2,
      images: ["https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1000"],
      amenities: { wifi: true, outlets: true, petFriendly: false }
    });

    await storage.createPlace({
      name: "Buzz & Bites",
      description: "Lively bistro with great music and tasty snacks.",
      address: "456 Oak Ave, Midtown",
      lat: 40.7580,
      lng: -73.9855,
      category: "bistro",
      vibeTags: ["bustling", "social", "music"],
      averageCost: 3,
      images: ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1000"],
      amenities: { wifi: true, outlets: false, petFriendly: true }
    });
    
     await storage.createPlace({
      name: "Night Owl Lounge",
      description: "Late night spot with dim lighting and jazz.",
      address: "789 Pine Ln, Uptown",
      lat: 40.7829,
      lng: -73.9654,
      category: "lounge",
      vibeTags: ["date-night", "jazz", "dim-lit"],
      averageCost: 4,
      images: ["https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&q=80&w=1000"],
      amenities: { wifi: false, outlets: false, petFriendly: false }
    });
    console.log("Seeding complete.");
  }
}
