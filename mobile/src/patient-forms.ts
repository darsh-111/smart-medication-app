import type { PersonalMedicationInput } from './api';
export function normalizeDigits(value:string){return value.replace(/[٠-٩]/g,c=>String(c.charCodeAt(0)-1632)).replace(/[۰-۹]/g,c=>String(c.charCodeAt(0)-1776));}
export function validDay(value:string){return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0,10)===value;}
export function validatePersonalMedication(input:PersonalMedicationInput):'name'|'dosage'|'dates'|'times'|'days'|null {
 if(!input.drugName.trim() || input.drugName.length>150)return 'name';
 if(!input.dosage.trim() || input.dosage.length>150)return 'dosage';
 if(!validDay(input.startDate) || (input.endDate && (!validDay(input.endDate) || input.endDate<input.startDate)))return 'dates';
 if(input.frequency!=='as_needed' && (!input.times.length || input.times.length>12 || new Set(input.times).size!==input.times.length || input.times.some(time=>!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))))return 'times';
 if(input.frequency==='specific_days' && (!input.days.length || input.days.some(day=>day<1||day>7)))return 'days';
 return null;
}
