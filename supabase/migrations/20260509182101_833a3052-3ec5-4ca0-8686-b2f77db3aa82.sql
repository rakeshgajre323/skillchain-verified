ALTER TABLE public.institution_logos ADD COLUMN website_url TEXT;

-- Update existing rows with known institution websites (best effort)
UPDATE public.institution_logos SET website_url = 'https://www.iitd.ac.in' WHERE name ILIKE '%IIT Delhi%' OR name ILIKE '%Indian Institute of Technology, Delhi%';
UPDATE public.institution_logos SET website_url = 'https://www.iitb.ac.in' WHERE name ILIKE '%IIT Bombay%' OR name ILIKE '%Indian Institute of Technology, Bombay%';
UPDATE public.institution_logos SET website_url = 'https://jntuh.ac.in' WHERE name ILIKE '%JNTUH%' OR name ILIKE '%Jawaharlal Nehru Technological University, Hyderabad%';
UPDATE public.institution_logos SET website_url = 'https://www.osmania.ac.in' WHERE name ILIKE '%Osmania University%';
UPDATE public.institution_logos SET website_url = 'https://www.du.ac.in' WHERE name ILIKE '%University of Delhi%' OR name ILIKE '%Delhi University%';
UPDATE public.institution_logos SET website_url = 'https://www.lpu.in' WHERE name ILIKE '%Lovely Professional University%' OR name ILIKE '%LPU%';