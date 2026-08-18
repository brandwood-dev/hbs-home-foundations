import { DEFAULT_MEASUREMENT_RULES } from "@/domain/measurement/measurement.constants";
import type { MeasurementRules } from "@/domain/measurement/measurement.types";
import type { MeasurementRulesRepository } from "@/repositories/interfaces/MeasurementRulesRepository";

/** Règles statiques de démonstration — remplacées par l'API ou le CMS plus tard. */
export class MockMeasurementRulesRepository implements MeasurementRulesRepository {
  async getRules(): Promise<MeasurementRules> {
    return DEFAULT_MEASUREMENT_RULES;
  }
}
