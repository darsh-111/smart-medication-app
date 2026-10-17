import * as SecureStore from 'expo-secure-store';
const key='smart.medication.session.v1';
let queue:Promise<unknown>=Promise.resolve();
function serial<T>(action:()=>Promise<T>):Promise<T>{const next=queue.catch(()=>{}).then(action);queue=next;return next;}
export const readSession=()=>serial(()=>SecureStore.getItemAsync(key));
export const writeSession=(value:string)=>serial(()=>SecureStore.setItemAsync(key,value,{keychainAccessible:SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY}));
export const deleteSession=()=>serial(()=>SecureStore.deleteItemAsync(key));
export const sessionStorageLabel:'device'|'tab'='device';
