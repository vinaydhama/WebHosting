import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    addDoc,
    doc,
    updateDoc,
    deleteDoc

} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

import { firebaseConfig } from "./DFBC.js";
// const firebaseConfig = {
//     apiKey: "AIzaSyAHqPVFfpZeIkfp3A1OiMEezo4YLHukqaE",
//     authDomain: "riviera-certificates-test.firebaseapp.com",
//     projectId: "riviera-certificates-test",
//     storageBucket: "riviera-certificates-test.appspot.com",
//     messagingSenderId: "651682049198",
//     appId: "1:651682049198:web:4b956063884b86d50bd13f"
// };


const app = initializeApp(firebaseConfig);
const db = getFirestore();
const eventsRef = collection(db, "events");
let originalValues ;
let SwID;



function editRow(docId,event) {
    event.preventDefault();
    const row = document.querySelector(`tr[data-id="${docId}"]`);
    const cells = row.querySelectorAll("td");

    // Store original values in case of cancel
     originalValues = Array.from(cells).map(cell => cell.innerHTML);
    // document.querySelectorAll('#performanceTable thead th')[yIndex].textContent 
    
    const headerrow = Array.from(document.querySelectorAll('#performanceTable thead th'))
    .map(th => th.textContent.trim());
    // Replace cells with input fields (excluding the last cell with buttons)
    for (let i = 0; i < cells.length - 1; i++) {
        const value = cells[i].innerText;
        if (headerrow[i]=="Sl.No" )
            {

            }
        else if (headerrow[i]=="Heat DateTime")
        {
            
    const date = new Date(value);
    const formattedDate = convertToDateTimeLocalFormat(value);
    cells[i].innerHTML = `<input type="datetime-local" value="${formattedDate}" />`;
        }
        
        else if (headerrow[i]=="Event ID")
            // {   const options = ['Freestyle', 'Breaststroke', 'Butterfly','Backstroke'];
        {
            const selectElement= document.getElementById('eventNameDropdown');
        
            const optionsArray = Array.from(selectElement.options).map(option => option.value);

        // text: option.text
        

        // console.log(optionsArray);
  

                const selectedValue = value;
                    const selectHTML = `<select>${optionsArray.map(opt => 
                    `<option value="${opt}" ${opt === selectedValue ? 'selected' : ''}>${opt}</option>`
                    ).join('')}</select>`;
                cells[i].innerHTML = selectHTML;        
            }

            else if (headerrow[i]=="Stroke")                {
            const options = ['Freestyle', 'Breaststroke', 'Butterfly','Backstroke'];
            const selectedValue = value;
                const selectHTML = `<select>${options.map(opt => 
                `<option value="${opt}" ${opt === selectedValue ? 'selected' : ''}>${opt}</option>`
                ).join('')}</select>`;
            cells[i].innerHTML = selectHTML;        
                }
        else{
        cells[i].innerHTML = `<input type="text" value="${value}" />`;
        }
    }

    //   <button onclick="saveRow('${docId}')">Save</button>
    cells[cells.length - 1].innerHTML = `
    <button class="save-btn" onclick="saveRow('${docId}',event)"><i class="fas fa-save"></i> </button>
    <button class="cancel-btn" onclick="cancelEdit('${docId}',event)"><i class="fas fa-cancel"></i> </button>  `;
    // <button onclick="cancelEdit('${docId}')">Cancel</button>
}

function cancelEdit(docId) {
    const row = document.querySelector(`tr[data-id="${docId}"]`);
    const cells = row.querySelectorAll("td");
    let originalVal= JSON.stringify(originalValues);

    originalValues.forEach((value, index) => {
        cells[index].innerHTML = value;
    });

    // Restore Edit/Delete buttons
    cells[cells.length - 1].innerHTML = `
        <button class="edit-btn" onclick="editRow('${docId}',event)"><i class="fas fa-edit"></i> </button>
        <button class="delete-btn" onclick="deleteRow('${docId}',event)"><i class="fas fa-trash-alt"></i> </button>
    `;
}

function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerText = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

