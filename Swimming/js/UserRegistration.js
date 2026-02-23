

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

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
const storage = getStorage(app);

function generateSwimmerID(name, dob, gender) {
  const date = new Date(dob);
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const dobShort = `${yy}${mm}${dd}`;

  // Convert DOB to base36 for compactness
  const dobEncoded = parseInt(dobShort).toString(36).toUpperCase();

  // Use first 3 letters of name, uppercase
  const nameCode = name.replace(/\s+/g, '').substring(0, 3).toUpperCase();

  const genderCode = gender === "1" ? 'M' : gender === "2" ? 'F' : 'O';

  // Add a short random suffix
  const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();

  return `SWM-${nameCode}${genderCode}${dobEncoded}-${randomSuffix}`;
}

function decodeSwimmerID(swimmerID) {
  const parts = swimmerID.split('-');
  if (parts.length !== 3 || !parts[0].startsWith('SWM')) {
    return { error: "Invalid swimmer ID format" };
  }

  const encoded = parts[1]; // e.g., "VINF1L5D"
  const nameCode = encoded.slice(0, 3); // First 3 letters of name
  const genderCode = encoded[3];        // M, F, or O
  const dobEncoded = encoded.slice(4);  // Encoded DOB in base36

  // Decode DOB
  const dobNum = parseInt(dobEncoded, 36);
  const dobStr = dobNum.toString().padStart(6, '0'); // e.g., "250813"
  const dob = `20${dobStr.slice(0, 2)}-${dobStr.slice(2, 4)}-${dobStr.slice(4, 6)}`;

  const gender = genderCode === 'M' ? 'Male' : genderCode === 'F' ? 'Female' : 'Other';

  return {
    nameHint: nameCode,
    gender,
    dob
  };
}

async function isDuplicateName(name) {
  const swimmersRef = collection(db, "swimmers");
  const nameq = query(swimmersRef,
    where("name", "==", name)    
  );
  const querySnapshot = await getDocs(nameq);
  return !querySnapshot.empty;
}

async function isDuplicateSwimmer( dob, gender) {
  const swimmersRef = collection(db, "swimmers");
  const q = query(swimmersRef,
    where("name", "==", name),
    where("dob", "==", dob),
    where("gender", "==", parseInt(gender))
  );
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
}

// import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

async function cropImage(pathToStore, photoProgress) {
  if (!cropper) return null;

  const canvas = cropper.getCroppedCanvas({
    width: 300,
    height: 300,
  });

  // Wrap canvas.toBlob in a Promise
  const blob = await new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });

  // Upload the blob and return the download URL
  const downloadURL = await uploadFile(blob, pathToStore, photoProgress);
  return downloadURL;
}





window.cropImage= cropImage();

