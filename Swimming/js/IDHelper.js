
function GenerateQRWithLogo(data, canvasId, logoId, Encode = true, QRwidth = 300) {
  const canvas = document.getElementById(canvasId);
  const logo = document.getElementById(logoId);

  let encodedData = "";
  if (Encode) {
    encodedData = btoa(JSON.stringify(data));
  }
  else {
    encodedData = JSON.stringify(data);

  }

  QRCode.toCanvas(canvas, encodedData, { width: QRwidth }, function (error) {
    if (error) return console.error(error);

    const ctx = canvas.getContext("2d");

    // Wait for logo to load
    logo.onload = function () {
      const logoSize = 40; // Size of the logo
      const x = (canvas.width - logoSize) / 2;
      const y = (canvas.height - logoSize) / 2;
      ctx.drawImage(logo, x, y, logoSize, logoSize);
    };

    // If logo is already loaded (cached), draw immediately
    if (logo.complete) {
      logo.onload();
    }
  });
}


function DownloadIDcard(idcardplaceholder, imagePlaceholder, name = "User", FilePrefix = "") {
  const element = document.getElementById(idcardplaceholder);
  const img = document.getElementById(imagePlaceholder);

  if (!element || !img) {
    console.error("Element or image not found.");
    alert("Unable to find ID card or image element.");
    return;
  }

  const promises = [];

  if (!img.complete || img.naturalWidth === 0) {
    promises.push(new Promise(resolve => {
      img.onload = resolve;
      img.onerror = resolve; // Resolve even if image fails to load
    }));
  }

  Promise.all(promises).then(() => {
    html2canvas(element, {
      useCORS: true,
      allowTaint: false,
      logging: false
    }).then(canvas => {
      const link = document.createElement('a');
      const prefix = FilePrefix ? FilePrefix + "_" : "";
      link.download = `${prefix}${name}_ID_Card.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }).catch(error => {
      console.error("Canvas rendering failed:", error);
      alert("Failed to generate ID card image.");
    });
  });
}


function UpdateEventID(userinfo, datatopost, ParentContainer) {

  // let now = new Date();
  document.getElementById(ParentContainer).style.display = 'block';
  if (userinfo.photoPath !== undefined) {
    document.getElementById("ProfileImg").src = userinfo.photoPath;
  }
  document.getElementById("id").innerText = userinfo.swimmer_id;
  document.getElementById("name").innerText = userinfo.name;
  document.getElementById("dob").innerText = userinfo.dob;
  document.getElementById("club").innerText = userinfo.clubname;
  document.getElementById("school").innerText = userinfo.schoolname;
  document.getElementById("Eventname").innerText = datatopost.MeetName;
  document.getElementById("EventDate").innerText = datatopost.MeetDate;
  document.getElementById("EventAddress").innerText = datatopost.MeetAddress;
  document.getElementById("RegTime").innerText =  datatopost.RegTime;

  let QRData = {
    "id": userinfo.swimmer_id,
    "name": userinfo.name,
    "dob": userinfo.dob,
    "club": userinfo.clubname,
    "school": userinfo.schoolname,
    "Eventname": datatopost.MeetName,
    "EventDate": datatopost.MeetDate,
    "EventAddress": datatopost.MeetAddress,
    "RegTime": datatopost.RegTime
  }
  let Combined = Object.assign({}, QRData, datatopost)
  GenerateQRWithLogo(Combined, 'EventQRCodeDisp', 'logo', true)
  let MeetAddress= datatopost.MeetAddress
  GenerateQRWithLogo(MeetAddress, 'EventLocationQRCodeDisp', '', true, 100)
}
function UpdateUserDetailsID(userinfo, ParentContainer) {
  let gender = userinfo.gender === "1" ? 'M' : userinfo.gender === "2" ? 'F' : 'O';
  document.getElementById(ParentContainer).style.display = 'block';
  document.getElementById("Ename").innerText = userinfo.name;
  document.getElementById("Eid").innerText = userinfo.swimmer_id;
  document.getElementById("Edob").innerText = userinfo.dob;
  document.getElementById("Egender").innerText = gender;
  document.getElementById("Eclub").innerText = userinfo.clubname;
  document.getElementById("Eschool").innerText = userinfo.schoolname;
  document.getElementById("Emobile").innerText = userinfo.phone;
  if (userinfo.photoPath !== undefined) {
    document.getElementById("EProfileImg").src = userinfo.photoPath;
  }
  let QRData = {
    "name": userinfo.name,
    "id": userinfo.swimmer_id, "dob": userinfo.dob,
    "gender": gender, "club": userinfo.clubname, "school": userinfo.schoolname, "mobile": userinfo.phone
  }
  GenerateQRWithLogo(QRData, 'EejoQRCodeDisp', 'logo', true)

}
