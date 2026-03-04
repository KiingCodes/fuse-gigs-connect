import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useData";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Clock, Loader2, CheckCircle } from "lucide-react";
import { format, addDays } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  hustleId: string;
  hustlerId: string;
  hustleTitle: string;
  hustlePrice?: number | null;
}

const TIME_SLOTS = [
  "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30", "20:00",
];

const BookingModal = ({ open, onClose, hustleId, hustlerId, hustleTitle, hustlePrice }: BookingModalProps) => {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");
  const [phone, setPhone] = useState("");
  const [success, setSuccess] = useState(false);

  const createBooking = useMutation({
    mutationFn: async () => {
      if (!user || !date || !time) throw new Error("Missing fields");
      const { error } = await supabase.from("bookings").insert({
        hustle_id: hustleId,
        customer_id: user.id,
        hustler_id: hustlerId,
        booking_date: format(date, "yyyy-MM-dd"),
        start_time: time,
        end_time: endTime || null,
        notes: notes || null,
        customer_name: profile?.display_name || null,
        customer_phone: phone || profile?.phone || null,
        total_price: hustlePrice || null,
      });
      if (error) throw error;

      // Notify hustler
      await supabase.from("notifications").insert({
        user_id: hustlerId,
        title: "New Booking Request 📅",
        body: `${profile?.display_name || "Someone"} wants to book "${hustleTitle}" on ${format(date, "MMM d")} at ${time}.`,
        type: "booking",
        reference_id: hustleId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      setSuccess(true);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const handleSubmit = () => {
    if (!date) { toast.error("Please select a date"); return; }
    if (!time) { toast.error("Please select a time"); return; }
    createBooking.mutate();
  };

  const resetAndClose = () => {
    setDate(undefined);
    setTime("");
    setEndTime("");
    setNotes("");
    setPhone("");
    setSuccess(false);
    onClose();
  };

  if (success) {
    return (
      <Dialog open={open} onOpenChange={resetAndClose}>
        <DialogContent className="sm:max-w-md">
          <div className="py-8 text-center">
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-success" />
            <h2 className="mb-2 text-2xl font-bold text-foreground">Booking Sent! 🎉</h2>
            <p className="text-muted-foreground mb-6">
              Your booking request for <strong>{hustleTitle}</strong> on{" "}
              <strong>{date ? format(date, "MMM d, yyyy") : ""}</strong> at <strong>{time}</strong> has been sent.
            </p>
            <p className="text-sm text-muted-foreground mb-6">The hustler will confirm your booking soon.</p>
            <Button onClick={resetAndClose} className="gradient-primary text-primary-foreground">Done</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" /> Book: {hustleTitle}
          </DialogTitle>
          <DialogDescription>Pick your preferred date and time</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Calendar */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Select Date</Label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(d) => d < new Date() || d > addDays(new Date(), 60)}
              className={cn("rounded-lg border p-3 pointer-events-auto")}
            />
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Start Time *</Label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time">
                    {time ? <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{time}</span> : "Select time"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">End Time (optional)</Label>
              <Select value={endTime} onValueChange={setEndTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select end">{endTime || "Select end"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.filter(t => t > time).map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Phone */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Contact Number</Label>
            <Input placeholder="e.g. 071 234 5678" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>

          {/* Notes */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Notes (optional)</Label>
            <Textarea placeholder="Any special requests or details..." value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
          </div>

          {/* Price */}
          {hustlePrice && (
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-sm text-muted-foreground">Estimated Price</p>
              <p className="text-2xl font-bold text-foreground">R{hustlePrice}</p>
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={createBooking.isPending || !date || !time}
            className="w-full gradient-primary text-primary-foreground gap-2"
          >
            {createBooking.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarIcon className="h-4 w-4" />}
            {createBooking.isPending ? "Booking..." : "Request Booking"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
