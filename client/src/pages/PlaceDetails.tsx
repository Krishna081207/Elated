import { usePlace, usePlaceCrowd } from "@/hooks/use-places";
import { useReviews, useCreateReview } from "@/hooks/use-reviews";
import { Layout } from "@/components/Layout";
import { useParams, Link } from "wouter";
import { Loader2, ArrowLeft, MapPin, DollarSign, Wifi, Zap, Clock, Star, Share2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CrowdMeter } from "@/components/CrowdMeter";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { insertReviewSchema } from "@shared/schema";

const reviewFormSchema = insertReviewSchema.pick({ rating: true, comment: true, crowdLevel: true });
type ReviewFormValues = z.infer<typeof reviewFormSchema>;

export default function PlaceDetails() {
  const { id } = useParams<{ id: string }>();
  const placeId = parseInt(id);
  
  const { data: place, isLoading: isPlaceLoading } = usePlace(placeId);
  const { data: crowdData, isLoading: isCrowdLoading } = usePlaceCrowd(placeId);
  const { data: reviews, isLoading: isReviewsLoading } = useReviews(placeId);
  
  const createReview = useCreateReview();
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 5,
      comment: "",
      crowdLevel: "moderate",
    },
  });

  function onSubmit(data: ReviewFormValues) {
    createReview.mutate({ ...data, placeId }, {
      onSuccess: () => setIsReviewOpen(false)
    });
  }

  if (isPlaceLoading) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!place) {
    return (
      <Layout>
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <h2 className="text-2xl font-bold">Place not found</h2>
          <Link href="/"><Button>Back to Map</Button></Link>
        </div>
      </Layout>
    );
  }

  // Stock images for carousel fallback
  const heroImage = place.images?.[0] || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&q=80";

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto bg-background">
        {/* Hero Section */}
        <div className="relative h-[40vh] min-h-[300px] w-full">
          <img src={heroImage} alt={place.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          
          <div className="absolute top-4 left-4">
            <Link href="/">
              <Button variant="secondary" size="sm" className="backdrop-blur-md bg-white/50 border-white/20 hover:bg-white/80">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <div className="flex gap-2 mb-2">
                    <Badge variant="secondary" className="backdrop-blur bg-white/20 text-foreground border-white/20">
                      {place.category}
                    </Badge>
                    <div className="flex items-center text-sm font-medium bg-white/20 backdrop-blur px-2 rounded-full border border-white/20">
                      <Star className="w-3 h-3 text-orange-500 fill-orange-500 mr-1" />
                      4.8 (120 reviews)
                    </div>
                  </div>
                  <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl mb-2">{place.name}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground/80 font-medium">
                    <MapPin className="w-4 h-4" />
                    {place.address}
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-2">
                    <Heart className="w-5 h-5" />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-2">
                    <Share2 className="w-5 h-5" />
                  </Button>
                  <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
                    <DialogTrigger asChild>
                      <Button size="lg" className="rounded-full px-8 shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all">
                        Check In / Review
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Rate your experience</DialogTitle>
                      </DialogHeader>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                          <FormField
                            control={form.control}
                            name="rating"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Rating (1-5)</FormLabel>
                                <Select onValueChange={(v) => field.onChange(parseInt(v))} defaultValue={String(field.value)}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select rating" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {[1, 2, 3, 4, 5].map((num) => (
                                      <SelectItem key={num} value={String(num)}>{num} Stars</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="crowdLevel"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>How busy is it?</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value || "moderate"}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select crowd level" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="quiet">Quiet</SelectItem>
                                    <SelectItem value="moderate">Moderate</SelectItem>
                                    <SelectItem value="busy">Busy</SelectItem>
                                    <SelectItem value="packed">Packed</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="comment"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Comment</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="What's the vibe like?" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="submit" className="w-full" disabled={createReview.isPending}>
                            {createReview.isPending ? "Submitting..." : "Submit Review"}
                          </Button>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-5xl mx-auto p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Info */}
          <div className="md:col-span-2 space-y-8">
            <section>
              <h3 className="font-display font-bold text-xl mb-3">About</h3>
              <p className="text-muted-foreground leading-relaxed">
                {place.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mt-4">
                {place.vibeTags.map(tag => (
                  <Badge key={tag} variant="secondary" className="px-3 py-1 bg-amber-50 text-amber-900 hover:bg-amber-100">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="font-display font-bold text-xl mb-4">Amenities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {(place.amenities as any).wifi && (
                  <div className="flex items-center gap-2 text-sm text-foreground/80">
                    <Wifi className="w-4 h-4 text-primary" /> Fast WiFi
                  </div>
                )}
                {(place.amenities as any).outlets && (
                  <div className="flex items-center gap-2 text-sm text-foreground/80">
                    <Zap className="w-4 h-4 text-primary" /> Power Outlets
                  </div>
                )}
                 {/* Fallback amenities just to show UI */}
                 <div className="flex items-center gap-2 text-sm text-foreground/80">
                    <Clock className="w-4 h-4 text-primary" /> Open Late
                  </div>
              </div>
            </section>
            
            <Separator />

            <section>
               <h3 className="font-display font-bold text-xl mb-4">Community Reviews</h3>
               <div className="space-y-6">
                 {isReviewsLoading ? (
                   <div className="space-y-4">
                     {[1,2,3].map(i => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
                   </div>
                 ) : reviews?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-2xl">
                       No reviews yet. Be the first!
                    </div>
                 ) : (
                   reviews?.map(review => (
                     <div key={review.id} className="bg-card p-4 rounded-xl border border-border/50">
                        <div className="flex justify-between mb-2">
                           <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">U</div>
                              <span className="font-medium text-sm">User</span>
                           </div>
                           <span className="text-xs text-muted-foreground">{new Date(review.createdAt || "").toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-foreground/90">{review.comment}</p>
                        <div className="mt-3 flex gap-2">
                           {review.crowdLevel && (
                             <Badge variant="outline" className="text-xs font-normal">
                               Reported: {review.crowdLevel}
                             </Badge>
                           )}
                           <div className="flex items-center text-xs text-orange-500">
                             {Array(review.rating).fill(null).map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                           </div>
                        </div>
                     </div>
                   ))
                 )}
               </div>
            </section>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <CrowdMeter 
              currentLevel={crowdData?.currentLevel || "moderate"} 
              predictedNext={crowdData?.predictedLevelNextHour}
              explanation={crowdData?.explanation || "Based on typical traffic for this time."}
            />

            <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-display font-bold text-lg">Details</h3>
              
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Price</span>
                <span className="font-medium">{Array(place.averageCost).fill('$').join('')}</span>
              </div>
               <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Category</span>
                <span className="font-medium capitalize">{place.category}</span>
              </div>
            </div>
            
            <div className="rounded-2xl overflow-hidden h-48 bg-muted">
               {/* Mini Map - Static image placeholder for now since we have a main map */}
               <div className="w-full h-full bg-orange-50 flex items-center justify-center text-muted-foreground text-sm">
                  Mini Map View
               </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
