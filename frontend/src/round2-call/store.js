import { syncedStore, getYjsDoc } from "@syncedstore/core";
import { WebrtcProvider } from "y-webrtc";

//For output component
// Create your SyncedStore store
export const store = syncedStore({ output: [], });

// Create a document that syncs automatically using Y-WebRTC
const doc = getYjsDoc(store);
// const langDoc = getYjsDoc()
export const webrtcProvider = new WebrtcProvider("output_room", doc);

export const disconnect = () => webrtcProvider.disconnect();
export const connect = () => webrtcProvider.connect();