import { Place } from "@shared/schema";
import { Link } from "wouter";
import { MapPin, Star, Coffee } from "lucide-react";
import { CrowdMeter } from "./CrowdMeter";

interface PlaceCardProps {
  place: Place;
}

export function PlaceCard({ place }: PlaceCardProps) {
  // Use first image or fallback
  const bgImage = place.images?.[0] || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80";

  return (
    <Link href={`/place/${place.id}`} className="block group">
      <div className="
        relative flex flex-col h-full
        bg-card rounded-2xl overflow-hidden
        border border-border/50
        shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1
        transition-all duration-300 ease-out
      ">
        {/* Image Area */}
        <div className="relative h-48 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
          {/* HTML Comment for Stock Image: Cozy cafe interior with warm lighting */}
          <img 
            src={bgImage} 
            alt={place.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          
          <div className="absolute bottom-3 left-3 z-20 text-white">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider border border-white/10">
                {place.category}
              </span>
            </div>
            <h3 className="font-display font-bold text-xl leading-tight">{place.name}</h3>
          </div>

          <div className="absolute top-3 right-3 z-20">
             <div className="bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 text-xs font-bold shadow-sm">
               <Star className="w-3 h-3 text-orange-500 fill-orange-500" />
               <span>4.8</span>
             </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 flex-1 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{place.address}</span>
            </div>
            <span className="text-sm font-medium text-foreground whitespace-nowrap">
              {Array(place.averageCost).fill('$').join('')}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {place.vibeTags.slice(0, 3).map((tag) => (
              <span 
                key={tag} 
                className="px-2 py-0.5 rounded-md bg-secondary/50 text-secondary-foreground text-xs font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="mt-auto pt-3 border-t border-border/50 flex items-center justify-between">
            <CrowdMeter currentLevel="moderate" compact /> {/* Static for list view for perf, or fetch real */}
          </div>
        </div>
      </div>
    </Link>
  );
}
