export interface ParsedMultipart {
  fields: Record<string, string>;
  files: Record<string, { filename?: string; type?: string; data: Buffer }>;
}

export async function parseMultipartBody(event: any): Promise<ParsedMultipart> {
  const parts = await readMultipartFormData(event);

  const fields: Record<string, string> = {};
  const files: Record<
    string,
    { filename?: string; type?: string; data: Buffer }
  > = {};

  if (!parts) return { fields, files };

  for (const part of parts) {
    if (!part.name) continue;

    if (part.filename) {
      files[part.name] = {
        filename: part.filename,
        type: part.type,
        data: part.data,
      };
    } else {
      fields[part.name] = part.data.toString("utf-8");
    }
  }

  return { fields, files };
}
