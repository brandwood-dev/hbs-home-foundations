import { useQuery } from "@tanstack/react-query";
import { storeSettingsFallback } from "@/config/store.config";
import { ApiStoreSettingsRepository } from "@/repositories/api/ApiStoreSettingsRepository";
import { dataProvider } from "@/config/features.config";

const repository = new ApiStoreSettingsRepository();

export function useStoreSettings() {
  const query = useQuery({
    queryKey: ["store-settings"],
    queryFn: () => repository.get(),
    // Keep the first SSR render deterministic; the public settings are fetched
    // once the browser hydrates and then cached for all storefront components.
    enabled: dataProvider === "api" && typeof window !== "undefined",
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });

  return {
    ...query,
    data: query.data ?? storeSettingsFallback,
  };
}
