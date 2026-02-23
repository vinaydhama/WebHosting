
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('folded');
}

function toggleProfilePopup(docid = "profilePopup") {
  const popup = document.getElementById(docid);
  if (popup) {
    popup.style.display = popup.style.display === 'block' ? 'none' : 'block';
  }
}


window.onclick = function (event) {
  const popup = document.getElementById('profilePopup');
  if (popup) {
    if (!event.target.closest('.profile')) {
      popup.style.display = 'none';
    }
    if (event.target.closest('.profile-popup')) {
      popup.style.display = 'none';
    }
  }

  const sidebar = document.getElementById('sidebar');
  if (sidebar) {   
    if (!event.target.closest('.toggle-sidebar')) { 
      document.getElementById('sidebar').classList.add('folded');
    }
  }
}

function toggleDarkMode() {
  document.body.classList.toggle('light-mode');
}

function ReadSessionData(DataName) {
  switch (DataName) {
    case "user":
      let user = JSON.parse(sessionStorage.getItem("swimmerData"));
      if (user) {
        return user;
      }
      break;

      case "datatopost":
      let DataToPost = JSON.parse(sessionStorage.getItem("datatopost"));
      if (DataToPost) {
        return DataToPost;
      }
      break;

    default:
      break;
  }
}
function UpdateProfilePage(user) {
  if (user) {
    document.getElementById("lblUserName").innerText = user.name;
    document.getElementById("UserPhoto").src = user.photoPath;
  }

}


function openPrintWindow(IDType,user,ParentDev,datatopost) {  
  sessionStorage.setItem("datatopost", JSON.stringify(datatopost));
  window.open(`IDcard.html?IDType=${encodeURIComponent(IDType)}&user=${user}&ParentDev=${ParentDev}`, 'PrintWindow', 'width=800,height=600');
}



