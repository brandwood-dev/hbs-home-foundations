const A4_PAGE_WIDTH_MM = 210;
const A4_PAGE_HEIGHT_MM = 297;
const A4_MARGIN_MM = 10;
const PREPARATION_SLIP_WIDTH_PX = 710;

type DownloadPreparationSlipOptions = {
  element: HTMLElement;
  filename: string;
};

function waitForImage(image: HTMLImageElement): Promise<void> {
  if (image.complete) return Promise.resolve();

  return new Promise((resolve) => {
    const finish = () => {
      window.clearTimeout(timeoutId);
      image.removeEventListener("load", finish);
      image.removeEventListener("error", finish);
      resolve();
    };
    const timeoutId = window.setTimeout(finish, 5_000);
    image.addEventListener("load", finish, { once: true });
    image.addEventListener("error", finish, { once: true });
  });
}

async function waitForPreparationSlipAssets(element: HTMLElement): Promise<void> {
  if ("fonts" in document) await document.fonts.ready;

  await Promise.all(
    Array.from(element.querySelectorAll<HTMLImageElement>("img")).map(waitForImage),
  );
}

function safeFilename(filename: string): string {
  const normalized = filename
    .trim()
    .replace(/[<>:"/\\|?*]/g, "-")
    .replace(/\s+/g, "-");
  return `${normalized || "bon-de-preparation"}.pdf`;
}

function addCanvasPage(
  pdf: InstanceType<typeof import("jspdf").jsPDF>,
  source: HTMLCanvasElement,
  sourceY: number,
  sourceHeight: number,
  pageWidth: number,
  pageHeight: number,
  margin: number,
  addPage: boolean,
): void {
  if (addPage) pdf.addPage();

  const pageCanvas = document.createElement("canvas");
  pageCanvas.width = source.width;
  pageCanvas.height = sourceHeight;
  const context = pageCanvas.getContext("2d");
  if (!context) throw new Error("Le rendu du bon de préparation est indisponible.");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
  context.drawImage(
    source,
    0,
    sourceY,
    source.width,
    sourceHeight,
    0,
    0,
    pageCanvas.width,
    pageCanvas.height,
  );

  const renderedHeight = (sourceHeight * pageWidth) / source.width;
  pdf.addImage(
    pageCanvas.toDataURL("image/jpeg", 0.94),
    "JPEG",
    margin,
    margin,
    pageWidth,
    Math.min(renderedHeight, pageHeight - margin * 2),
    undefined,
    "FAST",
  );
}

export async function downloadPreparationSlipPdf({
  element,
  filename,
}: DownloadPreparationSlipOptions): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const canvas = await html2canvas(element, {
    allowTaint: false,
    backgroundColor: "#ffffff",
    imageTimeout: 15_000,
    logging: false,
    scale: 2,
    useCORS: true,
    width: PREPARATION_SLIP_WIDTH_PX,
    windowWidth: PREPARATION_SLIP_WIDTH_PX,
  });

  const pdf = new jsPDF({
    compress: true,
    format: "a4",
    orientation: "portrait",
    unit: "mm",
  });
  const contentWidth = A4_PAGE_WIDTH_MM - A4_MARGIN_MM * 2;
  const contentHeight = A4_PAGE_HEIGHT_MM - A4_MARGIN_MM * 2;
  const sourcePixelsPerMillimeter = canvas.width / contentWidth;
  const pageSourceHeight = Math.max(1, Math.floor(contentHeight * sourcePixelsPerMillimeter));

  for (let sourceY = 0, pageIndex = 0; sourceY < canvas.height; sourceY += pageSourceHeight) {
    const sourceHeight = Math.min(pageSourceHeight, canvas.height - sourceY);
    addCanvasPage(
      pdf,
      canvas,
      sourceY,
      sourceHeight,
      contentWidth,
      contentHeight,
      A4_MARGIN_MM,
      pageIndex > 0,
    );
    pageIndex += 1;
  }

  pdf.save(safeFilename(filename));
}

export async function preparePreparationSlipForDownload(element: HTMLElement): Promise<() => void> {
  const documentElement = document.documentElement;
  const originalTitle = document.title;
  const originalStyle = element.getAttribute("style");

  const restore = () => {
    documentElement.classList.remove("printing-preparation");
    document.title = originalTitle;
    if (originalStyle === null) element.removeAttribute("style");
    else element.setAttribute("style", originalStyle);
  };

  documentElement.classList.add("printing-preparation");
  element.style.width = `${PREPARATION_SLIP_WIDTH_PX}px`;
  element.style.maxWidth = "none";
  element.style.margin = "0";
  document.title = "Bon de préparation | HBS HOME";

  try {
    await new Promise<void>((resolve) => {
      window.requestAnimationFrame(() => resolve());
    });
    await waitForPreparationSlipAssets(element);
    return restore;
  } catch (error) {
    restore();
    throw error;
  }
}
