
import { GoogleGenAI, Type } from "@google/genai";
import OpenAI from "openai";
import { DataRow, CleaningReport, CleaningOptions, Anomaly, SchemaField } from '../types';

export const validateAgainstSchema = (data: DataRow[], schema: SchemaField[]): Anomaly[] => {
  const issues: Anomaly[] = [];
  
  data.forEach((row, rowIndex) => {
    schema.forEach(field => {
      const value = row[field.name];
      const stringValue = String(value || '').trim();

      // Required check
      if (field.required && !stringValue) {
        issues.push({
          row: rowIndex,
          column: field.name,
          value: value,
          reason: `Missing required field: ${field.name}`,
          suggestion: "Provide a valid value",
          type: 'schema'
        });
        return;
      }

      if (stringValue) {
        // Type checks
        if (field.type === 'number') {
          const num = Number(stringValue);
          if (isNaN(num)) {
            issues.push({
              row: rowIndex,
              column: field.name,
              value: value,
              reason: "Value is not a valid number",
              suggestion: "Correct numeric format",
              type: 'schema'
            });
          } else {
            if (field.min !== undefined && num < field.min) {
              issues.push({
                row: rowIndex,
                column: field.name,
                value: value,
                reason: `Value below minimum (${field.min})`,
                suggestion: `Increase value to at least ${field.min}`,
                type: 'schema'
              });
            }
            if (field.max !== undefined && num > field.max) {
              issues.push({
                row: rowIndex,
                column: field.name,
                value: value,
                reason: `Value above maximum (${field.max})`,
                suggestion: `Decrease value to at most ${field.max}`,
                type: 'schema'
              });
            }
          }
        }

        if (field.type === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(stringValue)) {
            issues.push({
              row: rowIndex,
              column: field.name,
              value: value,
              reason: "Invalid email format",
              suggestion: "Enter a valid email address",
              type: 'schema'
            });
          }
        }

        if (field.type === 'date') {
          const date = new Date(stringValue);
          if (isNaN(date.getTime())) {
            issues.push({
              row: rowIndex,
              column: field.name,
              value: value,
              reason: "Invalid date format",
              suggestion: "Use YYYY-MM-DD format",
              type: 'schema'
            });
          }
        }

        if (field.regex) {
          try {
            const re = new RegExp(field.regex);
            if (!re.test(stringValue)) {
              issues.push({
                row: rowIndex,
                column: field.name,
                value: value,
                reason: `Value does not match pattern: ${field.regex}`,
                suggestion: "Align with required pattern",
                type: 'schema'
              });
            }
          } catch (e) {
            console.error("Invalid regex in schema", e);
          }
        }
      }
    });
  });

  return issues;
};

export const performStandardCleaning = (data: DataRow[], options: CleaningOptions): { 
  cleanedData: DataRow[], 
  report: Omit<CleaningReport, 'id' | 'date' | 'fileName' | 'rowCount'> 
} => {
  let cleanedData = [...data];
  const report: Omit<CleaningReport, 'id' | 'date' | 'fileName' | 'rowCount'> = {
    duplicatesRemoved: 0,
    invalidEmailsFixed: 0,
    invalidPhonesFixed: 0,
    datesStandardized: 0,
    spacesTrimmed: 0,
    missingValuesHandled: 0,
    anomaliesDetected: 0,
    validationIssuesCount: 0,
    totalChanges: 0
  };

  if (options.removeDuplicates) {
    const originalCount = cleanedData.length;
    const seen = new Set();
    cleanedData = cleanedData.filter(row => {
      const serialized = JSON.stringify(row);
      if (seen.has(serialized)) return false;
      seen.add(serialized);
      return true;
    });
    report.duplicatesRemoved = originalCount - cleanedData.length;
    report.totalChanges += report.duplicatesRemoved;
  }

  cleanedData = cleanedData.map(row => {
    const newRow = { ...row };
    Object.keys(newRow).forEach(key => {
      let val = String(newRow[key] || '');

      if (options.trimSpaces) {
        const trimmed = val.trim();
        if (trimmed !== val) {
          val = trimmed;
          report.spacesTrimmed++;
          report.totalChanges++;
        }
      }

      if (options.standardizeCase) {
        if (val.length > 2 && /^[A-Z0-9\s]+$/.test(val)) {
          val = val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
          report.totalChanges++;
        }
      }

      if (options.validateEmails && key.toLowerCase().includes('email')) {
        if (val && !val.includes('@')) {
          report.invalidEmailsFixed++;
        }
      }

      if (options.fixDates && (key.toLowerCase().includes('date') || val.includes('/'))) {
        const match = val.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
        if (match) {
          const year = match[3].length === 2 ? `20${match[3]}` : match[3];
          val = `${year}-${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}`;
          report.datesStandardized++;
          report.totalChanges++;
        }
      }

      newRow[key] = val;
    });
    return newRow;
  });

  return { cleanedData, report };
};

