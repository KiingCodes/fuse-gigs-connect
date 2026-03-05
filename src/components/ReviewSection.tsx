import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface ReviewSectionProps {
  hustleId: string;
  hustleOwnerId: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_id: string;
  reviewer_profile?: { display_name: string | null; avatar_url: string | null };
}

const StarRating = ({ rating, onRate, interactive = false }: { rating: number; onRate?: (r: number) => void; interactive?: boolean }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`h-5 w-5 ${interactive ? "cursor-pointer" : ""} ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
        onClick={() => interactive && onRate?.(star)}
      />
    ))}
  </div>
);

const ReviewSection = ({ hustleId, hustleOwnerId }: ReviewSectionProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews", hustleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("hustle_id", hustleId)
        .order("created_at", { ascending: false });
      if (error) throw error;

      const reviewerIds = [...new Set((data || []).map((r: any) => r.reviewer_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", reviewerIds.length > 0 ? reviewerIds : ["_"]);
      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

      return (data || []).map((r: any) => ({
        ...r,
        reviewer_profile: profileMap.get(r.reviewer_id),
      })) as Review[];
    },
  });

  const submitReview = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("reviews").insert({
        hustle_id: hustleId,
        reviewer_id: user.id,
        rating: newRating,
        comment: newComment || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", hustleId] });
      setNewRating(0);
      setNewComment("");
      setShowForm(false);
      toast.success("Review submitted!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const hasReviewed = reviews.some((r) => r.reviewer_id === user?.id);
  const canReview = user && user.id !== hustleOwnerId && !hasReviewed;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Reviews</h3>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={Math.round(avgRating)} />
              <span className="text-sm text-muted-foreground">{avgRating.toFixed(1)} ({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
            </div>
          )}
        </div>
        {canReview && !showForm && (
          <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>Write a Review</Button>
        )}
      </div>

      {/* Review Form */}
      {showForm && canReview && (
        <Card className="mb-6 border-primary/20">
          <CardContent className="p-4 space-y-3">
            <div>
              <p className="text-sm font-medium text-foreground mb-1">Your Rating</p>
              <StarRating rating={newRating} onRate={setNewRating} interactive />
            </div>
            <Textarea
              placeholder="Share your experience (optional)..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => submitReview.mutate()}
                disabled={newRating === 0 || submitReview.isPending}
                className="gradient-primary text-primary-foreground"
              >
                {submitReview.isPending ? "Submitting..." : "Submit Review"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setShowForm(false); setNewRating(0); setNewComment(""); }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />)}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">No reviews yet. Be the first to review!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="flex gap-3 border-b border-border pb-4 last:border-0">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarImage src={review.reviewer_profile?.avatar_url || ""} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {review.reviewer_profile?.display_name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-foreground">{review.reviewer_profile?.display_name || "User"}</span>
                  <span className="text-xs text-muted-foreground">{format(new Date(review.created_at), "d MMM yyyy")}</span>
                </div>
                <StarRating rating={review.rating} />
                {review.comment && <p className="mt-1 text-sm text-foreground/80">{review.comment}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
