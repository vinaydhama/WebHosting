function showPopup(message) {
    document.getElementById("popupMessage").textContent = message;
    document.getElementById("customPopup").style.display = "flex";
  }

  function onOk() {
    // alert("You clicked OK");
    document.getElementById("MessagePop").style.display = "none";
    document.getElementById("overlaypop").style.display = "none";


  }

  function onCancel() {
    // alert("You clicked Cancel");    
    document.getElementById("MessagePop").style.display = "none";
    document.getElementById("overlaypop").style.display = "none";

  }

  function showMessagePop_old(Show,Message="")
  {
    showhideDiv(false,"ActivityPop");
    const MessagePop = document.getElementById("MessagePop");
    if (MessagePop)
      {      
        if (Show)
          {
            MessagePop.style.display='block'
            MessagePop.style.display = "flex";
          }
          else
          {
            MessagePop.style.display='none'
          }
          const popupMessage =  document.getElementById("popupMessage");
          if (popupMessage)
            {
              popupMessage.textContent = Message;
            }
      }

  }


// function showPopup(overlaypop) {
//   document.getElementById(overlaypop).classList.add('show');
// }

// function hidePopup(overlaypop) {
//   document.getElementById(overlaypop).classList.remove('show');
//   showhideDiv(false, overlaypop, "");
// }

function showhideDiv(state, id, BusyMsg = "") {
  try {
    if (BusyMsg != "") {
      var BusyMsgobj = document.getElementById("BusyPopMsg");
      if (BusyMsgobj)
        {
      BusyMsgobj.innerText = BusyMsg;
        }

        var popupMessage = document.getElementById("popupMessage");
      if (popupMessage)
        {
          popupMessage.innerText = BusyMsg;
        }
    }
    
    var e = document.getElementById(id);
    if (e) {
      if (state == true) {
        e.style.display = 'block'
      }
      else {
        e.style.display = 'none'
      }
    }
    // e.style.display = (e.style.display == 'block') ? 'none' : 'block';
  } catch (error) {

  }
}

function ShowMessagepop(MessageToDisp, MsgpopName="MessagePop",OverlaypopName="overlaypop")
{
  ClearAllPop();
  showPopup(OverlaypopName)
  // showhideDiv(true,OverlaypopName);
  showhideDiv(true,MsgpopName, MessageToDisp);
}

function ShowActivitypop(MessageToDisp, ActivitypopName="ActivityPop",OverlaypopName="overlaypop")
{
  ClearAllPop();
  showPopup(OverlaypopName)

  // showhideDiv(true,OverlaypopName);
  showhideDiv(true,ActivitypopName,MessageToDisp);
}

function ClearAllPop(OverlaypopName="overlaypop",ActivitypopName="ActivityPop",MsgpopName="MessagePop")
{
  hidePopup(OverlaypopName)
  // showhideDiv(false,OverlaypopName);
  showhideDiv(false,ActivitypopName);
  showhideDiv(false,MsgpopName);
}


function showPopup(popName) {
  const popobj= document.getElementById(popName);
  if (popobj)
  {
    popobj.classList.add('show')
    // popobj.style.display='block';

  }

}

function hidePopup(popName) {
  // document.getElementById('popupOverlay').classList.remove('show');

  const popobj= document.getElementById(popName);
  if (popobj)
  {
    popobj.classList.remove('show')
    // popobj.style.display='none';
  }
}