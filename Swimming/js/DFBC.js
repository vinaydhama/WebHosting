// decodeFirebaseConfig.js

import { encodedFirebaseConfig } from './FBC.js';

function decode(str) {
  return atob(str);
}

export const firebaseConfig = {
  apiKey: decode(encodedFirebaseConfig.apiKey),
  authDomain: decode(encodedFirebaseConfig.authDomain),
  projectId: decode(encodedFirebaseConfig.projectId),
  storageBucket: decode(encodedFirebaseConfig.storageBucket),
  messagingSenderId: decode(encodedFirebaseConfig.messagingSenderId),
  appId: decode(encodedFirebaseConfig.appId)
};