async function uploadFile(file, pathPrefix, progressElementId) {
  return new Promise((resolve, reject) => {
    let FileName= 'Profile_Img' + Date.now() + '.png';
    if (file.name)
      {
        FileName=  file.name;
      }
      // else{
      //   FileName = document.getElementById("photoFile").files[0];
      // }

    const storageRef = ref(storage, `${pathPrefix}/${FileName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    const progressBar = document.getElementById(progressElementId);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        progressBar.value = progress;
      },
      (error) => reject(error),
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(resolve).catch(reject);
      }
    );
  });
}

async function encodePassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registrationForm");
  // form.addEventListener("submit", registerSwimmer);
  const sidebar= document.getElementById('sidebar');
  if (sidebar)
    {
      toggleSidebar();
    }
  ClearAllPop();
  // ShowActivitypop("Fetching Events");
  // showhideDiv(false,"MessagePop");
  // showhideDiv(false,"ActivityPop");
});


window.registerSwimmer =async function (event) {
  ShowActivitypop("Verifying Credentials");
  console.log("Register function called");
  event.preventDefault();

  const name = document.getElementById("name").value;
  const dob = document.getElementById("dob").value;
  const gender = document.getElementById("gender").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;
  const photoFile = document.getElementById("photoFile").files[0];
  const id1File = document.getElementById("id1File").files[0];
  const id2File = document.getElementById("id2File").files[0];  
  const schoolname = document.getElementById("schoolname").value;
  const clubname = document.getElementById("clubname").value;

  const confirmPassword = document.getElementById("confirmPassword").value;

  if (password !== confirmPassword) {
    
    ShowMessagepop("Passwords do not match with Confirm Password, Re-enter the password." )
    
    // alert("Passwords do not match.");
    return;
  }

  if (!photoFile || !id1File || !id2File) {
    
    ShowMessagepop("Please upload all required files, if you wish to Add Documents Later you can proceed" );
    // alert("Please upload all required files.");
    // return;
  }
  
  const duplicateName = await isDuplicateName(name);
  if (duplicateName) {   
    
    ShowMessagepop("User Name '"+ name + "' Already exists please try with other Name  (you may can swap initial and name)" );
    return;
  }

  const duplicate = await isDuplicateSwimmer(name, dob, gender);
  if (duplicate) {
    
    ShowMessagepop("User Name '"+ name + "' DOB '"+ dob + "' Gender '"+ gender +     "' Already exists Try to recover password if you dont remember" );
    // alert("Duplicate registration detected.");
    return;
  }
  const swimmer_id = generateSwimmerID(dob, gender);
  const encodedPassword = await encodePassword(password);

  try {
    
    ShowActivitypop("Uploading Documents...");
    // const photoPath = await uploadFile(photoFile, `photos/${swimmer_id}`, "photoProgress");      
    let photoPath="";
    
    let id1Path="";
    let id2Path="";

    if (photoFile)
      {
    photoPath = await cropImage( `photos/${swimmer_id}`, "photoProgress");
      }
      if (id1File)
        {
     id1Path = await uploadFile(id1File, `ids/${swimmer_id}/id1`, "id1Progress");
        }
        if (id2File)
          {
     id2Path = await uploadFile(id2File, `ids/${swimmer_id}/id2`, "id2Progress");
          }

    // const photoPath = "";
    // const id1Path = "";
    // const id2Path = "";

    const swimmer = {
      swimmer_id,
      name,
      dob,
      schoolname,
      clubname,
      gender: parseInt(gender),
      email,
      phone,
      password: encodedPassword,
      role: parseInt(role),
      photoPath,
      id1Path,
      id2Path
    };
    
    ShowActivitypop("Completing registration");

    await addDoc(collection(db, "swimmers"), swimmer);
    
    ShowMessagepop(" CONGRAJULATIONS!!! Swimmer registered successfully! use ID: "+swimmer_id + " For Login");
    // alert("Swimmer registered successfully! use ID: "+swimmer_id + " For Login" );
    document.getElementById("registrationForm").reset();
  } catch (e) {
    console.error("Error registering swimmer:", e);
    
    ShowMessagepop(" Registration failed. Try after sometime or contact Help desk");

    // alert("Registration failed.");
  }
};

window.EditSwimmer= async function (event) {
  let userinfo = ReadSessionData('user');

  
  ShowActivitypop("Verifying Credentials");
  console.log("Register function called");
  event.preventDefault();

  const name = document.getElementById("name").value;
  const dob = document.getElementById("dob").value;
  const gender = document.getElementById("gender").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;
      let photoPath;
      let id1Path;
      let id2Path;

  
  // const id1File = document.getElementById("id1File").files[0];
  // const id2File = document.getElementById("id2File").files[0];  
  const schoolname = document.getElementById("schoolname").value;
  const clubname = document.getElementById("clubname").value;

  const confirmPassword = document.getElementById("confirmPassword").value;
  let encodedPassword ="";
  if (confirmPassword=="")
    {
      encodedPassword= userinfo.password;
    }
    else
    {

  if (password !== confirmPassword) {
    
    ShowMessagepop("Passwords do not match with Confirm Password, Re-enter the password." )
    
    // alert("Passwords do not match.");
    return;
  }
  else{
      encodedPassword = await encodePassword(password);

  }
}

  // if (!photoFile || !id1File || !id2File) {
  //   
  //   ShowMessagepop("Please upload all required files." );
  //   // alert("Please upload all required files.");
  //   return;
  // }
  // To be done ENSURE NO DUPLICATE NAMES OTHERTHAN SAME DOC ITSELF
  // const duplicateName = await isDuplicateName(name);
  // if (duplicateName) {    
  //   
  //   ShowMessagepop("User Name "+ name + "Already exists please try with other Name you (may can swap initial and name)" );
  //   return;
  // }

  const duplicate = await isDuplicateSwimmer(name, dob, gender);
  if (duplicate) {
    
    ShowMessagepop("User Name "+ name + " DOB "+ dob + " Gender "+ gender +     "Already exists Try to recover password if you dont remember" );
    // alert("Duplicate registration detected.");
    return;
  }
  const swimmer_id = userinfo.swimmer_id;
  
  try {
    
    ShowActivitypop("Uploading Documents...");


    let photoFile="";
  if ( (document.getElementById("photoFile").files.length == 0 ) )
    {

      if (userinfo.photoFile === undefined)
        {
      photoPath ="";
        }
        else
        {
      photoPath =userinfo.photoFile;

        }
    }
    else
    {
      photoFile= document.getElementById("photoFile").files[0];
     photoPath = await cropImage(`photos/${swimmer_id}`, "photoProgress")
    }

    let id1File="";
  if ( document.getElementById("id1File").files.length == 0)
    {
      if (userinfo.id1File === undefined)
        {
          id1Path ="";
        }
        else
        {
      id1Path =userinfo.id1File;
        }
    }
    else
    {
    id1File= document.getElementById("id1File").files[0];

     id1Path = await uploadFile(id1File, `ids/${swimmer_id}/id1`, "id1Progress");

    }


    let id2File="";
  if ( document.getElementById("id2File").files.length == 0)
    {
      if (userinfo.id2File === undefined)
        {
          id2Path ="";
        }
        else
        {
          id2Path =userinfo.id1File;

        }
      ;
    }
    else
    {
      id2File= document.getElementById("id2File").files[0];

      id2Path = await uploadFile(id2File, `ids/${swimmer_id}/id2`, "id2Progress");

    }

    const swimmer = {
      swimmer_id,
      name,
      dob,
      schoolname,
      clubname,
      gender: parseInt(gender),
      email,
      phone,
      password: encodedPassword,
      role: parseInt(role),
      photoPath,
      id1Path,
      id2Path
    };
    
    
    ShowActivitypop("Completing update");

    const q = query(collection(db, "swimmers"),
      where("swimmer_id", "==", swimmer_id)      
    );
  
    const snapshot = await getDocs(q);
  
    const userDoc = snapshot.docs[0];
    const userRef = doc(db, "swimmers", userDoc.id);
  
    await updateDoc(userRef, { 'dob':dob,
    'schoolname':schoolname,
    'clubname':clubname,
    'gender': parseInt(gender),
    'email':email,
    'phone':phone,
    'password': encodedPassword,
    'role': parseInt(role),
    'photoPath':photoPath,
    'id1Path':id1Path,
    'id2Path':id2Path });

    // const userdata= userDoc.data(); 
    ShowMessagepop("Hello "  + swimmer.name +  ", Profile Update successful.");
    userUpdated= JSON.stringify(swimmer);
  sessionStorage.setItem("swimmerData",userUpdated );
  UpdateProfilePage(userUpdated);
  } catch (e) {
    console.error("Error registering swimmer:", e);
    ShowMessagepop(" Registration failed. Try after sometime or contact Help desk");
  }
};
