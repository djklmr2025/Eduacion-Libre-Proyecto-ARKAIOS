export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    // Optional simple auth: if ARKAIOS_SAVE_KEY exists, require matching header.
    const clientKey = req.headers["x-arkaios-key"];
    if (process.env.ARKAIOS_SAVE_KEY && clientKey !== process.env.ARKAIOS_SAVE_KEY) {
      return res.status(401).json({ ok: false, error: "Unauthorized" });
    }

    const body = req.body || {};
    const { title, description, type, code, fileName, fileData, uploadDate, preview } = body;

    if (!title || !code || !fileName) {
      return res.status(400).json({ ok: false, error: "Missing fields: title/code/fileName" });
    }

    const owner = "djklmr2025";
    const repo = "Eduacion-Libre-Proyecto-ARKAIOS";
    const branch = "main";

    // 1) Always upload metadata JSON
    const metaPath = `biblioteca/materiales/${code}.json`;
    const meta = {
      title,
      description: description || "",
      type: type || "other",
      code,
      fileName,
      uploadDate: uploadDate || new Date().toISOString(),
      preview: preview || null,
      source: "ARKAIOS Material Reutilizable"
    };

    const metaResult = await upsertToGithub({
      owner, repo, branch,
      path: metaPath,
      contentBase64: Buffer.from(JSON.stringify(meta, null, 2), "utf8").toString("base64"),
      message: `ARKAIOS: guardar metadata ${code}`
    });

    // 2) Upload PDF only if small enough for GitHub Contents API
    let pdfResult = null;
    if (typeof fileData === "string" && fileData.startsWith("data:application/pdf;base64,")) {
      const b64 = fileData.split(",")[1] || "";
      const approxBytes = Math.floor((b64.length * 3) / 4);

      // Keep a safety margin to avoid API rejection
      if (approxBytes <= 900_000) {
        const pdfPath = `biblioteca/pdfs/${code}.pdf`;
        pdfResult = await upsertToGithub({
          owner, repo, branch,
          path: pdfPath,
          contentBase64: b64,
          message: `ARKAIOS: subir PDF ${code}`
        });
      } else {
        pdfResult = {
          skipped: true,
          reason: "PDF demasiado grande para subir directo a GitHub. Se subió sólo metadata."
        };
      }
    }

    return res.status(200).json({ ok: true, meta: metaResult, pdf: pdfResult });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err?.message || "Server error" });
  }
}

async function upsertToGithub({ owner, repo, branch, path, contentBase64, message }) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("Missing GITHUB_TOKEN env var");

  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`;

  // Check if file exists (to get sha for update)
  let sha = null;
  const getResp = await fetch(`${url}?ref=${branch}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "ARKAIOS-Vercel"
    }
  });

  if (getResp.status === 200) {
    const existing = await getResp.json();
    sha = existing.sha;
  }

  const putResp = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "User-Agent": "ARKAIOS-Vercel"
    },
    body: JSON.stringify({
      message,
      content: contentBase64,
      branch,
      ...(sha ? { sha } : {})
    })
  });

  const data = await putResp.json();
  if (!putResp.ok) {
    throw new Error(data?.message || "GitHub API error");
  }

  return { path, commit: data?.commit?.sha || null, url: data?.content?.html_url || null };
}
