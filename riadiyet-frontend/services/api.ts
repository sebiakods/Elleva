const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";


export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
}


async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;


  const headers = new Headers(
    options.headers || {}
  );


  headers.set(
    "Content-Type",
    "application/json"
  );


  if(token){
    headers.set(
      "Authorization",
      `Bearer ${token}`
    );
  }


  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers,
      credentials:"include",
    }
  );


  const data = await response.json();


  if(!response.ok){
    throw new Error(
      data.message || "Request failed"
    );
  }


  return data as T;
}



export const api = {

  get:<T>(endpoint:string)=>
    request<T>(
      endpoint,
      {
        method:"GET",
      }
    ),



  post:<T>(
    endpoint:string,
    body?:unknown
  )=>
    request<T>(
      endpoint,
      {
        method:"POST",
        body:JSON.stringify(body),
      }
    ),



  put:<T>(
    endpoint:string,
    body?:unknown
  )=>
    request<T>(
      endpoint,
      {
        method:"PUT",
        body:JSON.stringify(body),
      }
    ),



  patch:<T>(
    endpoint:string,
    body?:unknown
  )=>
    request<T>(
      endpoint,
      {
        method:"PATCH",
        body:JSON.stringify(body),
      }
    ),



  delete:<T>(endpoint:string)=>
    request<T>(
      endpoint,
      {
        method:"DELETE",
      }
    ),

};