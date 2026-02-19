import { usePlaces } from "@/hooks/use-places";
import { Layout } from "@/components/Layout";
import { Map } from "@/components/Map";
import { PlaceCard } from "@/components/PlaceCard";
import { Input } from "@/components/ui/input";
import { Search, Filter, Loader2, Map as MapIcon, List } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [view, setView] = useState<'map' | 'list'>('map');
  const [search, setSearch] = useState("");
  const { data: places, isLoading, error } = usePlaces({ search });

  // Filter functionality would go here - simplified for now
  
  return (
    <Layout>
      {/* Header / Search Bar Overlay */}
      <div className="absolute top-4 left-4 right-4 z-10 flex gap-2 md:w-96">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            placeholder="Search vibes, coffee, tacos..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-card/90 backdrop-blur-md border border-border/50 shadow-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" className="h-full aspect-square rounded-xl bg-card/90 backdrop-blur-md border border-border/50 text-foreground hover:bg-white shadow-lg">
              <Filter className="w-4 h-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <div className="py-6">
              <h3 className="font-display font-bold text-xl mb-4">Filters</h3>
              <p className="text-muted-foreground">Filter by Vibe, Price, or Amenities coming soon.</p>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Mobile Toggle View */}
      <div className="md:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-card/90 backdrop-blur border rounded-full p-1 shadow-xl flex">
        <button
          onClick={() => setView('map')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${view === 'map' ? 'bg-primary text-white shadow-md' : 'text-muted-foreground'}`}
        >
          Map
        </button>
        <button
          onClick={() => setView('list')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${view === 'list' ? 'bg-primary text-white shadow-md' : 'text-muted-foreground'}`}
        >
          List
        </button>
      </div>

      <div className="flex h-full">
        {/* List Panel (Desktop) */}
        <div className={`
          absolute md:relative inset-0 bg-background z-0
          md:w-[450px] md:flex-shrink-0 md:border-r md:flex flex-col
          ${view === 'list' ? 'flex z-20' : 'hidden md:flex'}
        `}>
          <div className="p-4 md:p-6 pb-2">
            <h2 className="font-display font-bold text-2xl">Nearby Places</h2>
            <p className="text-muted-foreground text-sm">{places?.length || 0} spots found</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-12 text-destructive">Failed to load places.</div>
            ) : (
              places?.map((place) => (
                <motion.div
                  key={place.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <PlaceCard place={place} />
                </motion.div>
              ))
            )}
            
            {/* Empty State */}
            {!isLoading && places?.length === 0 && (
              <div className="text-center py-12 px-6 border-2 border-dashed rounded-xl">
                <p className="text-muted-foreground">No places found matching your vibe.</p>
                <Button variant="link" onClick={() => setSearch("")} className="mt-2 text-primary">Clear Filters</Button>
              </div>
            )}
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative h-full bg-slate-100">
           {isLoading ? (
             <div className="absolute inset-0 flex items-center justify-center">
               <Loader2 className="w-10 h-10 animate-spin text-primary/50" />
             </div>
           ) : (
             <Map places={places || []} className="h-full w-full" />
           )}
        </div>
      </div>
    </Layout>
  );
}
