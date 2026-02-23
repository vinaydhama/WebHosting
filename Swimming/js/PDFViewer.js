    // --- 1) Import Firebase (modular) ---
    import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
    import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
    import {
      getStorage, ref, listAll, getDownloadURL, getMetadata
    } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

    // // --- 2) Your Firebase configuration (replace with your own from Firebase Console) ---
    // const firebaseConfig = {
    //   apiKey: "YOUR_API_KEY",
    //   authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    //   projectId: "YOUR_PROJECT_ID",
    //   storageBucket: "YOUR_PROJECT_ID.appspot.com",
    //   messagingSenderId: "YOUR_SENDER_ID",
    //   appId: "YOUR_APP_ID"
    // };

    // --- 3) Initialize Firebase ---
    import { firebaseConfig } from "./DFBC.js";

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const storage = getStorage(app);

    // --- 4) DOM elements ---
    const fileSelect = document.getElementById('fileSelect');
    const btnRefresh = document.getElementById('btnRefresh');
    const statusEl = document.getElementById('status');
    const viewerEl = document.getElementById('viewer');
    const linkWrapEl = document.getElementById('linkWrap');
    const folderPathLabel = document.getElementById('folderPathLabel');

    // --- 5) Configuration: Choose your folder ---
    // Option A (per-user): populated after auth: users/<uid>/files
    // Option B (shared/public): public/files
    let folderPathMode = "perUser"; // "perUser" or "public"
    let folderPath = "public/files"; // default; will be replaced if perUser mode

    let currentUser = null;
    let fileIndex = []; // [{ name, fullPath, contentType }]

    // --- 6) Auth (anonymous for demo) ---
    signInAnonymously(auth).catch(err => {
      statusEl.className = 'error';
      statusEl.textContent = `Anonymous auth failed: ${err.message}`;
    });

    onAuthStateChanged(auth, async (user) => {
      currentUser = user || null;
      if (currentUser) {
        statusEl.className = 'success';
        statusEl.textContent = `Signed in (uid: ${currentUser.uid}).`;

        // Set folder according to mode
        folderPath = (folderPathMode === "perUser")
          ? `users/${currentUser.uid}/files`
          : `public/files`;
        folderPathLabel.textContent = folderPath;

        await refreshList();
      } else {
        statusEl.className = 'error';
        statusEl.textContent = 'Not authenticated.';
      }
    });

    // --- 7) List and populate dropdown ---
    async function refreshList() {
      fileSelect.disabled = true;
      fileSelect.innerHTML = `<option value="">Loading files...</option>`;
      linkWrapEl.innerHTML = '';
      viewerEl.innerHTML = `<div class="muted">Select a file from the dropdown to preview.</div>`;

      try {
        const listRef = ref(storage, folderPath);
        const res = await listAll(listRef); // lists items & prefixes under folderPath

        // Optionally: handle subfolders in res.prefixes if you use nested structure
        const items = res.items; // StorageReferences

        // Collect metadata for each item (contentType)
        fileIndex = [];
        for (const itemRef of items) {
          let contentType = 'application/octet-stream';
          try {
            const meta = await getMetadata(itemRef);
            if (meta && meta.contentType) contentType = meta.contentType;
          } catch (_) { /* ignore metadata errors */ }

          fileIndex.push({
            name: itemRef.name,
            fullPath: itemRef.fullPath,
            contentType
          });
        }

        // Sort by name (optional)
        fileIndex.sort((a, b) => a.name.localeCompare(b.name));

        // Populate dropdown
        fileSelect.innerHTML = '';
        if (fileIndex.length === 0) {
          fileSelect.innerHTML = `<option value="">(No files found)</option>`;
        } else {
          fileSelect.insertAdjacentHTML('beforeend', `<option value="">-- Select a file --</option>`);
          for (const f of fileIndex) {
            const label = `${f.name} (${f.contentType || 'unknown'})`;
            const opt = document.createElement('option');
            opt.value = f.fullPath;
            opt.textContent = label;
            opt.dataset.type = f.contentType;
            fileSelect.appendChild(opt);
          }
        }
        fileSelect.disabled = false;
      } catch (err) {
        console.error(err);
        statusEl.className = 'error';
        statusEl.textContent = `Failed to list files: ${err.message}`;
        fileSelect.innerHTML = `<option value="">Error loading files</option>`;
      }
    }

    btnRefresh.addEventListener('click', refreshList);

    // --- 8) Selection → preview ---
    fileSelect.addEventListener('change', async () => {
      linkWrapEl.innerHTML = '';
      viewerEl.innerHTML = '';
      const fullPath = fileSelect.value;
      const selectedType = fileSelect.selectedOptions[0]?.dataset?.type || '';

      if (!fullPath) {
        viewerEl.innerHTML = `<div class="muted">Select a file from the dropdown to preview.</div>`;
        return;
      }

      try {
        const fileRef = ref(storage, fullPath);
        const url = await getDownloadURL(fileRef);

        // Build a safe viewer
        renderViewer(url, selectedType);

        // Provide a direct link
        linkWrapEl.innerHTML = `
          <div class="row">
            <strong>Open in new tab:</strong>
            <a href="${url}" target="_blank" rel="noopener"> ${fullPath} </a>
          </div>
        `;
      } catch (err) {
        console.error(err);
        viewerEl.innerHTML = `<div class="error">Could not load file: ${err.message}</div>`;
      }
    });

    function renderViewer(url, type) {
      // Clear viewer
      viewerEl.innerHTML = '';

      // Decide based on MIME
      if (type && type.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = url;
        img.alt = 'Image preview';
        viewerEl.appendChild(img);
      } else if (type === 'application/pdf') {
        const iframe = document.createElement('iframe');
        iframe.src = url; // Built-in PDF viewer in most browsers
        iframe.setAttribute('title', 'PDF preview');
        viewerEl.appendChild(iframe);
      } else {
        // Fallback: just link
        viewerEl.innerHTML = `
          <div class="muted">
            Preview unsupported for type: <code>${type || 'unknown'}</code><br/>
            Use the link above to open/download.
          </div>
        `;
      }
    }