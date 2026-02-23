 
    // --- 1) Import Firebase (modular) ---
    import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
    import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
    import {
      getStorage, ref, uploadBytesResumable, getDownloadURL,
      updateMetadata
    } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

    // --- 2) Your Firebase configuration (replace with your own from Firebase Console) ---
    // const firebaseConfig = {
    //   apiKey: "YOUR_API_KEY",
    //   authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    //   projectId: "YOUR_PROJECT_ID",
    //   storageBucket: "YOUR_PROJECT_ID.appspot.com",
    //   messagingSenderId: "YOUR_SENDER_ID",
    //   appId: "YOUR_APP_ID"
    // };
import { firebaseConfig } from "./DFBC.js";

    // --- 3) Initialize Firebase ---
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const storage = getStorage(app);

    // --- 4) Optional: Anonymous auth to satisfy rules (recommended for demos) ---
    // In production, use your real auth (Google, Email/Password, etc.).
    signInAnonymously(auth).catch((error) => {
      console.error("Anonymous auth failed:", error);
    });

    // --- 5) DOM elements ---
    const pdfInput = document.getElementById('pdfFile');
    const btnUpload = document.getElementById('btnUpload');
    const statusEl = document.getElementById('status');
    const progressWrap = document.getElementById('progress-wrap');
    const progressEl = document.getElementById('progress');
    const pctEl = document.getElementById('pct');
    const resultEl = document.getElementById('result');

    let selectedFile = null;
    let currentUser = null;

    onAuthStateChanged(auth, (user) => {
      currentUser = user || null;
      // You can reflect auth state in UI if needed
      console.log("Auth state:", currentUser ? "signed-in" : "signed-out");
    });

    // --- 6) File selection handler ---
    pdfInput.addEventListener('change', () => {
      resultEl.innerHTML = '';
      statusEl.className = 'muted';
      statusEl.textContent = 'Choose a PDF to enable upload.';

      const f = pdfInput.files && pdfInput.files[0];
      if (!f) {
        selectedFile = null;
        btnUpload.disabled = true;
        return;
      }
      if (f.type !== 'application/pdf') {
        selectedFile = null;
        btnUpload.disabled = true;
        statusEl.className = 'error';
        statusEl.textContent = 'Please select a valid PDF file.';
        return;
      }
      selectedFile = f;
      btnUpload.disabled = false;
      statusEl.className = 'muted';
      statusEl.textContent = `Ready to upload: ${f.name} (${(f.size/1024/1024).toFixed(2)} MB)`;
    });

    // --- 7) Upload handler using resumable upload ---
    btnUpload.addEventListener('click', async () => {
      if (!selectedFile) return;
      if (!currentUser) {
        statusEl.className = 'error';
        statusEl.textContent = 'Not authenticated. Please try again.';
        return;
      }

      // Suggested storage path: users/<uid>/pdfs/<timestamp>-<filename>
      const safeName = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const objectPath = `users/${currentUser.uid}/pdfs/${Date.now()}-${safeName}`;
      const storageRef = ref(storage, objectPath);

      // Ensure metadata enforces contentType = application/pdf
      const metadata = {
        contentType: 'application/pdf',
        customMetadata: {
          originalName: selectedFile.name
        }
      };

      try {
        // Start upload
        progressWrap.style.display = 'block';
        progressEl.value = 0; pctEl.textContent = '0%';
        statusEl.className = 'muted';
        statusEl.textContent = 'Uploading...';

        const task = uploadBytesResumable(storageRef, selectedFile, metadata);

        task.on('state_changed',
          (snapshot) => {
            const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            progressEl.value = pct;
            pctEl.textContent = `${pct.toFixed(0)}%`;
          },
          (error) => {
            console.error(error);
            statusEl.className = 'error';
            statusEl.textContent = `Upload failed: ${error.message}`;
          },
          async () => {
            // Upload completed successfully
            // (Optional) Refresh metadata (useful if rules/clients rely on contentType)
            await updateMetadata(storageRef, metadata).catch(() => {});

            const url = await getDownloadURL(storageRef);
            statusEl.className = 'success';
            statusEl.textContent = 'Upload complete.';
            resultEl.innerHTML = `
              <div class="success"><strong>Download URL:</strong>
                <div><a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a></div>
              </div>
              <div class="muted">Path: <code>${objectPath}</code></div>
            `;
          }
        );
      } catch (err) {
        console.error(err);
        statusEl.className = 'error';
        statusEl.textContent = `Unexpected error: ${err.message}`;
      }
    });
  