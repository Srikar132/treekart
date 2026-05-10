-- 1. Create the new tree_plans table
CREATE TABLE public.tree_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    badge_text TEXT,
    badge_color TEXT,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for tree_plans
ALTER TABLE public.tree_plans ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active tree_plans
CREATE POLICY "Allow public read access to active tree_plans" ON public.tree_plans FOR SELECT USING (is_active = true);

-- Allow admin full access to tree_plans
CREATE POLICY "Allow admin full access to tree_plans" ON public.tree_plans FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- 2. Insert the initial hardcoded plans
INSERT INTO public.tree_plans (id, name, badge_text, badge_color, features) VALUES
(
    uuid_generate_v4(), 
    'Base Tree', 
    'Base', 
    NULL, 
    '[{"text": "10-20 dozen mangoes", "isHighlight": false}, {"text": "30-50 kg approximate weight", "isHighlight": false}, {"text": "30 kg minimum guaranteed", "isHighlight": true, "highlightColor": "bg-[#e8f5e9]"}, {"text": "Fresh delivery included", "isHighlight": false}, {"text": "Video updates", "isHighlight": false}]'::jsonb
),
(
    uuid_generate_v4(), 
    'Standard Tree', 
    'Standard', 
    'bg-blue-600', 
    '[{"text": "15-25 dozen mangoes", "isHighlight": false}, {"text": "45-75 kg approximate weight", "isHighlight": false}, {"text": "45 kg minimum guaranteed", "isHighlight": true, "highlightColor": "bg-[#e3f2fd]"}, {"text": "Fresh delivery included", "isHighlight": false}, {"text": "Video updates", "isHighlight": false}]'::jsonb
),
(
    uuid_generate_v4(), 
    'Max Tree', 
    'Max', 
    'bg-amber-500', 
    '[{"text": "20-30 dozen mangoes", "isHighlight": false}, {"text": "60-90 kg approximate weight", "isHighlight": false}, {"text": "60 kg minimum guaranteed", "isHighlight": true, "highlightColor": "bg-[#fff8e1]"}, {"text": "Fresh delivery included", "isHighlight": false}, {"text": "Video updates", "isHighlight": false}]'::jsonb
);

-- 3. Modify the trees table to use plan_id instead of plan_type
-- WARNING: This will drop the plan_type column. If you have existing trees, you must migrate their data BEFORE running these specific lines.
ALTER TABLE public.trees ADD COLUMN plan_id UUID REFERENCES public.tree_plans(id);

-- Optional: If you had data, you'd do an UPDATE here to set plan_id based on plan_type string.
-- E.g., UPDATE public.trees t SET plan_id = p.id FROM public.tree_plans p WHERE p.name ILIKE t.plan_type || '%';

-- Drop the old column and the type
ALTER TABLE public.trees DROP COLUMN plan_type;
DROP TYPE IF EXISTS public.plan_type;
