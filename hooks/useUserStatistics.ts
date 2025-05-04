import { createClient } from "@/utils/supabase/client";
import { UserStatistics } from "@/types/database";
import { useState, useEffect } from "react";

export function useUserStatistics(userId: string | undefined) {
  const [stats, setStats] = useState<UserStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchStats() {
      if (!userId) return;
      
      const { data, error } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (!error && data) {
        setStats(data);
      }
      setLoading(false);
    }

    fetchStats();
  }, [userId, supabase]);

  return { stats, loading };
}
