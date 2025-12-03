import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import db from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const extension = path.extname(file.originalname) || "";
    cb(null, `${unique}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    files: 10,
    fileSize: 5 * 1024 * 1024,
  },
});

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(uploadsDir));

function mapProject(row) {
  if (!row) return null;
  const images = parseImages(row.images, row.image);
  return {
    id: row.id,
    tag: row.tag,
    title: row.title,
    description: row.description,
    bullets: row.bullets ?? "",
    linkLabel: row.link_label ?? "",
    linkUrl: row.link_url ?? "",
    image: row.image ?? "",
    images,
    createdAt: row.created_at,
  };
}

function mapSkill(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    details: row.details,
    createdAt: row.created_at,
  };
}

function mapBlog(row) {
  if (!row) return null;
  const images = parseImages(row.images);
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    link: row.link,
    images,
    createdAt: row.created_at,
  };
}

function mapCertification(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    issuer: row.issuer ?? "",
    year: row.year ?? "",
    description: row.description ?? "",
    createdAt: row.created_at,
  };
}

function mapAbout(row) {
  if (!row) {
    return { heading: "", summary: "", bullets: "", photo: "", updatedAt: null };
  }
  return {
    heading: row.heading ?? "",
    summary: row.summary ?? "",
    bullets: row.bullets ?? "",
    photo: row.photo ?? "",
    updatedAt: row.updated_at,
  };
}

function mapFeaturedSkill(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    details: row.details ?? "",
    createdAt: row.created_at,
  };
}

function splitLines(value) {
  if (!value) return [];
  return String(value)
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function mapHero(row) {
  const badges = splitLines(row?.badges ?? "");
  const metrics = splitLines(row?.metrics ?? "").map((entry) => {
    const [value, label] = entry.split("|").map((part) => part?.trim() ?? "");
    return { value: value || "", label: label || "" };
  });
  return {
    tagline: row?.tagline ?? "",
    headline: row?.headline ?? "",
    subheading: row?.subheading ?? "",
    badges,
    metrics,
    primaryLabel: row?.primary_label ?? "",
    primaryUrl: row?.primary_url ?? "",
    secondaryLabel: row?.secondary_label ?? "",
    secondaryUrl: row?.secondary_url ?? "",
    updatedAt: row?.updated_at ?? null,
  };
}

function parseImages(value, legacyValue = "") {
  if (!value && legacyValue) {
    return legacyValue ? [legacyValue].filter(Boolean) : [];
  }
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map((url) => String(url)).filter(Boolean);
      }
    } catch (error) {
      console.warn("Unable to parse images column", error);
      return value.split(/,|\n/).map((item) => item.trim()).filter(Boolean);
    }
  }
  return [];
}

const insertProject = db.prepare(`
  INSERT INTO projects (tag, title, description, bullets, link_label, link_url, image, images)
  VALUES (@tag, @title, @description, @bullets, @linkLabel, @linkUrl, @image, @images)
`);
const listProjects = db.prepare("SELECT * FROM projects ORDER BY created_at DESC");
const deleteProjects = db.prepare("DELETE FROM projects");

const insertSkill = db.prepare(`
  INSERT INTO skills (title, details)
  VALUES (@title, @details)
`);
const listSkills = db.prepare("SELECT * FROM skills ORDER BY created_at DESC");
const deleteSkills = db.prepare("DELETE FROM skills");

const insertBlog = db.prepare(`
  INSERT INTO blogs (title, summary, link, images)
  VALUES (@title, @summary, @link, @images)
`);
const listBlogs = db.prepare("SELECT * FROM blogs ORDER BY created_at DESC");
const deleteBlogs = db.prepare("DELETE FROM blogs");

const insertCertification = db.prepare(`
  INSERT INTO certifications (title, issuer, year, description)
  VALUES (@title, @issuer, @year, @description)
`);
const listCertifications = db.prepare("SELECT * FROM certifications ORDER BY created_at DESC");
const deleteCertifications = db.prepare("DELETE FROM certifications");

const getAbout = db.prepare("SELECT * FROM about WHERE id = 1");
const updateAbout = db.prepare(`
  UPDATE about
  SET heading = @heading,
      summary = @summary,
      bullets = @bullets,
      photo = @photo,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = 1
`);

const clearAbout = db.prepare(`
  UPDATE about
  SET heading = '',
      summary = '',
      bullets = '',
      photo = '',
      updated_at = CURRENT_TIMESTAMP
  WHERE id = 1
`);

const insertFeaturedSkill = db.prepare(`
  INSERT INTO featured_skills (title, details)
  VALUES (@title, @details)
`);
const listFeaturedSkills = db.prepare("SELECT * FROM featured_skills ORDER BY created_at DESC");
const deleteFeaturedSkills = db.prepare("DELETE FROM featured_skills");
const getHero = db.prepare("SELECT * FROM hero_content WHERE id = 1");
const updateHero = db.prepare(`
  UPDATE hero_content
  SET tagline = @tagline,
      headline = @headline,
      subheading = @subheading,
      badges = @badges,
      metrics = @metrics,
      primary_label = @primaryLabel,
      primary_url = @primaryUrl,
      secondary_label = @secondaryLabel,
      secondary_url = @secondaryUrl,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = 1
`);
const clearHero = db.prepare(`
  UPDATE hero_content
  SET tagline = '',
      headline = '',
      subheading = '',
      badges = '',
      metrics = '',
      primary_label = '',
      primary_url = '',
      secondary_label = '',
      secondary_url = '',
      updated_at = CURRENT_TIMESTAMP
  WHERE id = 1
`);

function validateFields(fields, body) {
  const missing = fields.filter((field) => {
    const value = body[field];
    return value === undefined || value === null || `${value}`.trim() === "";
  });
  return missing;
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/uploads", upload.array("images", 10), (req, res) => {
  const protocol = req.get("x-forwarded-proto") ?? req.protocol;
  const host = req.get("host");
  const origin = host ? `${protocol}://${host}` : "";
  const files = (req.files ?? []).map((file) => ({
    fileName: file.filename,
    originalName: file.originalname,
    url: origin ? `${origin}/uploads/${file.filename}` : `/uploads/${file.filename}`,
    size: file.size,
    mimetype: file.mimetype,
  }));
  res.status(201).json({ files });
});

