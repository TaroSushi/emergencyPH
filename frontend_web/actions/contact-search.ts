'use server'

import { createClient } from '@/utils/supabase/server'

export async function handleSubmit(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const region = formData.get('region') as string
  const category = formData.get('category') as string
  const classification = formData.get('classification') as string
  const type = formData.get('type') as string

  try {
    const { data, error } = await supabase.rpc('search_contacts', {
      p_type: type,
      p_name: name,
      p_region: region,
      p_category: category,
      p_classification: classification
    })

    if (error) {
      throw error;
    }

    return { success: true, data };

  } catch (error) {
    console.error('Error searching contacts:', error);
    return { success: false, data: [], error };
  }
}
