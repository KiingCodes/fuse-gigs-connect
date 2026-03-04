import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar as CalendarIcon, Clock, CheckCircle, XCircle, Loader2,
  User, Phone, FileText, DollarSign, MapPin
} from "lucide-react";
import { format, isSameDay, parseISO } from "date-fns";
import { toast } from "sonner";
import { Link, Navigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Booking {
  id: string;
  hustle_id: string;
  customer_id: string;
  hustler_id: string;
  booking_date: string;
  start_time: string;
  end_time: string | null;
  status: string;
  notes: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  total_price: number | null;
  created_at: string;
  hustles?: { title: string; location: string | null };
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Pending", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", icon: <Clock className="h-3 w-3" /> },
  confirmed: { label: "Confirmed", color: "bg-success/10 text-success border-success/20", icon: <CheckCircle className="h-3 w-3" /> },
  completed: { label: "Completed", color: "bg-primary/10 text-primary border-primary/20", icon: <CheckCircle className="h-3 w-3" /> },
  cancelled: { label: "Cancelled", color: "bg-destructive/10 text-destructive border-destructive/20", icon: <XCircle className="h-3 w-3" /> },
};

const Bookings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState("incoming");

  const { data: incomingBookings, isLoading: loadingIn } = useQuery({
    queryKey: ["bookings", "incoming", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, hustles(title, location)")
        .eq("hustler_id", user!.id)
        .order("booking_date", { ascending: true })
        .order("start_time", { ascending: true });
      if (error) throw error;
      return data as Booking[];
    },
    enabled: !!user,
  });

  const { data: myBookings, isLoading: loadingMy } = useQuery({
    queryKey: ["bookings", "my", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, hustles(title, location)")
        .eq("customer_id", user!.id)
        .order("booking_date", { ascending: true })
        .order("start_time", { ascending: true });
      if (error) throw error;
      return data as Booking[];
    },
    enabled: !!user,
  });

  const updateBooking = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
      if (error) throw error;

      // Send notification
      const booking = [...(incomingBookings || []), ...(myBookings || [])].find(b => b.id === id);
      if (booking) {
        const targetId = status === "confirmed" || status === "cancelled" ? booking.customer_id : booking.hustler_id;
        await supabase.from("notifications").insert({
          user_id: targetId,
          title: `Booking ${status}`,
          body: `Your booking for "${booking.hustles?.title}" has been ${status}.`,
          type: "booking",
          reference_id: id,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Booking updated!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (!user) return <Navigate to="/auth" />;

  const currentBookings = activeTab === "incoming" ? incomingBookings : myBookings;
  const isLoading = activeTab === "incoming" ? loadingIn : loadingMy;

  // Get dates that have bookings for calendar highlights
  const bookedDates = (currentBookings || []).map(b => parseISO(b.booking_date));

  const dayBookings = selectedDate
    ? (currentBookings || []).filter(b => isSameDay(parseISO(b.booking_date), selectedDate))
    : [];

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Bookings Calendar" description="Manage your hustle bookings" path="/bookings" />
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <CalendarIcon className="h-8 w-8 text-primary" /> Bookings
          </h1>
          <p className="text-muted-foreground">Manage your schedule and appointments</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="incoming" className="gap-1.5">
              Incoming Requests
              {incomingBookings?.filter(b => b.status === "pending").length ? (
                <Badge variant="destructive" className="ml-1 h-5 min-w-5 px-1 text-xs">{incomingBookings.filter(b => b.status === "pending").length}</Badge>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="my">My Bookings</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
              {/* Calendar */}
              <Card className="shadow-card">
                <CardContent className="p-4">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className={cn("p-3 pointer-events-auto")}
                    modifiers={{ booked: bookedDates }}
                    modifiersStyles={{ booked: { fontWeight: "bold", backgroundColor: "hsl(var(--primary) / 0.15)", borderRadius: "50%" } }}
                  />
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground px-2">
                    <div className="h-3 w-3 rounded-full bg-primary/20" /> Has bookings
                  </div>
                </CardContent>
              </Card>

              {/* Day Bookings */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">
                  {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "Select a date"}
                </h2>

                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : dayBookings.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <CalendarIcon className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                      <p className="text-muted-foreground">No bookings for this day</p>
                    </CardContent>
                  </Card>
                ) : (
                  dayBookings.map(booking => {
                    const sc = statusConfig[booking.status] || statusConfig.pending;
                    return (
                      <Card key={booking.id} className="shadow-card transition-all hover:shadow-elevated">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-foreground">{booking.hustles?.title || "Unknown Hustle"}</h3>
                              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                <Clock className="h-3.5 w-3.5" />
                                {booking.start_time?.slice(0, 5)}{booking.end_time ? ` - ${booking.end_time.slice(0, 5)}` : ""}
                              </div>
                            </div>
                            <Badge variant="outline" className={`gap-1 ${sc.color}`}>
                              {sc.icon} {sc.label}
                            </Badge>
                          </div>

                          <div className="grid gap-2 text-sm">
                            {booking.customer_name && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <User className="h-3.5 w-3.5" /> {booking.customer_name}
                              </div>
                            )}
                            {booking.customer_phone && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="h-3.5 w-3.5" /> {booking.customer_phone}
                              </div>
                            )}
                            {booking.hustles?.location && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5" /> {booking.hustles.location}
                              </div>
                            )}
                            {booking.notes && (
                              <div className="flex items-start gap-2 text-muted-foreground">
                                <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {booking.notes}
                              </div>
                            )}
                            {booking.total_price && (
                              <div className="flex items-center gap-2 font-medium text-foreground">
                                <DollarSign className="h-3.5 w-3.5" /> R{booking.total_price}
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          {activeTab === "incoming" && booking.status === "pending" && (
                            <div className="mt-4 flex gap-2">
                              <Button
                                size="sm"
                                className="gap-1 gradient-primary text-primary-foreground"
                                onClick={() => updateBooking.mutate({ id: booking.id, status: "confirmed" })}
                                disabled={updateBooking.isPending}
                              >
                                <CheckCircle className="h-4 w-4" /> Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="gap-1"
                                onClick={() => updateBooking.mutate({ id: booking.id, status: "cancelled" })}
                                disabled={updateBooking.isPending}
                              >
                                <XCircle className="h-4 w-4" /> Decline
                              </Button>
                            </div>
                          )}
                          {activeTab === "incoming" && booking.status === "confirmed" && (
                            <div className="mt-4">
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1"
                                onClick={() => updateBooking.mutate({ id: booking.id, status: "completed" })}
                                disabled={updateBooking.isPending}
                              >
                                <CheckCircle className="h-4 w-4" /> Mark Complete
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                )}

                {/* Upcoming summary */}
                {!isLoading && (currentBookings || []).filter(b => b.status === "pending" || b.status === "confirmed").length > 0 && (
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <h3 className="text-sm font-semibold text-foreground mb-2">Upcoming Overview</h3>
                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="rounded-lg bg-background p-3">
                          <p className="text-2xl font-bold text-primary">
                            {(currentBookings || []).filter(b => b.status === "pending").length}
                          </p>
                          <p className="text-xs text-muted-foreground">Pending</p>
                        </div>
                        <div className="rounded-lg bg-background p-3">
                          <p className="text-2xl font-bold text-success">
                            {(currentBookings || []).filter(b => b.status === "confirmed").length}
                          </p>
                          <p className="text-xs text-muted-foreground">Confirmed</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Bookings;
