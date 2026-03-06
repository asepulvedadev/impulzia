import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import { slugify } from '@/lib/utils/slugify'

export class SlugService {
  static generate(name: string): string {
    return slugify(name)
  }

  static async ensureUnique(slug: string, supabase: SupabaseClient<Database>): Promise<string> {
    let candidate = slug
    let counter = 2

    while (true) {
      const { data } = await supabase
        .from('businesses')
        .select('slug')
        .eq('slug', candidate)
        .maybeSingle()

      if (!data) return candidate
      candidate = `${slug}-${counter}`
      counter++
    }
  }
}
