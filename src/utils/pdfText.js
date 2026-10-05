import * as pdfjs from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

// Extracts plain text in the browser, so only text (not the PDF) is stored in db.json
export async function pdfToText(file) {
  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  let out = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    out += (await page.getTextContent()).items.map((it) => it.str).join(" ") + "\n";
  }
  return out.trim();
}