async function deleteRow(docId,event) {
    event.preventDefault();

    if (!confirm("Are you sure you want to delete this record?")) return;
  
    try {
      await deleteDoc(doc(db, "swimmerRecords", docId)); // Firestore delete
      showToast("Record deleted.");
      loadSwimmerPerformance(); // Refresh table
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Failed to delete record.");
    }
  }
  


async function saveRow(docId,event) {
    event.preventDefault();
    const row = document.querySelector(`tr[data-id="${docId}"]`);
    const inputs = row.querySelectorAll("input");
    const select = row.querySelectorAll("select");


if (!isValidTimeFormat(inputs[3].value)) {
  alert("Invalid format! Please enter time as mm:ss.sss");
  return;
}
    const updatedData = {
        eventId: select[0].value,
        stroke: select[1].value,

        swimmerId: SwID,
        rank:inputs[0].value,        
        heatdatetime:inputs[1].value,        
        distance: inputs[2].value,
        time: inputs[3].value,
        GoodThings: inputs[4].value,
        ToImprove: inputs[5].value
    };

    try {
        await updateDoc(doc(db, "swimmerRecords", docId), updatedData);
        showToast('Data Updated...')
        let user=ReadSessionData('user');
        if (user) {
          SwID = user.swimmer_id;
          document.getElementById("swimmerId").value = SwID;
          document.getElementById("swimmerName").value = user.name;
          // UpdateProfilePage(user);
          // document.getElementById("Welcommsg").innerText= "Welcome to Eejo Swim Portal " +  user.swimmer_id;
        }
        
        loadSwimmerPerformance(); // Refresh table
    } catch (error) {
        console.error("Error updating document:", error);
    }
}


async function loadSwimmerPerformance() {

    try {
        if (SwID)
            {
       let  swimmerId=SwID;
        const q = query(
            collection(db, "swimmerRecords"),
            where("swimmerId", "==", swimmerId)
        );
        const tbody = document.querySelector("#performanceTable tbody");
        tbody.innerHTML = "";
        
        const snapshot = await getDocs(q);
        let Slno=1;
        snapshot.forEach(doc => {
            const data = doc.data();
            // data.rank=0
            // data.heatdatetime= formatDateManually(new Date());

        const row = `<tr data-id="${doc.id}">
  <td>${Slno}</td>
  <td>${data.rank}</td>
  <td>${data.eventId}</td>
  <td>${data.heatdatetime}</td>  
  <td>${data.stroke}</td>
  <td>${data.distance}</td>
  <td>${data.time}</td>
  <td>${data.GoodThings}</td>
  <td>${data.ToImprove}</td>
  <td>  
    <button class="edit-btn" onclick="editRow('${doc.id}',event)"><i class="fas fa-edit"></i> </button>
    <button class="delete-btn" onclick="deleteRow('${doc.id}',event)"><i class="fas fa-trash-alt"></i> </button>  
  </td>
</tr>`;

            tbody.innerHTML += row;
            Slno++;
            
        });
    }
    } catch (error) {
        console.error("Error loading events:", error);
    }

}

function sortTable(columnIndex) {
    const table = document.getElementById("performanceTable");
    const rows = Array.from(table.rows).slice(1); // Skip header
    const sortedRows = rows.sort((a, b) => {
        const aText = a.cells[columnIndex].textContent.trim();
        const bText = b.cells[columnIndex].textContent.trim();
        return aText.localeCompare(bText, undefined, { numeric: true });
    });

    const tbody = table.querySelector("tbody");
    tbody.innerHTML = "";
    sortedRows.forEach(row => tbody.appendChild(row));
}


function filterTable() {
    const swimmerIdFilter = document.getElementById("filterSwimmerId").value.toLowerCase();
    const eventIdFilter = document.getElementById("filterEventId").value.toLowerCase();
    const strokeFilter = document.getElementById("filterStroke").value.toLowerCase();
    const distanceFilter = document.getElementById("filterDistance").value.toLowerCase();

    const table = document.getElementById("performanceTable");
    const rows = table.querySelectorAll("tbody tr");

    rows.forEach(row => {
        // const swimmerId = row.cells[0].textContent.toLowerCase();
        const eventId = row.cells[2].textContent.toLowerCase();
        const stroke = row.cells[4].textContent.toLowerCase();
        const distance = row.cells[5].textContent.toLowerCase();

        // const matchesSwimmerId = swimmerId.includes(swimmerIdFilter);
        const matchesEventId = eventId.includes(eventIdFilter);
        const matchesStroke = stroke.includes(strokeFilter);
        const matchesDistance = distance.includes(distanceFilter);

        row.style.display = ( matchesEventId && matchesStroke && matchesDistance) ? "" : "none";
    });
}



