import { demoCushions } from "@/fixtures/coussins.fixture";
import { demoChairPads } from "@/fixtures/galettes.fixture";
import { filterProducts } from "@/services/catalog/catalog.filters";
console.log(demoCushions.length, demoChairPads.length);
console.log(demoCushions.map((p) => `${p.slug} v=${p.variants.length} avail=${p.variants.filter((v)=>v.availability!=="discontinued").length}`).join("\n"));