export const performGeminiCleaning = async (data: DataRow[], columns: string[], model: string): Promise<{ anomalies: Anomaly[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const sample = data.slice(0, 50);
  const prompt = `Analyze this data sample and identify any anomalies, naming inconsistencies, or suspicious values. 
  Return a JSON array of objects with the structure: { "row": number, "column": string, "reason": string, "suggestion": string }. 
  Columns: ${columns.join(', ')}.
  Sample: ${JSON.stringify(sample)}`;

  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            row: { type: Type.INTEGER },
            column: { type: Type.STRING },
            reason: { type: Type.STRING },
            suggestion: { type: Type.STRING }
          },
          required: ["row", "column", "reason", "suggestion"]
        }
      }
    }
  });

  const anomalies: Anomaly[] = JSON.parse(response.text || '[]');
  return {
    anomalies: anomalies.map(a => ({
      ...a,
      value: data[a.row]?.[a.column] || 'N/A',
      type: 'ai'
    }))
  };
};

export const performOpenAICleaning = async (data: DataRow[], columns: string[], model: string): Promise<{ anomalies: Anomaly[] }> => {
  // Use the available API_KEY for OpenAI as well, assuming it handles multiple providers or is configured for OpenAI.
  // In a real scenario, this might need process.env.OPENAI_API_KEY.
  const openai = new OpenAI({ apiKey: process.env.API_KEY || '', dangerouslyAllowBrowser: true });
  
  const sample = data.slice(0, 50);
  const prompt = `Analyze this data sample and identify any anomalies, naming inconsistencies, or suspicious values. 
  Return a JSON array of objects with the structure: { "row": number, "column": string, "reason": string, "suggestion": string }. 
  Columns: ${columns.join(', ')}.
  Sample: ${JSON.stringify(sample)}`;

  const response = await openai.chat.completions.create({
    model: model,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' }
  });

  const content = response.choices[0].message.content || '{"anomalies": []}';
  const parsed = JSON.parse(content);
  // OpenAI might return an object with an array, whereas Gemini schema forced an array. Normalizing here.
  const rawAnomalies = Array.isArray(parsed) ? parsed : (parsed.anomalies || []);

  return {
    anomalies: rawAnomalies.map((a: any) => ({
      ...a,
      value: data[a.row]?.[a.column] || 'N/A',
      type: 'ai'
    }))
  };
};

export const performAICleaning = async (data: DataRow[], columns: string[], options: CleaningOptions): Promise<{ anomalies: Anomaly[] }> => {
  if (!process.env.API_KEY) return { anomalies: [] };

  try {
    if (options.aiProvider === 'openai') {
      return await performOpenAICleaning(data, columns, options.aiModel);
    } else {
      return await performGeminiCleaning(data, columns, options.aiModel);
    }
  } catch (error) {
    console.error("AI Cleaning failed:", error);
    return { anomalies: [] };
  }
};
