let MeetDataFirebaseBaseURL = "https://eejo-managerdb-default-rtdb.firebaseio.com/Meets/";
let MeetRegInfoFBURL = "https://eejo-managerdb-default-rtdb.firebaseio.com/Meets/MeetRegInfo.json";
let SwimmerID = "";
let Name = "VinayXXX";
let DOB = "01-01-2025";
let ElegableGroup = "G01";
let NoOFEvents = 0;



document.addEventListener("DOMContentLoaded", () => {
  const sidebar= document.getElementById('sidebar');
  if (sidebar)
    {
      toggleSidebar();
    }
  // document.getElementById('MessagePop').show();
  // showhideDiv(false,"overlaypop");
  // showhideDiv(false,"MessagePop");
  // showhideDiv(false,"ActivityPop");

  ClearAllPop();
});

// function DisplayMeetRegister(MeetNameSelected, meetData) {
//   // Display meet info
//   document.getElementById("meetName").textContent = `Meet: ${meetData[MeetNameSelected].MeetName}`;
//   document.getElementById("meetAddress").textContent = `Address: ${meetData[MeetNameSelected].MeetAddress}`;
//   document.getElementById("meetDate").textContent = `Date: ${meetData[MeetNameSelected].MeetDate}`;
//   ElegableGroup = CheckGroup(DOB, meetData[MeetNameSelected]);
//   ListApplicableEvents(ElegableGroup, meetData[MeetNameSelected]);
//   // Check if MeetDate is in the future
//   const today = new Date();
//   const meetDate = new Date(meetData[MeetNameSelected].MeetDate);

//   if (meetDate > today) {
//     document.getElementById("registerBtn").style.display = "inline-block";
//   }

// }
// function AddEventEntries() {
//   const HeatSelector = document.getElementById('meetSelect');
//   if (HeatSelector) {
//     let swEvents = []

//     for (let index = 1; index <= NoOFEvents; index++) {
//       let SwimmersEventSelector = document.getElementById("SwimmersEventSelector" + index);
//       let SwimmersBestTime = document.getElementById("SwimmersBestTime" + index);
//       if (SwimmersEventSelector) {
//         if (SwimmersBestTime) {
//           swEvents.push({ "Available": false, "BestTimeings": SwimmersBestTime.value, "EventName": SwimmersEventSelector.value });
//         }
//       }


//     }

//     datatopost = { "club": "clu", "Group": ElegableGroup, "ID": SwimmerID, "Events": swEvents };
//     let FirebaseURL = MeetDataFirebaseBaseURL + HeatSelector.value + "/SwimmerDetails/" + Name + ".json"

//     SaveEventToFB(FirebaseURL, datatopost)
//   }
// }
// function ReadSessionData() {
//   // Extract Swimmer ID, Name, and DOB
//   const user = JSON.parse(sessionStorage.getItem("swimmerData"));
//   if (user) {
//     // const swimmerInfo = Object.entries("swimmerData").map(([key, details]) => ({
//     SwimmerID = user.swimmer_id;
//     Name = user.name,
//       DOB = user.dob
//     // }));

//     console.log(user);

//   }
//   // const swimmerName = Name;
//   // Display greeting
//   document.write(`Hello "${Name}"`);
// }
// // Get reference to the select box
// function FillMeetnames(MeetRegData) {
//   const selectBox = document.getElementById("meetSelect");

//   // Populate select box with keys under "Meets"
//   Object.keys(MeetRegData).forEach(meetName => {
//     const option = document.createElement("option");
//     option.value = meetName;
//     option.textContent = meetName;
//     selectBox.appendChild(option);
//   });
// }

// function ListApplicableEvents(selectedGroup, meetData) {
//   const filteredEvents = meetData.EventList.filter(event => event.includes(`_${selectedGroup}_`));
//   NoOFEvents = meetData.NoOFEvents;
//   const frmSwSelectedEvents = document.getElementById("frmEvet");
//   frmSwSelectedEvents.innerHTML = "";
//   for (let index = 1; index <= meetData.NoOFEvents; index++) {
//     CreateEventSelector(index, filteredEvents);
//     AddTimeValidators("SwimmersBestTime" + index)

//   }
// }

// function CheckGroup(dobInput, meetData) {
//   const dob = new Date(dobInput);
//   const eligibleGroups = meetData.GroupDetails.filter(group => {
//     const from = new Date(group.FromDate);
//     const to = new Date(group.ToDate);
//     return dob >= from && dob <= to;
//   });

