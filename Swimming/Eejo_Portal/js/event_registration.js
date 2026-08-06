MeetDataFirebaseBaseURL = "https://riviera-certificates-test-default-rtdb.firebaseio.com/Eejo/Events/";
MeetRegInfoFBURL = "https://riviera-certificates-test-default-rtdb.firebaseio.com/Eejo/MeetRegInfo.json";
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
      ListApplicableEvents(user,ElegableGroup, data);
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
          swEvents.push({ "Available": true, "BestTimeings": SwimmersBestTime.value, "EventName": SwimmersEventSelector.value });
        }
      }
    }
    datatopost = {
      "Club": user.clubname, "Group": ElegableGroup, "ID": user.swimmer_id, "Events": swEvents, 
      "Gender": (user.gender == 1 ? "B" : "G"),"DOB": user.dob,
       "RegTime": formatDateManually(now), "ClubShort": user.clubname,"PhotoPath_Local": user.photo,"PhotoPath_FB": user.photo
      //  "MeetDate": MeetDate,"MeetName": MeetName
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
  const details = eventDetails && eventDetails[rowId];

  document.getElementById("eventImage").src = "";
  document.getElementById("meetName").textContent = details ? details.MeetName : "";
  document.getElementById("eventDate").textContent = details && details.MeetDate ? new Date(details.MeetDate).toDateString() : "";
  document.getElementById("eventDays").textContent = `${daysLeft} days`;
  document.getElementById("eventLocation").textContent = details ? details.MeetAddress : "";
  document.getElementById("eventType").textContent = details ? details.NoOFEvents : "";
  document.getElementById("eventDescription").textContent = details ? (details.Description || "") : "";

  const registerBtn = document.getElementById("registerBtn");
  const entryStatus = document.getElementById("entryStatus");
  if (!registerBtn) return;

  // Only enable register button when the event is in the future AND EntryAccepted is true
  const entryAccepted = details && (details.EntryAccepted === true || details.EntryAccepted === 'true');

  if (daysLeft > 0 && entryAccepted) {
    registerBtn.style.display = "inline-block";
    registerBtn.disabled = false;
    if (entryStatus) { entryStatus.style.display = 'none'; entryStatus.textContent = ''; }
  } else {
    registerBtn.style.display = "none";
    registerBtn.disabled = true;
    if (entryStatus) { entryStatus.style.display = 'block'; entryStatus.textContent = 'Entries are closed for this meet.'; }
  }
}

