-- Create storage bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('img-store', 'img-store', false)  -- Changed to false
on conflict (id) do nothing;

-- Remove public access policy and replace with authenticated access
drop policy if exists "Public Access" on storage.objects;

create policy "Authenticated users can view images"
on storage.objects for select
using (
    auth.role() = 'authenticated' AND
    bucket_id = 'img-store'
);

-- Allow authenticated users to upload files
create policy "Authenticated users can upload images"
on storage.objects for insert
with check (
    auth.role() = 'authenticated' AND
    bucket_id = 'img-store' AND
    (storage.foldername(name))[1] = 'uploads'
);

-- Allow users to update their own files
create policy "Users can update own images"
on storage.objects for update
using (
    auth.uid() = owner AND
    bucket_id = 'img-store'
);

-- Allow users to delete their own files
create policy "Users can delete own images"
on storage.objects for delete
using (
    auth.uid() = owner AND
    bucket_id = 'img-store'
);
