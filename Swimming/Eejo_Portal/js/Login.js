import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

import { firebaseConfig } from "./DFBC.js";

// const firebaseConfig = {
//   apiKey: "AIzaSyAHqPVFfpZeIkfp3A1OiMEezo4YLHukqaE",
//   authDomain: "riviera-certificates-test.firebaseapp.com",
//   projectId: "riviera-certificates-test",
//   storageBucket: "riviera-certificates-test.appspot.com",
//   messagingSenderId: "651682049198",
//   appId: "1:651682049198:web:4b956063884b86d50bd13f"
// };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
  const sidebar= document.getElementById('sidebar');
  if (sidebar)
    {
      toggleSidebar();
    }
  ClearAllPop();
});

async function encodePassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

window.loginUser = async function(event) {
  event.preventDefault();  
  ShowActivitypop("Verifying Credentials");

  const swimmerID = document.getElementById("swimmerID").value;
  const password = document.getElementById("password").value;
  const encodedPassword = await encodePassword(password);

  const q = query(collection(db, "swimmers"), where("swimmer_id", "==", swimmerID));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    ShowMessagepop( "ID you entered is not found, try with valid ID." );
    return;
  }

  const userDoc = snapshot.docs[0];
  const userData = userDoc.data();

  if (userData.password !== encodedPassword) {
    ShowMessagepop( "Password entered is incorrect, Enter correct password." );
    return;
  }

  // Store session data
  sessionStorage.setItem("swimmerData", JSON.stringify(userData));
//  alert("Login successful!");
  window.location.href = "html/Home.html"; // Redirect to homepage
};

window.resetPassword = async function(event) {
  event.preventDefault();
  ShowActivitypop("Verifying Details");
  const name = document.getElementById("resetName").value;
  const dob = document.getElementById("resetDOB").value;
  const phone = document.getElementById("resetPhone").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmNewPassword = document.getElementById("confirmNewPassword").value;

  if (newPassword !== confirmNewPassword) {
    ShowMessagepop( "Passwords do not match with Confirm Password, Re-enter the password." )
    return;
  }

  const encodedNewPassword = await encodePassword(newPassword);
  const q = query(collection(db, "swimmers"),
    where("name", "==", name),
    where("dob", "==", dob),
    where("phone", "==", phone)
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    ShowMessagepop( "Details Entered is not matching, try with valid Details." );
    return;
  }

  const userDoc = snapshot.docs[0];
  const userRef = doc(db, "swimmers", userDoc.id);
  const userdata= userDoc.data();

  await updateDoc(userRef, { password: encodedNewPassword });
  ShowMessagepop( "Hello '"  + userdata.name +  "', Password reset successful. You can now start using portal by login ID :"+userdata.swimmer_id);
};

window.toggleResetForm = function() {
    const container = document.getElementById("resetContainer");
    container.style.display = container.style.display === "none" ? "block" : "none";
  }; 