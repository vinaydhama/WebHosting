MeetDataFirebaseBaseURL = "https://eejo-managerdb-default-rtdb.firebaseio.com/Meets/";
MeetRegInfoFBURL = "https://eejo-managerdb-default-rtdb.firebaseio.com/Meets/MeetRegInfo.json";
let MeetName = "";
let MeetAddress = "";
let MeetDate = "";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("frmEvet");
  form.addEventListener("submit", AddEventEntries);
  ClearAllPop();
});

async function DisplayMeetRegister(event) {
  event.preventDefault();
  MeetNameSelected = document.getElementById('meetName').textContent;
  var dataAPI = fetch(MeetDataFirebaseBaseURL + MeetNameSelected + ".json")
    .then(response => {
      return response.json()
    })
    .then(data => {
      ElegableGroup = CheckGroup(user.dob, data);
      ListApplicableEvents(ElegableGroup, data);
      document.getElementById("frmEvet").scrollIntoView({ behavior: "smooth" });

    }, error => {
      console.error('onRejected function called: ' + error.message);
    })
}
async function AddEventEntries(event) {
  let now = new Date();

  console.log("Register function called");
  ShowActivitypop("Fetching Events");
  event.preventDefault();
  const HeatSelector = document.getElementById('meetName');
  if (HeatSelector) {
    let swEvents = []

    for (let index = 1; index <= NoOFEvents; index++) {
      let SwimmersEventSelector = document.getElementById("SwimmersEventSelector" + index);
      let SwimmersBestTime = document.getElementById("SwimmersBestTime" + index);
      if (SwimmersEventSelector) {
        if (SwimmersBestTime) {
          swEvents.push({ "Available": false, "BestTimeings": SwimmersBestTime.value, "EventName": SwimmersEventSelector.value });
        }
      }
    }
    datatopost = {
      "club": user.ClubName, "Group": ElegableGroup, "ID": user.swimmer_id, "Events": swEvents, "MeetName": MeetName, "MeetAddress": MeetAddress,
      "MeetDate": MeetDate,"RegTime": formatDateManually(now)
    };
    let FirebaseURL = MeetDataFirebaseBaseURL + HeatSelector.textContent + "/SwimmerDetails/" + user.name + ".json"
    await SaveEventToFB(FirebaseURL, datatopost)
    document.getElementById("frmEvet").reset();
    document.getElementById("meetName").value = "";
    ClearAllPop();
    openPrintWindow("EventID", user, 'EventIDcardDisp', datatopost);
  }
}

// Get reference to the select box
function FillMeetnames(events) {
  const tbody = document.querySelector("#eventTable tbody");
  const today = new Date();
  Object.keys(events).forEach(event => {
    MeetDate = new Date(events[event].MeetDate);
    const eventDate = MeetDate;
    MeetName = event;
    MeetAddress = event.MeetAddress;
    const daysLeft = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
    const row = document.createElement("tr");
    if (daysLeft < 0) {
      row.style.background = "rgb(100,10,50)";
    }
    row.id = event;
    row.innerHTML = `    
      <td>
        <div class="date-cell">
          ${eventDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
          <span class="days-left">${daysLeft} days</span>
        </div>
      </td>
      <td>${event}</td>`;

    row.addEventListener("click", function () {
      const rowId = this.id; // e.g., "row-Meet1"  
      const days = daysLeft;
      showCard(events, days, rowId);
    });

    tbody.appendChild(row);
  });
}

function showCard(eventDetails, daysLeft, rowId) {
  document.getElementById("eventImage").src = "";
  document.getElementById("meetName").textContent = eventDetails[rowId].MeetName;
  document.getElementById("eventDate").textContent = new Date(eventDetails[rowId].MeetDate).toDateString();
  document.getElementById("eventDays").textContent = `${daysLeft} days`;
  document.getElementById("eventLocation").textContent = eventDetails[rowId].MeetAddress;
  document.getElementById("eventType").textContent = eventDetails[rowId].NoOFEvents;
  document.getElementById("eventDescription").textContent = "";

  if (daysLeft > 0) {
    document.getElementById("registerBtn").style.display = "inline-block";
  } else {
    document.getElementById("registerBtn").style.display = "none";
  }
}