function resetFilters() {
    document.getElementById("filterSwimmerId").value = "";
    document.getElementById("filterEventId").value = "";
    document.getElementById("filterStroke").value = "";
    document.getElementById("filterDistance").value = "";
    filterTable(); // Reapply filters
}


document.addEventListener("DOMContentLoaded", () => {
    toggleSidebar();

    let user = ReadSessionData("user")
  if (user) {

    UpdateProfilePage(user);
    document.getElementById("swimmerName").value=user.name;
    document.getElementById("swimmerId").value=user.swimmer_id;
    SwID= user.swimmer_id
    loadSwimmerPerformance();

  }

    const ev = document.getElementById('eventType');
    ev.addEventListener("change", (event) => {
        toggleEventDetails(event.target.value);
    });

    const ResetFilter = document.getElementById('ResetFilter');
    ResetFilter.addEventListener("click", () => {
        resetFilters();
    });

    const filterSwimmerId = document.getElementById('filterSwimmerId');
    filterSwimmerId.addEventListener("keyup", () => {
        filterTable();
    });

    const filterEventId = document.getElementById('filterEventId');
    filterEventId.addEventListener("keyup", () => {
        filterTable();
    });

    const filterStroke = document.getElementById('filterStroke');
    filterStroke.addEventListener("keyup", () => {
        filterTable();
    });

    const filterDistance = document.getElementById('filterDistance');
    filterDistance.addEventListener("keyup", () => {
        filterTable();
    });

    // <th id="SlNoTh" >Sl.No</th>
    //         <th id="Rankth" >Rank</th>

    //         <th id="EventIDth" >Event ID</th>
    //         <th id="HeatDateTimeth">Heat DateTime</th>

    //         <th id="Stroketh" >Stroke</th>
    //         <th id="Distanceth" >Distance</th>
    //         <th id="Timeth" >Time</th>

    //         <th id="GoodThingsth" onclick=>Good Things</th>
    //         <th id="ToImproveth" onclick=>To Improve</th>
    //         <th id="EditTH">Edit</th>

    const SlNoTh = document.getElementById('SlNoTh');
    SlNoTh.addEventListener("click", () => {
        sortTable(0);
    });
    const Rankth = document.getElementById('Rankth');
    Rankth.addEventListener("click", () => {
        sortTable(1);
    });

    const EventIDth = document.getElementById('EventIDth');
    EventIDth.addEventListener("click", () => {
        sortTable(2);
    });
    const Timeth = document.getElementById('Timeth');
    Timeth.addEventListener("click", () => {
        sortTable(2);
    });
    const Stroketh = document.getElementById('Stroketh');
    Stroketh.addEventListener("click", () => {
        sortTable(3);
    });

    const Distanceth = document.getElementById('Distanceth');
    Distanceth.addEventListener("click", () => {
        sortTable(4);
    });

    const GoodThingsth = document.getElementById('GoodThingsth');
    GoodThingsth.addEventListener("click", () => {
        sortTable(5);
    });

    const ToImproveth = document.getElementById('ToImproveth');
    ToImproveth.addEventListener("click", () => {
        sortTable(6);
    });


    const eventNameDropdown = document.getElementById('eventNameDropdown');
    eventNameDropdown.addEventListener("change", (event) => {
        UpdateEventDetails(event.target.value);
    });



    const addEventButton = document.getElementById('addEventButton');
    addEventButton.addEventListener("click", () => {
        addNewEvent();
    });

    const distance = document.getElementById('distance');
    distance.addEventListener("change", () => {
        toggleCustomDistance();
    });

    const AddRecordbtn = document.getElementById('AddRecordbtn');
    AddRecordbtn.addEventListener("click", () => {
        submitRecord();
    });
});



