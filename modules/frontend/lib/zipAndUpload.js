
import JSZip from "jszip";


export default async function zipAndUpload(files, url = "http://localhost:5400/scan") {
  if (!files || !files.length) throw new Error("No files to upload");

  const zip = new JSZip();
  for (const file of files) {
    const path = file.webkitRelativePath || file.name;
    const data = await file.arrayBuffer();
    zip.file(path, data);
  }

  const blob = await zip.generateAsync({ type: "blob" });
  const formData = new FormData();
  formData.append("project", blob, "project.zip");

  const response = await fetch(url, { method: "POST", body: formData });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Upload failed: ${response.status} ${text}`);
  }

  const json = await response.json();
  // Return the whole backend JSON instead of `json.results`
  return json;
}
