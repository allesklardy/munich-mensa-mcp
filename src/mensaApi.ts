import { dateToApiPath } from "./helper.js";

export interface MenuItem {
	name: string;
	price?: {
		students?: {
			basePrice: number;
			pricePerUnit: number;
			unit: string;
		};
		staff?: {
			basePrice: number;
			pricePerUnit: number;
			unit: string;
		};
		guests?: {
			basePrice: number;
			pricePerUnit: number;
			unit: string;
		};
	};
	category?: string;
	labels?: string[];
}

export interface DayMenu {
	date: string;
	facility: string;
	facilityName?: string;
	location?: string;
	menu: MenuItem[];
}

export interface MensaApiResponse {
	success: boolean;
	data?: DayMenu;
	error?: string;
}

/**
 * Fetches the menu for a specific mensa facility on a given date
 * @param apiName - The API name of the facility (e.g., "mensa-arcisstr")
 * @param date - Date in YYYY-MM-DD format (e.g., "2025-05-25")
 * @returns Promise with the menu data or error
 */
export async function getMensaMenu(apiName: string, date: string): Promise<MensaApiResponse> {
	try {
		// Validate date format
		if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
			return {
				success: false,
				error: "Invalid date format. Expected YYYY-MM-DD (e.g., 2025-05-25)"
			};
		}

		// Convert date to year and week for API path
		const { year, week } = dateToApiPath(date);
        console.log(`Fetching menu for ${apiName} on ${date} (year: ${year}, week: ${week})`);

		// The Studentenwerk München API endpoint using year/week format
		const baseUrl = "https://tum-dev.github.io/eat-api";
		const url = `${baseUrl}/${apiName}/${year}/${week}.json`;
        console.log(`Constructed URL: ${url}`);

		const response = await fetch(url);
		
		if (!response.ok) {
			if (response.status === 404) {
				return {
					success: false,
					error: `No menu found for ${apiName} in year ${year}, week ${week}. The facility might be closed or the week is too far in the future.`
				};
			}
			
			return {
				success: false,
				error: `HTTP error ${response.status}: ${response.statusText}`
			};
		}

		const data = await response.json() as any;
		
		// The API returns a week's worth of data as an array of days
		// Find the specific date in the days array
		const dayData = data.days?.find((day: any) => day.date === date);
		
		if (!dayData) {
			return {
				success: false,
				error: `No menu data found for date ${date} in year ${year}, week ${week}`
			};
		}

		// Transform the API response to our format
		const menu: MenuItem[] = dayData.dishes?.map((dish: any) => ({
			name: dish.name || "Unknown dish",
			price: dish.prices ? {
				students: dish.prices.students ? {
					basePrice: dish.prices.students.base_price || 0,
					pricePerUnit: dish.prices.students.price_per_unit || 0,
					unit: dish.prices.students.unit || ""
				} : undefined,
				staff: dish.prices.staff ? {
					basePrice: dish.prices.staff.base_price || 0,
					pricePerUnit: dish.prices.staff.price_per_unit || 0,
					unit: dish.prices.staff.unit || ""
				} : undefined,
				guests: dish.prices.guests ? {
					basePrice: dish.prices.guests.base_price || 0,
					pricePerUnit: dish.prices.guests.price_per_unit || 0,
					unit: dish.prices.guests.unit || ""
				} : undefined,
			} : undefined,
			category: dish.dish_type || undefined,
			labels: dish.labels || [],
		})) || [];

		return {
			success: true,
			data: {
				date,
				facility: apiName,
				menu
			}
		};

	} catch (error) {
		return {
			success: false,
			error: `Failed to fetch menu: ${error instanceof Error ? error.message : 'Unknown error'}`
		};
	}
}

/**
 * Gets the current date in YYYY-MM-DD format
 * @returns Current date string
 */
export function getCurrentDate(): string {
	return new Date().toISOString().split('T')[0];
}

/**
 * Validates if a date string is in the correct format and is a valid date
 * @param date - Date string to validate
 * @returns boolean indicating if the date is valid
 */
export function isValidDate(date: string): boolean {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
		return false;
	}
	
	const dateObj = new Date(date);
	return dateObj.toISOString().split('T')[0] === date;
}