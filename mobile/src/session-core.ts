import type { AuthResponse } from './api';
export type SavedSession={version:1;origin:string;expiresAt:number;auth:AuthResponse};
export function sessionToSave(auth:AuthResponse,origin:string,now=Date.now()):SavedSession {
  if(auth.role!=='patient' || !Number.isFinite(auth.expiresIn) || auth.expiresIn<=0 || auth.expiresIn>86400)throw new Error('Invalid session');
  return {version:1,origin,expiresAt:now+auth.expiresIn*1000,auth:{accessToken:auth.accessToken,tokenType:auth.tokenType,expiresIn:auth.expiresIn,userId:auth.userId,role:'patient'}};
}
export function readSavedSession(raw:string|null,origin:string,now=Date.now()):SavedSession|null {
  try{const value=JSON.parse(raw || 'null');
    if(value?.version!==1 || value.origin!==origin || !Number.isFinite(value.expiresAt) || value.expiresAt<=now || value.expiresAt>now+86400000 || value.auth?.role!=='patient' || typeof value.auth.accessToken!=='string' || value.auth.accessToken.length<20 || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.auth.userId))return null;
    return {version:1,origin,expiresAt:value.expiresAt,auth:{accessToken:value.auth.accessToken,tokenType:'Bearer',expiresIn:Math.ceil((value.expiresAt-now)/1000),userId:value.auth.userId,role:'patient'}};
  }catch{return null;}
}
