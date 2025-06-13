/**
 * Gets the ISO week number for a given date
 * ISO week starts on Monday and the first week of the year contains January 4th
 * @param date - Date string in YYYY-MM-DD format or Date object
 * @returns Week number (1-53)
 */
export function getWeekNumber(date: string | Date): number {
	const targetDate = typeof date === 'string' ? new Date(date) : new Date(date);
	const tempDate = new Date(targetDate.valueOf());
	
	const dayNum = (tempDate.getDay() + 6) % 7;
	tempDate.setDate(tempDate.getDate() - dayNum + 3);
	
	const firstThursday = new Date(tempDate.getFullYear(), 0, 4);
	const weekNumber = 1 + Math.round(((tempDate.getTime() - firstThursday.getTime()) / 86400000 - 3 + (firstThursday.getDay() + 6) % 7) / 7);
	
	return weekNumber;
}

/**
 * Gets the current week number
 * @returns Current ISO week number
 */
export function getCurrentWeekNumber(): number {
	return getWeekNumber(new Date());
}

/**
 * Gets the year for a given date's ISO week
 * @param date - Date string in YYYY-MM-DD format or Date object
 * @returns Year of the ISO week
 */
export function getWeekYear(date: string | Date): number {
	const targetDate = typeof date === 'string' ? new Date(date) : new Date(date);
	const tempDate = new Date(targetDate.valueOf());
	
	const dayNum = (tempDate.getDay() + 6) % 7;
	tempDate.setDate(tempDate.getDate() - dayNum + 3);
	
	return tempDate.getFullYear();
}

/**
 * Converts a date to the year and week number for the API path
 * @param date - Date string in YYYY-MM-DD format
 * @returns Object with year and week number for API path
 */
export function dateToApiPath(date: string): { year: number, week: number } {
	const weekNumber = getWeekNumber(date);
	const year = getWeekYear(date);
	
	return { year, week: weekNumber };
}

/**
 * Converts a date to week format used by the API
 * @param date - Date string in YYYY-MM-DD format
 * @returns Week string in format "YYYY-WW" (e.g., "2025-24")
 */
export function dateToWeekFormat(date: string): string {
	const { year, week } = dateToApiPath(date);
	const paddedWeek = week.toString().padStart(2, '0');
	
	return `${year}-${paddedWeek}`;
}

/**
 * Gets the current week in API format
 * @returns Current week string in format "YYYY-WW"
 */
export function getCurrentWeek(): string {
	return dateToWeekFormat(new Date().toISOString().split('T')[0]);
}

/**
 * Validates if a date is within the current calendar week
 * @param date - Date string in YYYY-MM-DD format
 * @returns boolean indicating if the date is in current week
 */
export function isCurrentWeek(date: string): boolean {
	const currentWeek = getCurrentWeek();
	const dateWeek = dateToWeekFormat(date);
	return currentWeek === dateWeek;
}