app.get("/api/projects", (req, res) => {
  const rows = listProjects.all();
  res.json(rows.map(mapProject));
});

app.post("/api/projects", (req, res) => {
  const body = req.body ?? {};
  const missing = validateFields(["tag", "title", "description"], body);
  if (missing.length) {
    res.status(400).json({ error: `Missing fields: ${missing.join(", ")}` });
    return;
  }
  const payload = {
    tag: String(body.tag).trim(),
    title: String(body.title).trim(),
    description: String(body.description).trim(),
    bullets: String(body.bullets ?? "").trim(),
    linkLabel: String(body.linkLabel ?? "").trim(),
    linkUrl: String(body.linkUrl ?? "").trim(),
    image: String(body.image ?? "").trim(),
    images: JSON.stringify(Array.isArray(body.images) ? body.images : []),
  };
  try {
    const result = insertProject.run(payload);
    const row = db.prepare("SELECT * FROM projects WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json(mapProject(row));
  } catch (error) {
    console.error("Failed to insert project", error);
    res.status(500).json({ error: "Unable to save project" });
  }
});

app.get("/api/skills", (req, res) => {
  const rows = listSkills.all();
  res.json(rows.map(mapSkill));
});

app.post("/api/skills", (req, res) => {
  const body = req.body ?? {};
  const missing = validateFields(["title", "details"], body);
  if (missing.length) {
    res.status(400).json({ error: `Missing fields: ${missing.join(", ")}` });
    return;
  }
  const payload = {
    title: String(body.title).trim(),
    details: String(body.details).trim(),
  };
  try {
    const result = insertSkill.run(payload);
    const row = db.prepare("SELECT * FROM skills WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json(mapSkill(row));
  } catch (error) {
    console.error("Failed to insert skill", error);
    res.status(500).json({ error: "Unable to save skill" });
  }
});

app.get("/api/blogs", (req, res) => {
  const rows = listBlogs.all();
  res.json(rows.map(mapBlog));
});

app.post("/api/blogs", (req, res) => {
  const body = req.body ?? {};
  const missing = validateFields(["title", "summary", "link"], body);
  if (missing.length) {
    res.status(400).json({ error: `Missing fields: ${missing.join(", ")}` });
    return;
  }
  const payload = {
    title: String(body.title).trim(),
    summary: String(body.summary).trim(),
    link: String(body.link).trim(),
    images: JSON.stringify(Array.isArray(body.images) ? body.images : []),
  };
  try {
    const result = insertBlog.run(payload);
    const row = db.prepare("SELECT * FROM blogs WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json(mapBlog(row));
  } catch (error) {
    console.error("Failed to insert blog", error);
    res.status(500).json({ error: "Unable to save blog" });
  }
});

app.get("/api/certifications", (req, res) => {
  const rows = listCertifications.all();
  res.json(rows.map(mapCertification));
});

app.post("/api/certifications", (req, res) => {
  const body = req.body ?? {};
  const missing = validateFields(["title", "year"], body);
  if (missing.length) {
    res.status(400).json({ error: `Missing fields: ${missing.join(", ")}` });
    return;
  }
  const payload = {
    title: String(body.title).trim(),
    issuer: String(body.issuer ?? "").trim(),
    year: String(body.year).trim(),
    description: String(body.description ?? "").trim(),
  };
  try {
    const result = insertCertification.run(payload);
    const row = db.prepare("SELECT * FROM certifications WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json(mapCertification(row));
  } catch (error) {
    console.error("Failed to insert certification", error);
    res.status(500).json({ error: "Unable to save certification" });
  }
});

app.get("/api/about", (req, res) => {
  const row = getAbout.get();
  res.json(mapAbout(row));
});

app.put("/api/about", (req, res) => {
  const body = req.body ?? {};
  const missing = validateFields(["heading", "summary"], body);
  if (missing.length) {
    res.status(400).json({ error: `Missing fields: ${missing.join(", ")}` });
    return;
  }
  const payload = {
    heading: String(body.heading).trim(),
    summary: String(body.summary).trim(),
    bullets: String(body.bullets ?? "").trim(),
    photo: String(body.photo ?? "").trim(),
  };
  try {
    updateAbout.run(payload);
    const row = getAbout.get();
    res.json(mapAbout(row));
  } catch (error) {
    console.error("Failed to update about", error);
    res.status(500).json({ error: "Unable to update about section" });
  }
});

app.get("/api/featured-skills", (req, res) => {
  const rows = listFeaturedSkills.all();
  res.json(rows.map(mapFeaturedSkill));
});

app.post("/api/featured-skills", (req, res) => {
  const body = req.body ?? {};
  const missing = validateFields(["title", "details"], body);
  if (missing.length) {
    res.status(400).json({ error: `Missing fields: ${missing.join(", ")}` });
    return;
  }
  const payload = {
    title: String(body.title).trim(),
    details: String(body.details).trim(),
  };
  try {
    const result = insertFeaturedSkill.run(payload);
    const row = db.prepare("SELECT * FROM featured_skills WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json(mapFeaturedSkill(row));
  } catch (error) {
    console.error("Failed to insert featured skill", error);
    res.status(500).json({ error: "Unable to save featured skill" });
  }
});

app.get("/api/hero", (req, res) => {
  const row = getHero.get();
  res.json(mapHero(row));
});

app.put("/api/hero", (req, res) => {
  const body = req.body ?? {};
  const missing = validateFields(["tagline", "headline", "subheading"], body);
  if (missing.length) {
    res.status(400).json({ error: `Missing fields: ${missing.join(", ")}` });
    return;
  }
  const badges = Array.isArray(body.badges) ? body.badges : splitLines(body.badges ?? "");
  const metricsInput = Array.isArray(body.metrics) ? body.metrics : splitLines(body.metrics ?? "");
  const metrics = metricsInput
    .map((entry) => {
      if (typeof entry === "string") return entry;
      if (entry && typeof entry === "object" && "value" in entry && "label" in entry) {
        return `${entry.value}|${entry.label}`;
      }
      return "";
    })
    .filter(Boolean);
  const payload = {
    tagline: String(body.tagline).trim(),
    headline: String(body.headline).trim(),
    subheading: String(body.subheading).trim(),
    badges: badges.join("\n"),
    metrics: metrics.join("\n"),
    primaryLabel: String(body.primaryLabel ?? body.primary_label ?? "").trim(),
    primaryUrl: String(body.primaryUrl ?? body.primary_url ?? "").trim(),
    secondaryLabel: String(body.secondaryLabel ?? body.secondary_label ?? "").trim(),
    secondaryUrl: String(body.secondaryUrl ?? body.secondary_url ?? "").trim(),
  };
  try {
    updateHero.run(payload);
    const row = getHero.get();
    res.json(mapHero(row));
  } catch (error) {
    console.error("Failed to update hero", error);
    res.status(500).json({ error: "Unable to update hero content" });
  }
});

app.delete("/api/content", (req, res) => {
  const requested = Array.isArray(req.body?.sections) && req.body.sections.length ? req.body.sections : [
    "hero",
    "about",
    "projects",
    "skills",
    "blogs",
    "certifications",
    "contacts",
  ];
  const cleared = [];
  requested.forEach((section) => {
    switch (section) {
      case "projects":
        deleteProjects.run();
        cleared.push("projects");
        break;
      case "skills":
        deleteSkills.run();
        cleared.push("skills");
        break;
      case "blogs":
        deleteBlogs.run();
        cleared.push("blogs");
        break;
      case "certifications":
        deleteCertifications.run();
        cleared.push("certifications");
        break;
      case "contacts":
        deleteFeaturedSkills.run();
        cleared.push("contacts");
        break;
      case "hero":
        clearHero.run();
        cleared.push("hero");
        break;
      case "about":
        clearAbout.run();
        cleared.push("about");
        break;
      default:
        break;
    }
  });
  res.json({ cleared });
});

app.listen(PORT, () => {
  console.log(`Portfolio API running on http://localhost:${PORT}`);
});
