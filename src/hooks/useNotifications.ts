import { supabase } from "@/integrations/supabase/client";

type NotifType = {
  user_id: string;
  title: string;
  body: string;
  type: string;
  reference_id?: string | null;
};

export const sendNotification = async (notif: NotifType) => {
  await supabase.from("notifications").insert({
    user_id: notif.user_id,
    title: notif.title,
    body: notif.body,
    type: notif.type,
    reference_id: notif.reference_id || null,
  });
};

// 20+ notification types
export const notifyNewHustle = (userId: string, hustleTitle: string, hustleId: string) =>
  sendNotification({ user_id: userId, title: "New Hustle Nearby 📍", body: `"${hustleTitle}" was just posted near you!`, type: "new_hustle", reference_id: hustleId });

export const notifyNewMessage = (userId: string, senderName: string, convId: string) =>
  sendNotification({ user_id: userId, title: "New Message 💬", body: `${senderName} sent you a message.`, type: "message", reference_id: convId });

export const notifyBookingRequest = (userId: string, customerName: string, hustleTitle: string, bookingId: string) =>
  sendNotification({ user_id: userId, title: "New Booking Request 📅", body: `${customerName} wants to book "${hustleTitle}".`, type: "booking", reference_id: bookingId });

export const notifyBookingConfirmed = (userId: string, hustleTitle: string, bookingId: string) =>
  sendNotification({ user_id: userId, title: "Booking Confirmed ✅", body: `Your booking for "${hustleTitle}" has been confirmed!`, type: "booking_confirmed", reference_id: bookingId });

export const notifyBookingCancelled = (userId: string, hustleTitle: string, bookingId: string) =>
  sendNotification({ user_id: userId, title: "Booking Cancelled ❌", body: `Your booking for "${hustleTitle}" was cancelled.`, type: "booking_cancelled", reference_id: bookingId });

export const notifyBoostActivated = (userId: string, hustleTitle: string, hustleId: string) =>
  sendNotification({ user_id: userId, title: "Boost Activated 🚀", body: `"${hustleTitle}" is now boosted and getting more visibility!`, type: "boost", reference_id: hustleId });

export const notifyBoostExpiring = (userId: string, hustleTitle: string, hustleId: string) =>
  sendNotification({ user_id: userId, title: "Boost Expiring Soon ⏰", body: `Your boost for "${hustleTitle}" expires in 24 hours.`, type: "boost_expiring", reference_id: hustleId });

export const notifyNewInquiry = (userId: string, inquirerName: string, hustleTitle: string, hustleId: string) =>
  sendNotification({ user_id: userId, title: "New Inquiry 📩", body: `${inquirerName} is interested in "${hustleTitle}".`, type: "inquiry", reference_id: hustleId });

export const notifyVerificationApproved = (userId: string, level: number) =>
  sendNotification({ user_id: userId, title: "Verification Approved ✓", body: `Congratulations! Your Level ${level} verification has been approved.`, type: "verification" });

export const notifyVerificationRejected = (userId: string, reason: string) =>
  sendNotification({ user_id: userId, title: "Verification Update", body: `Your verification request needs attention: ${reason}`, type: "verification" });

export const notifyProfileView = (userId: string, viewerName: string) =>
  sendNotification({ user_id: userId, title: "Someone Viewed Your Profile 👀", body: `${viewerName} checked out your hustler profile.`, type: "profile_view" });

export const notifyWelcome = (userId: string) =>
  sendNotification({ user_id: userId, title: "Welcome to Fuse Gigs! 🎉", body: "Start by posting your first hustle and complete your profile to attract customers.", type: "welcome" });

export const notifyNewReview = (userId: string, reviewerName: string, hustleTitle: string, hustleId: string) =>
  sendNotification({ user_id: userId, title: "New Review ⭐", body: `${reviewerName} left a review on "${hustleTitle}".`, type: "review", reference_id: hustleId });

export const notifyHustleSaved = (userId: string, saverName: string, hustleTitle: string, hustleId: string) =>
  sendNotification({ user_id: userId, title: "Someone Saved Your Hustle ❤️", body: `${saverName} saved "${hustleTitle}" to their favorites.`, type: "hustle_saved", reference_id: hustleId });

export const notifyBookingReminder = (userId: string, hustleTitle: string, bookingId: string) =>
  sendNotification({ user_id: userId, title: "Booking Reminder ⏰", body: `Your booking for "${hustleTitle}" is coming up soon!`, type: "booking_reminder", reference_id: bookingId });

export const notifyHustleExpiring = (userId: string, hustleTitle: string, hustleId: string) =>
  sendNotification({ user_id: userId, title: "Hustle Needs Attention 🔔", body: `"${hustleTitle}" hasn't been updated in a while. Keep it fresh!`, type: "hustle_expiring", reference_id: hustleId });

export const notifyNewFollower = (userId: string, followerName: string) =>
  sendNotification({ user_id: userId, title: "New Follower 🙌", body: `${followerName} started following your hustles.`, type: "new_follower" });

export const notifyPaymentReceived = (userId: string, amount: number, hustleTitle: string) =>
  sendNotification({ user_id: userId, title: "Payment Received 💰", body: `You received R${amount} for "${hustleTitle}".`, type: "payment" });

export const notifyAcademyNewLesson = (userId: string, lessonTitle: string) =>
  sendNotification({ user_id: userId, title: "New Academy Lesson 🎓", body: `"${lessonTitle}" is now available in the Hustler Academy!`, type: "academy" });

export const notifyMilestone = (userId: string, milestone: string) =>
  sendNotification({ user_id: userId, title: "Achievement Unlocked 🏆", body: milestone, type: "milestone" });