//   let eligibleGroup = ""
//   if (eligibleGroups.length > 0) {
//     eligibleGroup = eligibleGroups.map(g => g.GroupName).join(", ");
//   }
//   return eligibleGroup;
// }
// async function FetchMeetNames() {
//   var dataAPI = fetch(MeetRegInfoFBURL)
//     .then(response => {
//       return response.json()
//     })
//     .then(data => {
//       MeetRegData = data;
//       FillMeetnames(MeetRegData);
//       return MeetRegData;
//     }, error => {
//       console.error('onRejected function called: ' + error.message);
//     })
// }

// async function SaveEventToFB(FirebaseURL, DataTopost) {
//   //showhide("BusyIndicatorpop", "Writing To Cloud");
//   await fetch(FirebaseURL, {
//     method: "PUT",
//     body: JSON.stringify(DataTopost),
//     headers: {
//       "Content-type": "application/json; charset=UTF-8"
//     }
//   });
//   //showhide("BusyIndicatorpop");
// }

// function AddTimeValidators(TimeID) {

//   const SwimmersBestTime = document.getElementById(TimeID);
//   if (SwimmersBestTime) {
//     SwimmersBestTime.addEventListener("input", () => {
//       const regex = /^\d{2}:\d{2}\.\d{3}$/;
//       if (!regex.test(SwimmersBestTime.value)) {
//         SwimmersBestTime.setCustomValidity("Please enter time in mm:ss.sss format.");
//         SwimmersBestTime.reportValidity();
//       } else {
//         SwimmersBestTime.setCustomValidity("");
//       }
//     });
//   }
// }
// function CreateEventSelector(Selectindex, AvailableEvents) {
//   const frmSwSelectedEvents = document.getElementById("frmEvet");
//   const select = document.createElement("select");
//   select.id = "SwimmersEventSelector" + Selectindex;
//   select.className = "event-dropdown";
//   select.setAttribute("onchange", "updateDropdowns(" + Selectindex + ")");

//   // Add default option
//   const defaultOption = document.createElement("option");
//   defaultOption.value = "";
//   defaultOption.textContent = "--Select Event--";
//   select.appendChild(defaultOption);

//   // Populate dropdown with available events
//   AvailableEvents.forEach(event => {
//     const option = document.createElement("option");
//     option.value = event;
//     option.textContent = event;
//     select.appendChild(option);
//   });

//   // Create time input
//   const timeInput = document.createElement("input");
//   timeInput.type = "text";
//   timeInput.id = "SwimmersBestTime" + Selectindex;
//   timeInput.placeholder = "mm:ss.sss";
//   timeInput.disabled = true;


//   // Append elements to cell
//   frmSwSelectedEvents.appendChild(select);
//   frmSwSelectedEvents.appendChild(timeInput);

//   // Append table to body or a container
//   // document.body.appendChild(tblSwSelectedEvents);
// }

// function updateDropdowns(Selectindex) {
//   const selectedEvents = new Set();
//   const txtSelectindex = document.getElementById("SwimmersBestTime" + Selectindex);
//   txtSelectindex.disabled = false;
//   const selects = document.querySelectorAll("select.event-dropdown");
//   selects.forEach(select => {
//     if (select.value) {
//       selectedEvents.add(select.value);
//     }
//   });
//   selects.forEach(select => {
//     const currentValue = select.value;
//     Array.from(select.options).forEach(option => {
//       option.disabled = selectedEvents.has(option.value) && option.value !== currentValue;
//     });
//   });
// }

// function UpdateUserDetailsID(userinfo, ParentContainer) {
//   let gender = userinfo.gender === "1" ? 'M' : userinfo.gender === "2" ? 'F' : 'O';
//   document.getElementById(ParentContainer).style.display = 'block';
//   document.getElementById("Eid").innerText = userinfo.swimmer_id;
//   document.getElementById("Edob").innerText = userinfo.dob;
//   document.getElementById("Egender").innerText = gender;
//   document.getElementById("Eclub").innerText = userinfo.clubname;
//   document.getElementById("Eschool").innerText = userinfo.schoolname;
//   document.getElementById("Emobile").innerText = userinfo.phone;
//   if ( userinfo.photoPath!= ""  )
//     {
//   document.getElementById("EProfileImg").src = userinfo.photoPath;
//     }
//   let QRData = {
//     "id": userinfo.swimmer_id, "dob": userinfo.dob,
//     "gender": gender, "club": userinfo.clubname, "school": userinfo.schoolname, "mobile": userinfo.phone
//   }
//   GenerateQRWithLogo(QRData, 'EejoQRCodeDisp', 'logo',true)

// }