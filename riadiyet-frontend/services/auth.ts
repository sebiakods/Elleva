import { api } from "./api";


export type UserRole =
  | "ADMIN"
  | "ENTREPRENEUR"
  | "EXPERT"
  | "INSTITUTION";



export interface User {

  id:string;
  email:string;
  name:string;
  role:UserRole;

  language?:string;
  avatarUrl?:string|null;
  bio?:string|null;
  isVerified?:boolean;

}



export interface LoginData {

  email:string;
  password:string;

}



export interface RegisterData {

  name:string;
  email:string;
  password:string;
  role:UserRole;

}



interface AuthPayload {

  user:User;
  accessToken:string;
  refreshToken?:string;

}



interface AuthResponse {

  success:boolean;
  message?:string;
  data:AuthPayload;

}



class AuthService {


async login(
  credentials:LoginData
):Promise<User>{


  const response =
    await api.post<AuthResponse>(
      "/auth/login",
      credentials
    );


  const {
    user,
    accessToken
  } = response.data;



  if(!accessToken){
    throw new Error(
      "TOKEN_MISSING"
    );
  }



  localStorage.setItem(
    "accessToken",
    accessToken
  );


  localStorage.setItem(
    "user",
    JSON.stringify(user)
  );


  return user;

}




async register(
 data:RegisterData
):Promise<User>{


 const response =
 await api.post<AuthResponse>(
   "/auth/register",
   data
 );


 const {
  user,
  accessToken
 } = response.data;



 localStorage.setItem(
   "accessToken",
   accessToken
 );


 localStorage.setItem(
   "user",
   JSON.stringify(user)
 );


 return user;

}




async logout():Promise<void>{


 try{

  await api.post(
    "/auth/logout"
  );

 }
 catch(err){

  console.warn(
    "Logout failed",
    err
  );

 }


 localStorage.removeItem(
   "accessToken"
 );


 localStorage.removeItem(
   "user"
 );


}





async getCurrentUser():Promise<User>{


 const response =
 await api.get<{
   success:boolean;
   data:User;
 }>(
   "/auth/me"
 );


 return response.data;

}




getUser():User|null{


 if(typeof window==="undefined")
 return null;



 const stored =
 localStorage.getItem(
   "user"
 );


 if(!stored)
 return null;



 try{

  return JSON.parse(
    stored
  );

 }
 catch{

  return null;

 }

}




getToken(){

 if(typeof window==="undefined")
 return null;


 return localStorage.getItem(
   "accessToken"
 );

}




isAuthenticated(){

 return !!this.getToken();

}



isAdmin(){

 return this.getUser()?.role==="ADMIN";

}


isExpert(){

 return this.getUser()?.role==="EXPERT";

}


isInstitution(){

 return this.getUser()?.role==="INSTITUTION";

}


isEntrepreneur(){

 return this.getUser()?.role==="ENTREPRENEUR";

}



}



const authService =
 new AuthService();


export default authService;
export {authService};