import axios from "../axios";

export async function getDepartments(
  search: string,
  page: number,
  limit: number,
  sort: string
) {
  const response = await axios.get(
    `/hospital/departments?search=${search}&page=${page}&limit=${limit}&sort=${sort}`
  );
  if (response.data) {
    return response.data;
  } else {
    throw new Error("API connection error - Invalid response");
  }
}

export async function createDepartment(name: string, color: string) {
  const response = await axios.post("/hospital/department", {
    name,
    color,
  });
  if (response.data) {
    return response.data;
  } else {
    throw new Error("API connection error - Invalid response");
  }
}
