import { getCatalogPage } from "@/fixtures/catalog-pages.fixture";
import { toListParams, EMPTY_SEARCH } from "@/services/catalog/catalog.search-params";
import { getProductRepository } from "@/repositories/repositoryFactory";
const repo = getProductRepository();
for (const id of ["coussins","galettes-de-chaise","accessoires","coussins-lin"]) {
  const cfg = getCatalogPage(id);
  const params = toListParams(EMPTY_SEARCH, cfg.scope, 24);
  const r = await repo.list(params);
  console.log(id, JSON.stringify(cfg.scope), "=>", r.total);
}
