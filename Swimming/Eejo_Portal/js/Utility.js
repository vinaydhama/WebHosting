
function showhideDiv(state, id, BusyMsg = "") {
    try {
if (BusyMsg!="")

{
var BusyMsgobj = document.getElementById("BusyMsg");
BusyMsgobj.innerHTML = BusyMsg
}

var e = document.getElementById(id);
if (e)
    {
if (state==true)
{
    e.style.display ='block'
}
else
{
    e.style.display ='none'
}
    }
// e.style.display = (e.style.display == 'block') ? 'none' : 'block';
} catch (error) {
        
}
}


function formatDateManually(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
  
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
  
    return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
  }
  
  
function isValidTimeFormat(input) {
    const regex = /^([0-5]?\d):([0-5]?\d)\.(\d{1,3})$/;
    return regex.test(input);

}
function formatToCustomDate(datetimeLocalValue) {
    const date = new Date(datetimeLocalValue);
  
    const day = String(date.getDate()).padStart(2, '0');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
  
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert to 12-hour format
  
    return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
  }  
  
  function ConvertStringTimeToSecond(timeStr) {
    const [minutes, rest] = timeStr.split(':');
    const [seconds, milliseconds] = rest.split('.');
  
    const totalSeconds = parseInt(minutes) * 60 + parseInt(seconds) + parseInt(milliseconds) / 1000;
    return totalSeconds;
  }
function convertToDateTimeLocalFormat(dateStr) {
    // Split the string into parts
    const [datePart, timePart, ampm] = dateStr.split(' ');
    const [day, monthStr, year] = datePart.split('-');
    const [hourStr, minuteStr] = timePart.split(':');
  
    // Map month abbreviation to number
    const monthMap = {
      Jan: '01', Feb: '02', Mar: '03', Apr: '04',
      May: '05', Jun: '06', Jul: '07', Aug: '08',
      Sep: '09', Oct: '10', Nov: '11', Dec: '12'
    };
  
    // Convert hour to 24-hour format
    let hour = parseInt(hourStr, 10);
    if (ampm === 'PM' && hour < 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;
  
    // Pad values and construct final string
    const formatted = `${year}-${monthMap[monthStr]}-${day.padStart(2, '0')}T${String(hour).padStart(2, '0')}:${minuteStr}`;
    return formatted;
  }
  
//   // Example usage:
//   const value = "23-Aug-2025 6:13 PM";
//   const formattedDate = formatDateTimeLocal(value);
//   cells[i].innerHTML = `<input type="datetime-local" value="${formattedDate}" />`;
  
  