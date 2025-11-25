-- Add DELETE policies for user data tables to support privacy dashboard

-- Allow users to delete their own orders
CREATE POLICY "Users can delete their own orders"
ON public.orders
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to delete their own location history
CREATE POLICY "Users can delete their own location history"
ON public.location_history
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to delete their own swipe events
CREATE POLICY "Users can delete their own swipe events"
ON public.swipe_events
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);