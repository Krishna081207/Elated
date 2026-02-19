import { Layout } from "@/components/Layout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPlaceSchema, type CreatePlaceRequest } from "@shared/schema";
import { useCreatePlace } from "@/hooks/use-places";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocation } from "wouter";

// Extend schema for form handling (string -> number conversions handled by zod coerce in API, but form needs care)
const formSchema = insertPlaceSchema.extend({
  // Override amenities to be a simple array of strings for the UI form, convert to object later
  amenities: insertPlaceSchema.shape.amenities, 
});

export default function AddPlace() {
  const [, setLocation] = useLocation();
  const createPlace = useCreatePlace();
  const { toast } = useToast();

  const form = useForm<CreatePlaceRequest>({
    resolver: zodResolver(insertPlaceSchema),
    defaultValues: {
      name: "",
      description: "",
      address: "",
      lat: 40.7128, // Default NYC
      lng: -74.0060,
      category: "cafe",
      averageCost: 2,
      vibeTags: [],
      images: ["https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80"], // Default placeholder
      amenities: { wifi: false, outlets: false, petFriendly: false },
    },
  });

  function onSubmit(data: CreatePlaceRequest) {
    createPlace.mutate(data, {
      onSuccess: () => {
        setLocation("/");
      },
    });
  }

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto bg-background p-6 md:p-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="font-display font-bold text-3xl md:text-4xl mb-2">Add a New Spot</h1>
            <p className="text-muted-foreground">Share a hidden gem with the community.</p>
          </div>

          <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Place Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. The Cozy Corner" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="cafe">Cafe</SelectItem>
                            <SelectItem value="restaurant">Restaurant</SelectItem>
                            <SelectItem value="bistro">Bistro</SelectItem>
                            <SelectItem value="bar">Bar</SelectItem>
                            <SelectItem value="library">Library</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="What makes this place special? describe the vibe..." 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-6">
                   <FormField
                    control={form.control}
                    name="averageCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Average Cost (1-5)</FormLabel>
                        <Select onValueChange={(v) => field.onChange(parseInt(v))} defaultValue={String(field.value)}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Cost" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">$</SelectItem>
                            <SelectItem value="2">$$</SelectItem>
                            <SelectItem value="3">$$$</SelectItem>
                            <SelectItem value="4">$$$$</SelectItem>
                            <SelectItem value="5">$$$$$</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-3">
                  <FormLabel>Amenities</FormLabel>
                  <div className="flex flex-wrap gap-4">
                    <FormField
                      control={form.control}
                      name="amenities.wifi"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={Boolean(field.value)}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Free WiFi</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="amenities.outlets"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={Boolean(field.value)}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Power Outlets</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-4">
                   <Button type="button" variant="ghost" onClick={() => setLocation("/")}>Cancel</Button>
                   <Button type="submit" disabled={createPlace.isPending} className="px-8">
                     {createPlace.isPending ? "Adding..." : "Add Place"}
                   </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
