import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateReviewRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useReviews(placeId: number) {
  return useQuery({
    queryKey: [api.reviews.listByPlace.path, placeId],
    queryFn: async () => {
      const url = buildUrl(api.reviews.listByPlace.path, { id: placeId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return api.reviews.listByPlace.responses[200].parse(await res.json());
    },
    enabled: !!placeId,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateReviewRequest) => {
      const res = await fetch(api.reviews.create.path, {
        method: api.reviews.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Validation failed");
        }
        throw new Error("Failed to submit review");
      }
      return api.reviews.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [api.reviews.listByPlace.path, variables.placeId] 
      });
      // Also invalidate place details as stats might change
      queryClient.invalidateQueries({
        queryKey: [api.places.get.path, variables.placeId]
      });
      
      toast({
        title: "Review submitted",
        description: "Thanks for sharing your vibe check!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
