-- Add publishing and scheduling columns to songs table
ALTER TABLE public.songs 
ADD COLUMN published boolean DEFAULT false,
ADD COLUMN scheduled_for date,
ADD COLUMN locked_until date;

-- Update "Trading My Sorrows" to be published and scheduled
UPDATE public.songs 
SET published = true,
    scheduled_for = '2024-11-12',
    locked_until = '2024-11-05'
WHERE title = 'Trading My Sorrows';