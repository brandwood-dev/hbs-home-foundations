import { HbsApiClient } from "@/api/client";
import type { StoreSettings } from "@/config/store.config";

export class ApiStoreSettingsRepository {
  constructor(private readonly apiClient: HbsApiClient = new HbsApiClient()) {}

  get(): Promise<StoreSettings> {
    return this.apiClient.get<StoreSettings>("/api/v1/store/settings");
  }
}
