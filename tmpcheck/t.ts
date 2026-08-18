import { getProductRepository } from "@/repositories/repositoryFactory";
const repo = getProductRepository();
for (const c of ["coussins","galettes_de_chaise","accessoires"] as const) {
  const r = await repo.list({ categories: [c] } as never);
  console.log(c, r.total ?? (r as never as {items:unknown[]}).items?.length);
}
