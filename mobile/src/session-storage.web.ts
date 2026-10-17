const key='smart.medication.session.v1';
export async function readSession(){return globalThis.sessionStorage.getItem(key);}
export async function writeSession(value:string){globalThis.sessionStorage.setItem(key,value);}
export async function deleteSession(){globalThis.sessionStorage.removeItem(key);}
export const sessionStorageLabel:'device'|'tab'='tab';