function ListApplicableEvents(user, selectedGroup, meetData) {

  ShowActivitypop("Updating Events..");

  // derive gender code
  const genderCode = (typeof user !== 'undefined' && user.gender == 1) ? 'B' : 'G';

  // support selectedGroup being a comma separated string or array
  const groups = Array.isArray(selectedGroup)
    ? selectedGroup
    : (typeof selectedGroup === 'string' ? selectedGroup.split(',').map(s => s.trim()).filter(Boolean) : [selectedGroup]);

  // helper to escape regex special chars
  function escapeRegex(str) {
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  const filteredEvents = Array.isArray(meetData.EventList) ? meetData.EventList.filter(ev => {
    if (!ev || typeof ev !== 'string') return false;
    // group match: underscore + group + (underscore or end)
    const groupMatch = groups.some(g => {
      if (!g) return false;
      const re = new RegExp(`_${escapeRegex(g)}(?:_|$)`);
      return re.test(ev);
    });
    if (!groupMatch) return false;
    // gender match: underscore + gender + (underscore or end)
    const genderRe = new RegExp(`_${escapeRegex(genderCode)}(?:_|$)`);
    return genderRe.test(ev);
  }) : [];

  NoOFEvents = meetData.NoOFEvents;
  const frmSwSelectedEvents = document.getElementById("frmEvet");
  // ensure form is visible
  if (frmSwSelectedEvents) {
    frmSwSelectedEvents.style.display = 'block';
  }

  frmSwSelectedEvents.innerHTML = "";

  // load any previously saved swimmer entries for this user
  const swimmerDetails = meetData && meetData.SwimmerDetails && meetData.SwimmerDetails[user && user.name];
  const savedEvents = Array.isArray(swimmerDetails && swimmerDetails.Events) ? [...swimmerDetails.Events] : [];

  for (let index = 1; index <= meetData.NoOFEvents; index++) {
    CreateEventSelector(index, filteredEvents);
    AddTimeValidators("SwimmersBestTime" + index)

    // if user already registered, pre-select event and time
    const selectEl = document.getElementById("SwimmersEventSelector" + index);
    const timeEl = document.getElementById("SwimmersBestTime" + index);
    if (selectEl && savedEvents.length) {
      const matchIdx = savedEvents.findIndex(e => {
        return e && e.EventName && Array.from(selectEl.options).some(o => o.value === e.EventName);
      });
      if (matchIdx >= 0) {
        const matched = savedEvents[matchIdx];
        selectEl.value = matched.EventName;
        if (timeEl) {
          timeEl.value = matched.BestTimeings || '';
          timeEl.disabled = false;
        }
        // remove used entry to avoid duplicates
        savedEvents.splice(matchIdx, 1);
      }
    }
  }

  // determine if meet accepts entries
  const selectedMeetName = (document.getElementById('meetName') && document.getElementById('meetName').textContent) ? document.getElementById('meetName').textContent : null;
  const meetRegEntryAccepted = typeof MeetRegData !== 'undefined' && selectedMeetName && MeetRegData[selectedMeetName] && (MeetRegData[selectedMeetName].EntryAccepted === true || MeetRegData[selectedMeetName].EntryAccepted === 'true');
  const meetDataEntryAccepted = meetData && (meetData.EntryAccepted === true || meetData.EntryAccepted === 'true');
  const meetEntryAccepted = meetDataEntryAccepted || meetRegEntryAccepted;

  // ensure a visible submit button exists (reuse if present)
  let submitBtn = frmSwSelectedEvents.querySelector('button[type="submit"]');
  if (!submitBtn) {
    submitBtn = document.createElement("button");
    submitBtn.type = "submit";
    submitBtn.id = "frmSubmitBtn";
    submitBtn.textContent = "Register";
    // appending at end
    frmSwSelectedEvents.appendChild(submitBtn);
  }

  // helper to set enabled/disabled styling for submit button
  function setSubmitState(btn, enabled) {
    if (!btn) return;
    if (enabled) {
      btn.disabled = false;
      btn.style.backgroundColor = '#28a745';
      btn.style.color = '#ffffff';
      btn.style.cursor = 'pointer';
      btn.style.opacity = '1';
      btn.classList.remove('btn-disabled');
      btn.classList.add('btn-enabled');
    } else {
      btn.disabled = true;
      btn.style.backgroundColor = '#dddddd';
      btn.style.color = '#666666';
      btn.style.cursor = 'not-allowed';
      btn.style.opacity = '0.9';
      btn.classList.remove('btn-enabled');
      btn.classList.add('btn-disabled');
    }
  }

  // initialize submit button: disabled until a change is made by user
  submitBtn.style.display = 'inline-block';
  submitBtn.style.visibility = 'visible';
  // always start disabled; only enable after a user change and entries accepted
  setSubmitState(submitBtn, false);

  // enable submit when the user interacts with any select or time input AND entries accepted
  const enableSubmit = () => { if (meetEntryAccepted) setSubmitState(submitBtn, true); };
  // attach to existing and future selects/inputs
  const attachListeners = () => {
    const selects = frmSwSelectedEvents.querySelectorAll('select.event-dropdown');
    selects.forEach(s => {
      s.removeEventListener('change', enableSubmit);
      s.addEventListener('change', enableSubmit);
    });
    const times = frmSwSelectedEvents.querySelectorAll('input[id^="SwimmersBestTime"]');
    times.forEach(t => {
      t.removeEventListener('input', enableSubmit);
      t.addEventListener('input', enableSubmit);
    });
  };
  attachListeners();

  // If entries are not accepted, keep submit disabled
  if (!meetEntryAccepted) {
    setSubmitState(submitBtn, false);
  }

  // update dropdowns to disable already selected options
  for (let i = 1; i <= NoOFEvents; i++) {
    try { updateDropdowns(i); } catch (e) { /* ignore */ }
  }
  // re-attach listeners in case update created/changed elements
  attachListeners();
  ClearAllPop();
}

function CheckGroup(dobInput, meetData) {
  const dob = new Date(dobInput);
  const groups = meetData && meetData.GroupDetails;
  if (!groups) return "";

  const groupArray = Array.isArray(groups)
    ? groups
    : Object.keys(groups).map(key => {
        const g = groups[key] || {};
        return {
          FromDate: g.FromDate,
          ToDate: g.ToDate,
          GroupName: g.GroupName || key
        };
      });

  const eligibleGroups = groupArray.filter(group => {
    const from = new Date(group.FromDate);
    const to = new Date(group.ToDate);
    return !isNaN(from) && !isNaN(to) && dob >= from && dob <= to;
  });

  return eligibleGroups.length > 0
    ? eligibleGroups.map(g => g.GroupName).join(", ")
    : "";
}
async function FetchMeetNames() {

  ShowActivitypop("Updating MeetNames..");
  var dataAPI = fetch(MeetRegInfoFBURL)
    .then(response => {
      // ClearAllPop();
      return response.json();
    })
    .then(data => {
      MeetRegData = data;
      FillMeetnames(MeetRegData);
      ClearAllPop();

      return MeetRegData;

    })
    .catch(error => {
      ClearAllPop();
      ShowMessagepop("Failed To Fetch MeetNames..");
      console.error('onRejected function called: ' + error.message);
    });

  return dataAPI;
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