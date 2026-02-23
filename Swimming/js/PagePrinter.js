
    // Optional: stamp the print date/time in the header
    function setPrintDate() {
      const el = document.getElementById('print-date');
      if (!el) return;
      const now = new Date();
      el.textContent = now.toLocaleString([], { year:'numeric', month:'short', day:'2-digit', hour:'2-digit', minute:'2-digit' });
    }
    setPrintDate();
    window.addEventListener('beforeprint', setPrintDate);

    // Open print dialog (user will select "Save as PDF")
    function triggerPrint() {
      if (typeof setPrintDate === 'function') setPrintDate();
      window.print();
    }

    // Optional: auto-open print dialog if URL has ?print=1
    if (new URLSearchParams(location.search).get('print') === '1') {
      setTimeout(() => triggerPrint(), 0);
    }

    (function init() {
      setPrintDate();
      const params = new URLSearchParams(location.search);
      const key = "PrintTable";
      let data = null;
      try {
        if (key && sessionStorage.getItem(key)) {
          data = JSON.parse(sessionStorage.getItem(key));
        } else if (key && localStorage.getItem(key)) {
          data = JSON.parse(localStorage.getItem(key));
        }
      } catch (e) {
        console.error('Failed to parse data:', e);
      }

      if (!data) {
        // Friendly fallback if no data found
        renderTable({
          title: 'No data found',
          headers: ['Message'],
          rows: [{ 'Message': 'Open this page from the sender (index.html) to pass table data.' }]
        });
      } else {
        renderTable(data);
        plotVisualiser();
      }

      if (params.get('print') === '1') {
        setTimeout(() => window.print(), 0);
      }
    })();

    window.addEventListener('beforeprint', setPrintDate);
  