function toggleEventDetails(type) {
    // const type = document.getElementById('eventType').value;
    const showDetails = type !== 'Training';
    document.getElementById('eventDetails').classList.toggle('hidden', !showDetails);
}

function toggleCustomDistance() {
    const dist = document.getElementById('distance').value;
    document.getElementById('customDistance').classList.toggle('hidden', dist !== 'Other');
}

async function submitRecord() {
    const swimmerId = document.getElementById('swimmerId').value;
    const swimmerName = document.getElementById('swimmerName').value;
    const eventType = document.getElementById('eventType').value;
    const eventId = document.getElementById('eventNameDropdown').value || document.getElementById('newEventName').value;
    const stroke = document.getElementById('strokeType').value;
    const distance = document.getElementById('distance').value === 'Other'
        ? document.getElementById('customDistance').value
        : document.getElementById('distance').value;
    const time = document.getElementById('recordTime').value;
    const rank = document.getElementById('rankentry').value;
    const heatdatetime= formatToCustomDate( document.getElementById('HeatDateTime').value);


    const record = {
        swimmerId,
        heatdatetime,
        swimmerName,
        rank,
        eventId,
        eventType,
        stroke,
        distance,
        time        
    };

    try {
        const docRef = await addDoc(collection(db, "swimmerRecords"), record);        
        alert("Record successfully added to Firestore!");
        loadSwimmerPerformance();
    } catch (error) {
        console.error(" Error adding record:", error);
        alert("Failed to add record.");
    }
}

async function loadEventDropdown() {
    const dropdown = document.getElementById("eventNameDropdown");
    dropdown.innerHTML = `<option value="">-- Select Existing Event --</option>`;

    try {
        const q = query(collection(db, "events"));
        const snapshot = await getDocs(q);
        snapshot.forEach(doc => {
            const data = doc.data();
            const option = document.createElement("option");
            option.value = data.name;
            option.textContent = data.name;
            dropdown.appendChild(option);
        });
    } catch (error) {
        console.error("Error loading events:", error);
    }
}

async function UpdateEventDetails(selectedId) {
    if (!selectedId) {
        clearEventFields();
        document.getElementById("addEventButton").classList.remove("hidden");
        return;
    }

    try {

        const q = query(collection(db, "events"), where("name", "==", selectedId));
        const snapshot = await getDocs(q);


        if (!snapshot.empty) {
            // if (doc.exists) {
            const userDoc = snapshot.docs[0];
            const data = userDoc.data();
            // const data =doc(db, "events", userDoc.id);
            document.getElementById("newEventName").value = data.name || "";
            document.getElementById("eventDate").value = data.date || "";
            document.getElementById("eventAddress").value = data.address || "";
            document.getElementById("eventLocation").value = data.location || "";
            document.getElementById("addEventButton").classList.add("hidden");
        }
    } catch (error) {
        console.error("Error fetching event details:", error);
    }
}

function clearEventFields() {
    document.getElementById("newEventName").value = "";
    document.getElementById("eventDate").value = "";
    document.getElementById("eventAddress").value = "";
    document.getElementById("eventLocation").value = "";
}

async function addNewEvent() {
    const name = document.getElementById("newEventName").value;
    const date = document.getElementById("eventDate").value;
    const address = document.getElementById("eventAddress").value;
    const location = document.getElementById("eventLocation").value;

    if (!name) {
        alert("Please enter an event name.");
        return;
    }

    try {
        const docRef = await addDoc(collection(db, "events"), { name, date, address, location });
        // const docRef = await eventsRef.add({ name, date, address, location });
        alert("âœ… Event added successfully!");
        loadEventDropdown();
        document.getElementById("eventNameDropdown").value = name;
        document.getElementById("addEventButton").classList.add("hidden");
    } catch (error) {
        console.error("Error adding event:", error);
        alert("Failed to add event.");
    }
}

window.onload = loadEventDropdown;
window.editRow = editRow;
window.deleteRow= deleteRow;
window.saveRow = saveRow;
window.cancelEdit = cancelEdit;
window.showToast = showToast;
window.filterTable= filterTable;