function ListApplicableEvents(selectedGroup, meetData) {

  ShowActivitypop("Updating Events..");

  const filteredEvents = meetData.EventList.filter(event => event.includes(`_${selectedGroup}_`));
  NoOFEvents = meetData.NoOFEvents;
  const frmSwSelectedEvents = document.getElementById("frmEvet");
  frmSwSelectedEvents.innerHTML = "";
  for (let index = 1; index <= meetData.NoOFEvents; index++) {
    CreateEventSelector(index, filteredEvents);
    AddTimeValidators("SwimmersBestTime" + index)

  }
  // Create time input
  const FormSubmit = document.createElement("button");
  FormSubmit.textContent = "Register"
  FormSubmit.type = "submit";
  FormSubmit.addEventListener("onsubmit", () => { AddEventEntries(); });
  frmSwSelectedEvents.appendChild(FormSubmit);
  ClearAllPop();
}

function CheckGroup(dobInput, meetData) {
  const dob = new Date(dobInput);
  const eligibleGroups = meetData.GroupDetails.filter(group => {
    const from = new Date(group.FromDate);
    const to = new Date(group.ToDate);
    return dob >= from && dob <= to;
  });

  let eligibleGroup = ""
  if (eligibleGroups.length > 0) {
    eligibleGroup = eligibleGroups.map(g => g.GroupName).join(", ");
  }
  return eligibleGroup;
}
async function FetchMeetNames() {

  ShowActivitypop("Updating MeetNames..");
  var dataAPI = fetch(MeetRegInfoFBURL)
    .then(response => {
      // ClearAllPop();
      return response.json()
    })
    .then(data => {
      MeetRegData = data;
      FillMeetnames(MeetRegData);
      ClearAllPop();

      return MeetRegData;

    }, error => {
      ClearAllPop();
      ShowMessagepop("Failed To Fetch MeetNames..");
      console.error('onRejected function called: ' + error.message);
    })
}

async function SaveEventToFB(FirebaseURL, DataTopost) {
  //showhide("BusyIndicatorpop", "Writing To Cloud");
  await fetch(FirebaseURL, {
    method: "PUT",
    body: JSON.stringify(DataTopost),
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
  });
}

function AddTimeValidators(TimeID) {

  const SwimmersBestTime = document.getElementById(TimeID);
  if (SwimmersBestTime) {
    SwimmersBestTime.addEventListener("input", () => {
      const regex = /^\d{2}:\d{2}\.\d{3}$/;
      if (!regex.test(SwimmersBestTime.value)) {
        SwimmersBestTime.setCustomValidity("Please enter time in mm:ss.sss format.");
        SwimmersBestTime.reportValidity();
      } else {
        SwimmersBestTime.setCustomValidity("");
      }
    });
  }
}
function CreateEventSelector(Selectindex, AvailableEvents) {
  const frmSwSelectedEvents = document.getElementById("frmEvet");
  frmSwSelectedEvents.style.display = 'block';
  const select = document.createElement("select");
  select.id = "SwimmersEventSelector" + Selectindex;
  select.className = "event-dropdown";
  select.setAttribute("onchange", "updateDropdowns(" + Selectindex + ")");

  // Add default option
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "--Select Event--";
  select.appendChild(defaultOption);

  // Populate dropdown with available events
  AvailableEvents.forEach(event => {
    const option = document.createElement("option");
    option.value = event;
    option.textContent = event;
    select.appendChild(option);
  });

  // Create time input
  const timeInput = document.createElement("input");
  timeInput.type = "text";
  timeInput.id = "SwimmersBestTime" + Selectindex;
  timeInput.placeholder = "mm:ss.sss";
  timeInput.disabled = true;


  // Append elements to cell
  frmSwSelectedEvents.appendChild(select);
  frmSwSelectedEvents.appendChild(timeInput);

  // Append table to body or a container
  // document.body.appendChild(tblSwSelectedEvents);
}


function updateDropdowns(Selectindex) {
  const selectedEvents = new Set();
  const txtSelectindex = document.getElementById("SwimmersBestTime" + Selectindex);
  txtSelectindex.disabled = false;
  const selects = document.querySelectorAll("select.event-dropdown");
  selects.forEach(select => {
    if (select.value) {
      selectedEvents.add(select.value);
    }
  });
  selects.forEach(select => {
    const currentValue = select.value;
    Array.from(select.options).forEach(option => {
      option.disabled = selectedEvents.has(option.value) && option.value !== currentValue;
    });
  });
}