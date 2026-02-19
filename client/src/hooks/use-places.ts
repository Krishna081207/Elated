import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreatePlaceRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function usePlaces(filters?: { search?: string; vibe?: string }) {
  return useQuery({
    queryKey: [api.places.list.path, filters],
    queryFn: async () => {
      // Build query string manually or use URLSearchParams
      const url = new URL(api.places.list.path, window.location.origin);
      if (filters?.search) url.searchParams.set("search", filters.search);
      if (filters?.vibe) url.searchParams.set("vibe", filters.vibe);
      
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch places");
      return api.places.list.responses[200].parse(await res.json());
    },
  });
}

export function usePlace(id: number) {
  return useQuery({
    queryKey: [api.places.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.places.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch place details");
      return api.places.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function usePlaceCrowd(id: number) {
  return useQuery({
    queryKey: [api.ai.predictCrowd.path, id],
    queryFn: async () => {
      const url = buildUrl(api.ai.predictCrowd.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to predict crowd");
      return api.ai.predictCrowd.responses[200].parse(await res.json());
    },
    enabled: !!id,
    refetchInterval: 60000, // Refresh every minute
  });
}

export function useCreatePlace() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreatePlaceRequest) => {
      const res = await fetch(api.places.create.path, {
        method: api.places.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Validation failed");
        }
        throw new Error("Failed to create place");
      }
      return api.places.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.places.list.path] });
      toast({
        title: "Success!",
        description: "Place has been added to the map.",
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
