import { Candidate } from './types';

// The source of truth for candidate information
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRepxomgRBDE_pqjpyVhc9oFs9usT02D8CkJRAvdX0hGpZkd2EnXgVRrK1iZFza3yXUGCOtgLTzXt3j/pub?output=csv';

/**
 * Removes non-numeric characters from a string to normalize phone numbers for lookup.
 */
export const normalizePhone = (phone: string): string => phone.replace(/\D/g, '');

/**
 * Checks if a string contains a valid number of digits for a phone number.
 */
export const isLikelyPhoneNumber = (text: string): boolean => {
  const digits = normalizePhone(text);
  return digits.length >= 10 && digits.length <= 13;
};

/**
 * Fetches and parses candidate data from the published Google Sheet.
 */
export async function fetchSheetData(): Promise<Candidate[]> {
  try {
    const response = await fetch(SHEET_CSV_URL);
    if (!response.ok) throw new Error('Failed to fetch spreadsheet data');
    const csvText = await response.text();
    
    const rows = csvText.split('\n').map(row => 
      row.split(',').map(cell => cell.replace(/^"|"$/g, '').trim())
    );
    
    if (rows.length < 2) return [];
    
    const headers = rows[0].map(h => h.toLowerCase());
    return rows.slice(1).map(row => {
      const c: any = {
        name: '',
        phone: '',
        status: '',
        position: '',
        interviewDate: ''
      };
      headers.forEach((h, i) => {
        if (h.includes('name')) c.name = row[i];
        else if (h.includes('phone') || h.includes('contact')) c.phone = normalizePhone(row[i] || '');
        else if (h.includes('status')) c.status = row[i];
        else if (h.includes('position')) c.position = row[i];
        else if (h.includes('date')) c.interviewDate = row[i];
      });
      return c as Candidate;
    }).filter(c => c.phone);
  } catch (e) {
    console.error("Sheet Fetch Error:", e);
    return [];
  }
}
