import fs from "fs";
import path from "path";

export interface ServerSettings {
  senderEmail: string;
  senderEmailName: string;
  gmailAppPassword: string;
}

const CONFIG_PATH = path.join(process.cwd(), "server-config.json");

export function getServerSettings(): ServerSettings {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const data = fs.readFileSync(CONFIG_PATH, "utf-8");
      const parsed = JSON.parse(data);
      return {
        senderEmail: parsed.senderEmail || process.env.GMAIL_USER || "contact@ormasilver.com",
        senderEmailName: parsed.senderEmailName || process.env.GMAIL_SENDER_NAME || "ORMA للفضة 925",
        gmailAppPassword: (parsed.gmailAppPassword || process.env.GMAIL_APP_PASSWORD || "").replace(/\s+/g, ""),
      };
    }
  } catch (err) {
    console.warn("Failed to read server-config.json:", err);
  }

  return {
    senderEmail: process.env.GMAIL_USER || "contact@ormasilver.com",
    senderEmailName: process.env.GMAIL_SENDER_NAME || "ORMA للفضة 925",
    gmailAppPassword: (process.env.GMAIL_APP_PASSWORD || "").replace(/\s+/g, ""),
  };
}

export function saveServerSettings(newSettings: Partial<ServerSettings>): ServerSettings {
  try {
    const current = getServerSettings();
    const updated: ServerSettings = {
      senderEmail: newSettings.senderEmail || current.senderEmail,
      senderEmailName: newSettings.senderEmailName || current.senderEmailName,
      gmailAppPassword: (newSettings.gmailAppPassword !== undefined ? newSettings.gmailAppPassword : current.gmailAppPassword).replace(/\s+/g, ""),
    };
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(updated, null, 2), "utf-8");
    return updated;
  } catch (err) {
    console.error("Failed to write server-config.json:", err);
    return getServerSettings();
  }
}
