import type { MeasurementRules } from "@/domain/measurement/measurement.types";

/** Contrat futur : GET /api/v1/measurement-rules. */
export interface MeasurementRulesRepository {
  getRules(): Promise<MeasurementRules>;
}
