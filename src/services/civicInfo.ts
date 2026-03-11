import { Representative } from '../types';

const API_BASE_URL = 'http://localhost:3000';

export async function getRepresentativesByZip(zipCode: string, street?: string): Promise<{ senators: Representative[], houseReps: Representative[], state: string, hasSpecificDistrict: boolean }> {
  try {
    const url = new URL(`${API_BASE_URL}/api/representatives`);
    url.searchParams.set('zip', zipCode);
    if (street) {
      url.searchParams.set('street', street);
    }
    const response = await fetch(url.toString());

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch representatives');
    }

    const data = await response.json();

    return {
      senators: data.senators,
      houseReps: data.houseReps,
      state: data.state,
      hasSpecificDistrict: data.hasSpecificDistrict
    };
  } catch (error) {
    console.error('Error fetching representatives:', error);
    throw error;
  }
}
