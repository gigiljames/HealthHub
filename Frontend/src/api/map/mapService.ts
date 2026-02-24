import type { AxiosResponse } from "axios";
import axios from "axios";

function handleAxiosResponse(response: AxiosResponse, service: string) {
  if (response.data) {
    return response.data;
  } else {
    throw new Error(`API connection error: Invalid response - ${service}`);
  }
}

export async function getSearchSuggestions(
  text: string,
  signal: AbortSignal
): Promise<any> {
  const response = await axios.get(
    `https://api.geoapify.com/v1/geocode/search?text=${text}&apiKey=${import.meta.env.VITE_GEOAPIFY_API_KEY}`,
    { signal }
  );
  return handleAxiosResponse(response, "GET_SEARCH_SUGGESTIONS");
}
