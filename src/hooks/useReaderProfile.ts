import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface ReaderProfile {
  topics: string[] | null;
  depth: string;
  frequency: string;
  tone: string;
  regions: string[] | null;
  plan: string;
}

export function useReaderProfile() {
  const { user } = useAuth();
  return useQuery<ReaderProfile | null>({
    queryKey: ["reader-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("reader_profiles")
        .select("topics, depth, frequency, tone, regions, plan")
        .eq("user_id", user.id)
        .maybeSingle();
      return data as ReaderProfile | null;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });
}
