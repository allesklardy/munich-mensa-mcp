export interface Facility {
	name: string;
	location: string;
	apiName: string;
	coordinates?: {
		latitude: number;
		longitude: number;
	};
	openHours?: {
		[key: string]: {
			start: string;
			end: string;
		};
	};
	queueStatus?: string | null;
}

export interface CanteenApiResponse {
	enum_name: string;
	name: string;
	location: {
		address: string;
		latitude: number;
		longitude: number;
	};
	canteen_id: string;
	queue_status: string | null;
	open_hours: {
		[key: string]: {
			start: string;
			end: string;
		};
	};
}

/**
 * Fetches the list of all facilities from the API
 * @returns Promise with facilities data or throws error
 */
export async function fetchFacilities(): Promise<Facility[]> {
	try {
		const response = await fetch('https://tum-dev.github.io/eat-api/enums/canteens.json');
		
		if (!response.ok) {
			throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
		}

		const data = await response.json() as CanteenApiResponse[];
		
		return data.map(canteen => ({
			name: canteen.name,
			location: canteen.location.address,
			apiName: canteen.canteen_id,
			coordinates: {
				latitude: canteen.location.latitude,
				longitude: canteen.location.longitude
			},
			openHours: canteen.open_hours,
			queueStatus: canteen.queue_status
		}));

	} catch (error) {
		throw new Error(`Failed to fetch facilities: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}

// Cached facilities to avoid repeated API calls
let cachedFacilities: Facility[] | null = null;

/**
 * Gets facilities with caching
 * @returns Promise with facilities data
 */
export async function getFacilities(): Promise<Facility[]> {
	if (cachedFacilities === null) {
		cachedFacilities = await fetchFacilities();
	}
	return cachedFacilities;
}
