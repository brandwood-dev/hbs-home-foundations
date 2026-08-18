import { ArrowDown, ArrowUp, Plus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminFormSection } from "@/admin/components/ui/AdminForm";
import { AdminEmptyState } from "@/admin/components/ui/AdminStates";
import type { AdminProductImage } from "@/admin/types/admin.types";
import { adminId } from "@/admin/utils/admin.utils";

export function AdminProductImagesEditor({
  images,
  onChange,
}: {
  images: AdminProductImage[];
  onChange: (images: AdminProductImage[]) => void;
}) {
  function update(id: string, patch: Partial<AdminProductImage>) {
    onChange(images.map((image) => (image.id === id ? { ...image, ...patch } : image)));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    const current = next[index] as AdminProductImage;
    next[index] = next[target] as AdminProductImage;
    next[target] = current;
    onChange(next.map((image, order) => ({ ...image, order: order + 1 })));
  }

  return (
    <AdminFormSection
      title="Médias"
      description="La première image est utilisée comme visuel principal. Un texte alternatif est requis pour publier."
    >
      {images.length === 0 ? (
        <AdminEmptyState
          title="Aucune image"
          description="Ajoutez au moins une image avant de publier le produit."
        />
      ) : (
        <ul className="grid gap-3">
          {images.map((image, index) => (
            <li
              key={image.id}
              className="grid gap-2 rounded-md border border-border p-3 sm:grid-cols-[64px_1fr_auto] sm:items-start"
            >
              <img
                src={image.url}
                alt=""
                className="size-16 rounded border border-border object-cover"
              />
              <div className="grid gap-2">
                <Input
                  value={image.url}
                  aria-label="URL de l'image"
                  placeholder="https://…"
                  onChange={(event) => update(image.id, { url: event.target.value })}
                />
                <Input
                  value={image.alt}
                  aria-label="Texte alternatif"
                  placeholder="Texte alternatif (accessibilité et SEO)"
                  onChange={(event) => update(image.id, { alt: event.target.value })}
                />
              </div>
              <div className="flex gap-1 sm:flex-col">
                <Button
                  type="button"
                  variant={image.isPrimary ? "default" : "outline"}
                  size="icon"
                  aria-label="Définir comme image principale"
                  onClick={() =>
                    onChange(images.map((item) => ({ ...item, isPrimary: item.id === image.id })))
                  }
                >
                  <Star className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Monter l'image"
                  onClick={() => move(index, -1)}
                >
                  <ArrowUp className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Descendre l'image"
                  onClick={() => move(index, 1)}
                >
                  <ArrowDown className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Supprimer l'image"
                  onClick={() => onChange(images.filter((item) => item.id !== image.id))}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="justify-self-start"
        onClick={() =>
          onChange([
            ...images,
            {
              id: adminId("img"),
              url: "",
              alt: "",
              order: images.length + 1,
              isPrimary: images.length === 0,
            },
          ])
        }
      >
        <Plus className="mr-1 size-4" /> Ajouter une image
      </Button>
    </AdminFormSection>
  );
}
