import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, addDoc, updateDoc, getDoc, deleteDoc, query, where } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

const QUOTATION_COLL = "Quotations";
const SEEDED_DATA_COLL = "Seeded_Data";
const GREETINGS_DOC_ID = "Greetings_Doc";
const DELIVERABLES_DOC_ID = "Deliverables";
const TERMS_AND_CONDITIONS_DOC_ID = "Terms_And_Conditions_Doc";
const WHATSAPP_MESSAGE_ID = "Whatsapp_message";
const QUOTATION_HOST = "Quotation_Host";
let db;
let documentId;
let eventsCount = 1;
let termsAndConditionsCount = 0;
let deliverablesCount = 0;
let greetingsCount = 0;
let documentUrl;
let hostUrl;
let createInProgress = false;
let editInProgress = false;
let oldTitleInEdit;

// Pagination variables
let allQuotations = [];
let currentPage = 1;
const itemsPerPage = 15;

// Initialize fireBase
function initDB() {
  // Your Firebase configuration object
  const firebaseConfig = {
    apiKey: "AIzaSyAIA7kvRB9QIovVY7JmYjvG4C8nCvEoCFQ",
    authDomain: "test-ddr.firebaseapp.com",
    projectId: "test-ddr",
    storageBucket: "test-ddr.firebasestorage.app",
    messagingSenderId: "295918037477",
    appId: "1:295918037477:web:eb751a64d1a81094ee670c"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  getQuotationHost();
  fetchQuotations();
}

async function getQuotationHost() {
  const data = await getDocumentData(SEEDED_DATA_COLL, QUOTATION_HOST);
  hostUrl = data.Quotation_host;
}

// Add a quotation to fireBase
async function addQuotation(quotation, deliverablesObj) {

  // Add data
  const now = new Date();

  const day = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-indexed
  const year = now.getFullYear().toString();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');

  const formattedDateTime = `${day}-${month}-${year} ${hours}:${minutes}`;

  const today = new Date();
  today.setDate(today.getDate() + 14); // Changed from 7 to 14 days
  // Format the date as dd-MMM-yyyy
  const options = { day: '2-digit', month: 'short', year: 'numeric' };
  let formatedToday = today.toLocaleDateString('en-US', options).replace(',', '');

  const quotationCollectionRef = collection(db, QUOTATION_COLL); // Reference to the 'Quotations' collection

  const quotationData = {
    title: quotation.title,
    price: quotation.price,
    created_date: formattedDateTime,
    events: quotation.events,
    status: "Draft",
    addGst: quotation.addGst,
    validUpTo: editInProgress ? document.getElementById("editValidUpToId").value : formatedToday.split(" ")[1] + "-" + formatedToday.split(" ")[0] + "-" + formatedToday.split(" ")[2],
    mobile: quotation.mobile,
    splitTeam: quotation.splitTeam,
    Albums_Addon: quotation.Albums_Addon,
    HD_Changed: quotation.HD_Changed,
    LED_Changed: quotation.LED_Changed,
    WebLive_Changed: quotation.WebLive_Changed,
    pwpsRequired: quotation.pwpsRequired,
    droneRequired: quotation.droneRequired,
  };
  if (quotation.Albums_Addon) {
    quotationData.Albums_Addon_Changed = quotation.Albums_Addon_Changed;
    if (quotation.Albums_Addon_Changed) {
      quotationData.Albums_Addon_Price = quotation.Albums_Addon_Price;
      quotationData.Albums_Addon_Photos = quotation.Albums_Addon_Photos;
    }
  }
  if (quotation.HD_Changed) {
    quotationData.HD_Count = quotation.HD_Count;
    quotationData.HD_Size = quotation.HD_Size;
  }
  if (quotation.LED_Changed) {
    quotationData.LED_Price = quotation.LED_Price;
  }
  if (quotation.WebLive_Changed) {
    quotationData.WebLive_Price = quotation.WebLive_Price;
    quotationData.WebLive_Time = quotation.WebLive_Time;
  }
  if (quotation.pwpsRequired) {
    quotationData.pwpsChange = quotation.pwpsChange;
    if (quotation.pwpsChange) {
      quotationData.preWeddingPhotoShoot = quotation.preWeddingPhotoShoot;
    }
  }
  if (deliverablesObj.delChange) {
    quotationData.delChange = deliverablesObj.delChange;
    quotationData.display_del_raw_data = deliverablesObj.disPlayDelRawData;
    quotationData.display_del_long_videos = deliverablesObj.disPlayDelLongVideos;
    quotationData.display_del_photos = deliverablesObj.disPlayDelPhotos;
    quotationData.display_del_albums = deliverablesObj.disPlayDelAlbums;
    quotationData.display_del_films = deliverablesObj.disPlayDelFilms;
    quotationData.display_del_reels = deliverablesObj.disPlayDelReels;

    if (deliverablesObj.disPlayDelRawData && deliverablesObj.changeDelRawData) {
      quotationData.del_raw_data = deliverablesObj.updatedDelRawData;
    }
    if (deliverablesObj.disPlayDelLongVideos && deliverablesObj.changeDelLongVideos) {
      quotationData.del_long_videos = deliverablesObj.updatedDelLongVideos;
    }
    if (deliverablesObj.disPlayDelPhotos && deliverablesObj.changeDelPhotos) {
      quotationData.del_photos = deliverablesObj.updatedDelPhotos;
    }
    if (deliverablesObj.disPlayDelAlbums && deliverablesObj.changeDelAlbums) {
      quotationData.del_albums = deliverablesObj.updatedDelAlbums;
    }
    if (deliverablesObj.disPlayDelFilms && deliverablesObj.changeDelFilms) {
      quotationData.del_films = deliverablesObj.updatedDelFilms;
    }
    if (deliverablesObj.disPlayDelReels && deliverablesObj.changeDelReels) {
      quotationData.del_reels = deliverablesObj.updatedDelReels;
    }
  }
  try {
    if (editInProgress) {
      const editDocId = document.getElementById("editDocumentId").value;
      const docRef = doc(db, QUOTATION_COLL, editDocId);
      await updateDoc(docRef, quotationData);
      documentId = editDocId;
    }
    if (createInProgress) {
      const docRef = await addDoc(quotationCollectionRef, quotationData);
      documentId = docRef.id;
    }
    let urlTitle = quotation.title.replace(" & ", "-");
    //documentUrl = `quotation.html?id=${urlTitle}:::${documentId}`;
    documentUrl = `/${urlTitle}`;

    // Open the quotation in a new tab
    window.open(hostUrl + documentUrl, "_blank");
  } catch (error) {
    showToast("Error adding document: "+ error, "error");
  }
  const docRef = doc(db, QUOTATION_COLL, documentId);

  const updatedData = {
    ['url']: documentUrl, // Dynamically set the field to update
  };
  await updateDoc(docRef, updatedData);

  document.getElementById("quotationForm").reset();

  document.getElementById("formContainer").classList.toggle("hidden");
  createInProgress = false;
  editInProgress = false;
  fetchQuotations();

}

function sortTableByDate() {
  allQuotations.sort((a, b) => {
    let dateA = a.created_date;
    let dateB = b.created_date;

    // Convert "dd-mm-yyyy hh:mm" to Date object for comparison
    let timestampA = new Date(dateA.split(" ")[0].split("-").reverse().join("-") + "T" + dateA.split(" ")[1]);
    let timestampB = new Date(dateB.split(" ")[0].split("-").reverse().join("-") + "T" + dateB.split(" ")[1]);

    return timestampB - timestampA; // Descending order (latest first)
  });
}

function renderPage() {
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageData = allQuotations.slice(start, end);

  const tableBody = document.querySelector("#quotationTable tbody");
  tableBody.innerHTML = "";

  pageData.forEach((quotation) => {
    const row = document.createElement("tr");
    let completeUrl = hostUrl + `${quotation.url}`
    documentUrl = quotation.url;
    
    // Determine status icon and color
    let statusDisplay = '🧼 Draft';
    let statusClass = 'status-draft';
    
    if (quotation.status == "Expired") {
      statusDisplay = '🔶 Expired';
      statusClass = 'status-expired';
    } else if (quotation.status == "Sent") {
      statusDisplay = '🔷 Sent';
      statusClass = 'status-sent';
    } else if (quotation.status == "Accepted") {
      statusDisplay = '✅ Accepted';
      statusClass = 'status-accepted';
    } else if (quotation.status == "Rejected") {
      statusDisplay = '🔴 Rejected';
      statusClass = 'status-rejected';
    }
    
    // Build actions menu
    let actionButtons = '';
    const docId = quotation.id;
    if (quotation.status == "Expired") {
      actionButtons = `
        <button class="action-btn" value="${docId}" id="activateQuotation-${docId}" style="color: var(--primary);">Activate</button>
      `;
    } else if (quotation.status == "Sent" || quotation.status == "Accepted" || quotation.status == "Rejected" || quotation.status == "Draft") {
      actionButtons = `
        <button class="action-btn" value="${docId}" id="editProposal-${docId}" style="color: var(--primary);">Edit</button>
        <button class="action-btn success" value="${docId}" id="acceptQuotation-${docId}">Accept</button>
        <button class="action-btn danger" value="${docId}" id="rejectQuotation-${docId}">Reject</button>
        <button class="action-btn danger" value="${docId}" id="expireQuotation-${docId}">Expire</button>
        <button class="action-btn danger" value="${docId}" id="deleteQuotation-${docId}">Delete</button>
      `;
    }
    
    let quoteHTML = `
        <td data-label="Title">${quotation.title}</td>
        <td data-label="Price">₹${quotation.price}/-</td>
        <td data-label="Quotation"><a href="${completeUrl}" target="_blank">Open</a></td>
        <td data-label="Mobile">+${quotation.mobile}</td>
        <td data-label="Share"><i onclick="sendWhatsAppMessage(${quotation.mobile},'${docId}')" class="fa fa-whatsapp" style="cursor: pointer;font-size:24px;"></i></td>
        <td data-label="Status"><span class="${statusClass}">${statusDisplay}</span></td>
        <td data-label="Validity">${quotation.validUpTo}</td>
        <td data-label="Created">${quotation.created_date}</td>
        <td data-label="Actions">
          <div class="action-menu-container">
            <button class="action-menu-btn" onclick="toggleActionMenu(event)">⋮</button>
            <div class="action-menu-dropdown">
              ${actionButtons}
            </div>
          </div>
        </td>
      `;
    
    row.innerHTML = quoteHTML;
    tableBody.appendChild(row);
  });

  // Update pagination info
  const totalPages = Math.ceil(allQuotations.length / itemsPerPage);
  document.getElementById("pageInfo").textContent = `Page ${currentPage} of ${totalPages}`;
  document.getElementById("prevPage").disabled = currentPage === 1;
  document.getElementById("nextPage").disabled = currentPage === totalPages;

  // Show/hide pagination
  if (totalPages > 1) {
    document.getElementById("paginationContainer").classList.remove("hidden");
  } else {
    document.getElementById("paginationContainer").classList.add("hidden");
  }
}

// Fetch quotations from fireBase
async function fetchQuotations() {
  document.getElementById("formContainer").classList.add("hidden");
  document.getElementById("quotationTable").classList.remove("hidden");
  document.getElementById("quotationTable").classList.add("active-table");
  document.getElementById("paginationContainer").classList.remove("hidden");
  document.getElementById("termsAndConditionsSection").classList.add("hidden");
  document.getElementById("deliverablesSection").classList.add("hidden");
  document.getElementById("greetingsSection").classList.add("hidden");
  const quotationCollectionRef = collection(db, QUOTATION_COLL); // Reference to the 'Quotations' collection
  try {
    const querySnapshot = await getDocs(quotationCollectionRef);
    allQuotations = [];
    querySnapshot.forEach((doc) => {
      allQuotations.push({ id: doc.id, ...doc.data() });
    });
    sortTableByDate();
    currentPage = 1;
    renderPage();

  } catch (error) {
    showToast("Error fetching Quotations: "+ error, "error");
  }
}

// Pagination button handlers
document.getElementById("prevPage").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderPage();
  }
});

document.getElementById("nextPage").addEventListener("click", () => {
  const totalPages = Math.ceil(allQuotations.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderPage();
  }
});

// Toggle action menu visibility
function toggleActionMenu(event) {
  event.stopPropagation();
  const button = event.currentTarget;
  const dropdown = button.nextElementSibling;
  
  // Close all other open menus
  document.querySelectorAll('.action-menu-dropdown.active').forEach(menu => {
    if (menu !== dropdown) {
      menu.classList.remove('active');
    }
  });
  
  dropdown.classList.toggle('active');
}

// Close menus when clicking outside
document.addEventListener('click', function(event) {
  if (!event.target.closest('.action-menu-container')) {
    document.querySelectorAll('.action-menu-dropdown.active').forEach(menu => {
      menu.classList.remove('active');
    });
  }
});

// Handle action button clicks
document.addEventListener('click', function(event) {
  if (event.target.classList.contains('action-btn') || event.target.closest('.action-btn')) {
    const button = event.target.classList.contains('action-btn') ? event.target : event.target.closest('.action-btn');
    const id = button.id;
    const value = button.value;
    
    // Close the menu
    document.querySelectorAll('.action-menu-dropdown.active').forEach(menu => {
      menu.classList.remove('active');
    });
    
    // Handle different action types
    if (id.startsWith('expireQuotation')) {
      updateQuotationStatus(value, "Expired");
    } else if (id.startsWith('activateQuotation')) {
      updateQuotationStatus(value, "Draft");
    } else if (id.startsWith('rejectQuotation')) {
      updateQuotationStatus(value, "Rejected");
    } else if (id.startsWith('acceptQuotation')) {
      updateQuotationStatus(value, "Accepted");
    } else if (id.startsWith('deleteQuotation')) {
      deleteQuotation(value);
    } else if (id.startsWith('editProposal')) {
      editProposal(value);
    }
  }
});

function addEventsForEdit(eventData, eCnt) {
  let eventDateVal = (eventData.date == 'TBD') ? `TBD` : `${eventData.date.split("-")[2]}-${eventData.date.split("-")[1]}-${eventData.date.split("-")[0]}`;
  const eventSection = document.getElementById('eventSection');
  const newEvent = document.createElement('div');
  newEvent.setAttribute("id", "Event-" + eCnt);
  newEvent.classList.add('event');
  let eventDateType = (eventDateVal == 'TBD') ? "text" : "date";
  newEvent.innerHTML = `<div style="display: flex; flex-direction: row; flex-wrap: wrap; margin: 20px; gap:20px">
                                <h3>Event</h3>
                                <i class="fa fa-trash-o" title="Remove Current Event"
                                    style="cursor: pointer;padding: 10px;font-size:30px;color:red" onclick="removeSelectedEvent(${eCnt})"></i>
                            </div>
                          <div style="display: flex; flex-direction: row; flex-wrap: wrap; margin: 20px; gap:20px">
                            <div style="display: flex; flex-direction: column; gap: 5px;">
                                <label for="eventName">Event Name : </label>
                                <input type="text"  id="eventNameId-${eCnt}" name="eventName" required value="${eventData.name}">
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 5px;">
                                <label for="eventLocation">📍 Location : </label>
                                <input id="eventLocationId-${eCnt}" type="text" name="eventLocation" required value="${eventData.location}">
                                <label for="eventLocationTBD"> TBD
                                    <input id="eventLocationTBD-${eCnt}" name="eventLocationTBD" type="checkbox" onclick="toggleInput(this,${eCnt})">
                                </label>
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 5px;">
                                <label for="eventDate">📆 Date : </label>
                                <input id="eventDateId-${eCnt}" type=${eventDateType} name="eventDate" required value="${eventDateVal}">
                                <label for="eventDateTBD"> TBD
                                    <input id="eventDateTBD-${eCnt}" name="eventDateTBD" type="checkbox"  onclick="toggleInput(this,${eCnt})">
                                </label>
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 5px;">
                                <label for="eventDetails">Details : </label>
                                <textarea id="eventDetails-${eCnt}" rows="3" cols="30" name="eventDetails" value="${eventData.eventDetails}"></textarea>
                            </div>
                        </div>
                          <div style="display: flex; flex-direction: row; flex-wrap: wrap;margin: 20px;  gap:20px">
                            <div style="display: flex; flex-direction: column; gap: 5px;">
                                <label for="cinematographers">🎥 Cinematographers : </label>
                                <input id="cinematographers-${eCnt}" type="number" name="cinematographers" min="0" required value="${eventData.cinematographers}">
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 5px;">
                                <label for="candidPhotographers">📷 Candid Photographers : </label>
                                <input id="candidPhotographers-${eCnt}" type="number" name="candidPhotographers" min="0" required value="${eventData.candidPhotographers}">
                            </div>
                        </div>
                        <div style="display: flex; flex-direction: row; flex-wrap: wrap;margin: 20px; gap:20px">
                             <div style="display: flex; flex-direction: column; gap: 5px;">
                                <label for="traditionalVideographers">📹 Traditional Videographers : </label>
                                <input id="traditionalVideographers-${eCnt}" type="number" name="traditionalVideographers" min="0" required value="${eventData.traditionalVideographers}">
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 5px;">
                                <label for="traditionalPhotographers">📸 Traditional Photographers : </label>
                                <input id="traditionalPhotographers-${eCnt}" type="number" name="traditionalPhotographers" min="0" required value="${eventData.traditionalPhotographers}">
                            </div>
                        </div>
                        `;

  eventSection.appendChild(newEvent);
  //TO-DO
  let eventDateTBDVal = (eventData.date == 'TBD') ? true : false;
  let eventLocTBDVal = (eventData.location == 'TBD') ? true : false;
  let locInputField = document.getElementById('eventLocationId-' + eCnt);
  let dateInputField = document.getElementById('eventDateId-' + eCnt);
  let locTBDField = document.getElementById('eventLocationTBD-' + eCnt);
  let dateTBDField = document.getElementById('eventDateTBD-' + eCnt);
  document.getElementById('eventDetails-' + eCnt).value = eventData.eventDetails;

  if (eventDateTBDVal) {
    dateTBDField.checked = true;
    dateInputField.disabled = true;
  } else {
    dateInputField.disabled = false;
    dateTBDField.checked = false;
  }

  if (eventLocTBDVal) {
    locTBDField.checked = true;
    locInputField.disabled = true;
  }

}

async function editProposal(docId) {
  createInProgress = false;
  editInProgress = true;
  document.getElementById("formTitle").textContent = "Edit Proposal";
  document.getElementById("submitBtn").textContent = "Update";
  const quotationDocRef = doc(db, QUOTATION_COLL, docId); // Reference to the 'Quotations' collection and the specific document ID
  try {
    const docSnap = await getDoc(quotationDocRef); // Fetch the document snapshot

    if (docSnap.exists()) {
      document.getElementById("quotationTable").classList.add("hidden");
      document.getElementById("quotationTable").classList.remove("active-table");
      document.getElementById("formContainer").classList.remove("hidden");
      const quotation = docSnap.data();
      oldTitleInEdit = quotation.title;
      document.getElementById("editDocumentId").value = docId;
      document.getElementById("editValidUpToId").value = quotation.validUpTo;
      document.getElementById("editValidUpToId").disabled = false;
      document.getElementById("editValidUpToIdDiv").classList.remove("hidden");
      document.getElementById("title").value = quotation.title;
      document.getElementById("mobile").value = quotation.mobile;
      document.getElementById("price").value = quotation.price;
      document.getElementById("addGST").checked = quotation.addGst;
      let eCnt = 1;
      quotation.events.forEach(item => {
        if (eCnt == 1) {
          const eventSection = document.getElementById('eventSection');
          while (eventSection.firstChild) {
            eventSection.removeChild(eventSection.lastChild);
          }
          eventsCount = 1;
          addEventsForEdit(item, eCnt);
        } else {
          addEventsForEdit(item, eCnt);
          eventsCount = eventsCount + 1;
        }
        eCnt = eCnt + 1;
      });
      document.getElementById("albumsAddOnCheckBoxId").checked = quotation.Albums_Addon;
      if (quotation.Albums_Addon) {
        document.getElementById("albumsAddOnChangeCheckBoxId").checked = quotation.Albums_Addon_Changed;
        document.getElementById("changeAlbumAddOnSec").classList.remove("hidden");
        if (quotation.Albums_Addon_Changed) {
          document.getElementById("albumsAddOnCostId").value = quotation.Albums_Addon_Price;
          document.getElementById("albumsAddOnPhotosId").value = quotation.Albums_Addon_Photos;
        }
      }
      document.getElementById("hardDrivesCheckBoxId").checked = quotation.HD_Changed;
      if (quotation.HD_Changed) {
        document.getElementById("hardDrivesCountId").value = quotation.HD_Count;
        document.getElementById("hardDrivesSizeId").value = quotation.HD_Size;
      }
      document.getElementById("ledScreensCheckBoxId").checked = quotation.LED_Changed;
      if (quotation.LED_Changed) {
        document.getElementById("ledScreensId").value = quotation.LED_Price;
      }
      document.getElementById("webLiveCheckBoxId").checked = quotation.WebLive_Changed;
      if (quotation.WebLive_Changed) {
        document.getElementById("webLiveId").value = quotation.WebLive_Price;
        document.getElementById("webLiveTimeId").value = quotation.WebLive_Time;
      }

      document.getElementById("preWeddingPSReqCheckBoxId").checked = quotation.pwpsRequired;
      if (quotation.pwpsRequired) {
        document.getElementById("changePWPSSectionDiv").classList.remove("hidden");
        document.getElementById("preWeddingShootCheckBoxId").checked = quotation.pwpsChange;
        if (quotation.pwpsChange) {
          document.getElementById("preWeddingShootId").value = quotation.preWeddingPhotoShoot;
          document.getElementById("preWeddingShootId").disabled = false;
        }
      }

      document.getElementById("dronesCheckBoxId").checked = quotation.droneRequired;

      document.getElementById("change-deliverables-CheckBoxId").checked = quotation.delChange;
      if (quotation.delChange) {
        document.getElementById("changeDeliverables").classList.remove("hidden");
        document.getElementById("display-photos-CheckBoxId").checked = quotation.display_del_photos;
        document.getElementById("display-albums-CheckBoxId").checked = quotation.display_del_albums;
        document.getElementById("display-film-CheckBoxId").checked = quotation.display_del_films;
        document.getElementById("display-longVideos-CheckBoxId").checked = quotation.display_del_long_videos;
        document.getElementById("display-rawData-CheckBoxId").checked = quotation.display_del_raw_data;
        document.getElementById("display-reels-CheckBoxId").checked = quotation.display_del_reels;
        if (quotation.del_albums)
          document.getElementById("deliverables-albums-Id").value = quotation.del_albums;
        if (quotation.del_photos)
          document.getElementById("deliverables-photos-Id").value = quotation.del_photos;
        if (quotation.del_films)
          document.getElementById("deliverables-film-Id").value = quotation.del_films;
        if (quotation.del_long_videos)
          document.getElementById("deliverables-longVideos-Id").value = quotation.del_long_videos;
        if (quotation.del_raw_data)
          document.getElementById("deliverables-rawData-Id").value = quotation.del_raw_data;
        if (quotation.del_reels)
          document.getElementById("deliverables-reels-Id").value = quotation.del_reels;
      }

      // splitTeam = quotation.splitTeam;
    }
  } catch (error) {
    console.error("Error fetching document:", error);
  }
}


// update a quotation from fireBase
async function updateQuotationStatus(documentId, status) {

  try {
    const isConfirmed = confirm("Are you sure you want to update status to " + status + " for this proposal?");
    if (isConfirmed) {
      const docRef = doc(db, QUOTATION_COLL, documentId);

      const updatedData = {
        ['status']: status, // Dynamically set the field to update
      };
      await updateDoc(docRef, updatedData);
      showToast("Proposal " + status + " successfully! Please update the status properly.", "success");
      fetchQuotations();
    }
  } catch (error) {
    showToast("Error in " + status + "  Proposal: "+ error, "error");
  }
}

// Delete a quotation from fireBase
async function deleteQuotation(documentId) {

  try {
    const isConfirmed = confirm("Are you sure you want to delete this proposal?");
    if (isConfirmed) {
      // Delete the row
      const docRef = doc(db, QUOTATION_COLL, documentId);
      const querySnapshot = await getDoc(docRef);
      let quotation = querySnapshot.data();
      if (quotation.status == "Accepted") {
        showToast("❗❗❗ Cannot delete Accepted proposal ❗❗❗ Please update the status and try again", "Warning");
      }
      else {
        await deleteDoc(docRef);
        showToast("Proposal deleted successfully!", "Success");
        fetchQuotations();
      }
    }
  } catch (error) {
    showToast("Error expiring Proposal: "+ error, "error");
  }
}

export function toggleInput(checkbox, eventNum) {
  let inputField;
  if (checkbox.id.startsWith('eventLocation')) {
    inputField = document.getElementById('eventLocationId-' + eventNum);
  }
  else if (checkbox.id.startsWith('eventDate')) {
    inputField = document.getElementById('eventDateId-' + eventNum);
  }
  if (checkbox.checked) {
    inputField.type = "text"
    inputField.value = "TBD";
    inputField.disabled = true;
  } else {
    inputField.value = "";
    inputField.disabled = false;
    if (checkbox.id.startsWith('eventDate'))
      inputField.type = "date";
  }
};

window.toggleInput = toggleInput;
window.sendWhatsAppMessage = sendWhatsAppMessage;
window.toggleActionMenu = toggleActionMenu;
window.removeEvent = removeEvent;
window.removeSelectedEvent = removeSelectedEvent;
window.hideElement = hideElement;

function hideElement(valueId, hideId) {
  if(document.getElementById(valueId).checked)
  document.getElementById(hideId).classList.remove("hidden");
  else
  document.getElementById(hideId).classList.add("hidden");
}

async function sendWhatsAppMessage(number, docId) {
  const docRef = doc(db, QUOTATION_COLL, docId);

  const updatedData = {
    ['status']: 'Sent', // Dynamically set the field to update
  };
  await updateDoc(docRef, updatedData);
  showToast("Proposal sent successfully!", "Success");
  fetchQuotations();
  const quotation = await getDocumentData(QUOTATION_COLL, docId)
  const data = await getDocumentData(SEEDED_DATA_COLL, WHATSAPP_MESSAGE_ID)
  let message = data.Whatsapp_message + "\n " + hostUrl + quotation.url;
  let whatsappUrl = `https://api.whatsapp.com/send?phone=${number}&text=${encodeURIComponent(message)}`;

  window.open(whatsappUrl, "_blank");
  updateQuotationStatus(docId, "Sent");
}
function addEvent() {
  let lastEventDateId = "eventDateId-" + eventsCount;
  eventsCount += 1;
  const eventSection = document.getElementById('eventSection');
  const newEvent = document.createElement('div');
  newEvent.setAttribute("id", "Event-" + eventsCount);
  const firstEventDate = document.getElementById(lastEventDateId).value;
  newEvent.classList.add('event');
  newEvent.innerHTML = ` <div style="display: flex; flex-direction: row; flex-wrap: wrap; margin: 20px; gap:20px">
                                <h3>Event</h3>
                                <i class="fa fa-trash-o" title="Remove Current Event"
                                    style="cursor: pointer;padding: 10px;font-size:30px;color:red" onclick="removeSelectedEvent(${eventsCount})"></i>
                            </div>
                          <div style="display: flex; flex-direction: row; flex-wrap: wrap; margin: 20px; gap:20px">
                            <div style="display: flex; flex-direction: column; gap: 5px;">
                                <label for="eventName">Event Name : </label>
                                <input type="text" name="eventName" required>
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 5px;">
                                <label for="eventLocation">📍 Location : </label>
                                <input id="eventLocationId-${eventsCount}" type="text" name="eventLocation" required>
                                <label for="eventLocationTBD"> TBD
                                    <input id="eventLocationTBD-${eventsCount}" name="eventLocationTBD" type="checkbox"  onclick="toggleInput(this,${eventsCount})">
                                </label>
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 5px;">
                                <label for="eventDate">📆 Date : </label>
                                <input id="eventDateId-${eventsCount}" type="date" name="eventDate" value="${firstEventDate}" required>
                                <label for="eventDateTBD"> TBD
                                    <input id="eventDateTBD-${eventsCount}" name="eventDateTBD" type="checkbox"  onclick="toggleInput(this,${eventsCount})">
                                </label>
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 5px;">
                                <label for="eventDetails">Details : </label>
                                <textarea id="eventDetails-${eventsCount}" rows="3" cols="30" name="eventDetails"></textarea>
                            </div>
                        </div>
                          <div style="display: flex; flex-direction: row; flex-wrap: wrap;margin: 20px;  gap:20px">
                            <div style="display: flex; flex-direction: column; gap: 5px;">
                                <label for="cinematographers">🎥 Cinematographers : </label>
                                <input type="number" name="cinematographers" min="0" value="1" required>
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 5px;">
                                <label for="candidPhotographers">📷 Candid Photographers : </label>
                                <input type="number" name="candidPhotographers" min="0" value="1" required>
                            </div>
                        </div>
                        <div style="display: flex; flex-direction: row; flex-wrap: wrap;margin: 20px; gap:20px">
                             <div style="display: flex; flex-direction: column; gap: 5px;">
                                <label for="traditionalVideographers">📹 Traditional Videographers : </label>
                                <input type="number" name="traditionalVideographers" min="0" value="1" required>
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 5px;">
                                <label for="traditionalPhotographers">📸 Traditional Photographers : </label>
                                <input type="number" name="traditionalPhotographers" min="0" value="1" required>
                            </div>
                        </div>`;

  eventSection.appendChild(newEvent);

}

function removeEvent() {
  if (eventsCount > 1) {
    const eventSection = document.getElementById('eventSection');
    var child = document.getElementById("Event-" + eventsCount);
    eventSection.removeChild(child);
    eventsCount -= 1;
  }
}

function removeSelectedEvent(eventNo) {
  const isConfirmed = confirm("Are you sure you want to delete current Event ?");
    if (isConfirmed) {
      if (eventsCount > 1) {
        const eventSection = document.getElementById('eventSection');
        var child = document.getElementById("Event-" + eventNo);
        eventSection.removeChild(child);
        eventsCount -= 1;
      }
    }
}

function clearDataForNewProposal() {
  while (eventsCount > 1)
    removeEvent();
  document.getElementById("quotationForm").reset();
  const fields = ["eventDateId-1", "eventNameId-1", "eventLocationId-1"]; // List of IDs
  fields.forEach(id => {
    document.getElementById(id).value = "";
    document.getElementById(id).disabled = false;
    if (id.startsWith('eventDate')) {
      document.getElementById(id).type = "date";
    }
  });

  const crewFields = ["candidPhotographers-1", "cinematographers-1", "traditionalPhotographers-1", "traditionalVideographers-1"]; // List of IDs
  crewFields.forEach(id => document.getElementById(id).value = "1");

  const hiddenFields = ["changeDeliverables", "changePWPSSectionDiv"]
  hiddenFields.forEach(id => document.getElementById(id).classList.add("hidden"));

  const disableFields = ["deliverables-photos-Id", "deliverables-albums-Id", "deliverables-film-Id", "deliverables-longVideos-Id",
    "deliverables-rawData-Id", "deliverables-reels-Id", "change-reels-CheckBoxId", "albumsAddOnCostId", "editValidUpToId",
    "albumsAddOnPhotosId", "hardDrivesCountId", "hardDrivesSizeId", "ledScreensId", "webLiveId", "webLiveTimeId", "preWeddingShootId"
  ]
  disableFields.forEach(id => document.getElementById(id).disabled = true);

}

function openNewProposalForm() {
  editInProgress = false;
  createInProgress = true;
  document.getElementById("formTitle").textContent = "New Proposal";
  document.getElementById("submitBtn").textContent = "Create";
  clearDataForNewProposal();
  document.getElementById("quotationTable").classList.add("hidden");
  document.getElementById("quotationTable").classList.remove("active-table");
  document.getElementById("paginationContainer").classList.add("hidden");
  document.getElementById("formContainer").classList.remove("hidden");
  document.getElementById("termsAndConditionsSection").classList.add("hidden");
  document.getElementById("deliverablesSection").classList.add("hidden");
  document.getElementById("greetingsSection").classList.add("hidden");
  document.getElementById("editValidUpToIdDiv").classList.add("hidden");
}

// Event listeners

document.getElementById("createQuotation").addEventListener("click", () => {
  if (createInProgress || editInProgress) {
    const isConfirmed = confirm("Ohh ! You have not saved the changes. Are you sure you want to move  ?");
    if (isConfirmed) {
      openNewProposalForm();
    }
  } else {
    openNewProposalForm();
  }
});

document.getElementById("fetchQuotations").addEventListener("click", () => {
  if (createInProgress || editInProgress) {
    const isConfirmed = confirm("Ohh ! You have not saved the changes. Are you sure you want to move ?");
    if (isConfirmed) {
      createInProgress = false;
      editInProgress = false;
      fetchQuotations();
    }
  } else {
    fetchQuotations();
  }
});

document.getElementById("addEvent").addEventListener("click", addEvent);

document.getElementById("quotationForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = document.getElementById("title").value;

  const titleError = document.getElementById("titleError");
  const titleName = document.getElementById("title");
  const isValidTitle = await validateTitle(title);
  if (isValidTitle) {
    titleError.textContent = "Title already exists. Please re-arrange it";
    titleName.classList.add("invalid");
    const isConfirmed = confirm("Please change Title. This title is not available to use ?");
    return;
  } else {
    titleError.textContent = "";
    titleName.classList.remove("invalid");
    const price = document.getElementById("price").value;
    const addGst = document.getElementById("addGST").checked;
    const mobile = document.getElementById("mobile").value;
    const Albums_Addon = document.getElementById("albumsAddOnCheckBoxId").checked;
    const Albums_Addon_Changed = document.getElementById("albumsAddOnChangeCheckBoxId").checked;
    const Albums_Addon_Price = document.getElementById("albumsAddOnCostId").value;
    const Albums_Addon_Photos = document.getElementById("albumsAddOnPhotosId").value;
    const HD_Changed = document.getElementById("hardDrivesCheckBoxId").checked;
    const HD_Count = document.getElementById("hardDrivesCountId").value;
    const HD_Size = document.getElementById("hardDrivesSizeId").value;
    const LED_Changed = document.getElementById("ledScreensCheckBoxId").checked;
    const LED_Price = document.getElementById("ledScreensId").value;
    const WebLive_Changed = document.getElementById("webLiveCheckBoxId").checked;
    const WebLive_Price = document.getElementById("webLiveId").value;
    const WebLive_Time = document.getElementById("webLiveTimeId").value;
    const pwpsRequired = document.getElementById("preWeddingPSReqCheckBoxId").checked;
    const pwpsChange = document.getElementById("preWeddingShootCheckBoxId").checked;
    const preWeddingPhotoShoot = document.getElementById("preWeddingShootId").value;
    const droneRequired = document.getElementById("dronesCheckBoxId").checked;
    const delChange = document.getElementById("change-deliverables-CheckBoxId").checked;
    const splitTeam = true;
    const events = Array.from(document.querySelectorAll('.event')).map(event => ({
      name: event.querySelector('input[name="eventName"]').value,
      location: event.querySelector('input[name="eventLocation"]').value,
      eventDetails: event.querySelector('textarea[name="eventDetails"]').value,
      date: event.querySelector('input[name="eventDate"]').value == 'TBD' ?
        `TBD` :
        `${event.querySelector('input[name="eventDate"]').value.split("-")[2]}-${event.querySelector('input[name="eventDate"]').value.split("-")[1]}-${event.querySelector('input[name="eventDate"]').value.split("-")[0]}`,
      cinematographers: event.querySelector('input[name="cinematographers"]').value,
      candidPhotographers: event.querySelector('input[name="candidPhotographers"]').value,
      traditionalPhotographers: event.querySelector('input[name="traditionalPhotographers"]').value,
      traditionalVideographers: event.querySelector('input[name="traditionalVideographers"]').value,
    }));

    const quotation =
      { title, events, price, addGst, mobile, splitTeam, Albums_Addon, Albums_Addon_Changed, Albums_Addon_Price, Albums_Addon_Photos, HD_Changed, HD_Count, HD_Size, LED_Changed, LED_Price, WebLive_Changed, WebLive_Price, WebLive_Time, pwpsRequired, pwpsChange, preWeddingPhotoShoot, droneRequired };
    let deliverablesObj = { delChange };

    if (delChange) {
      const disPlayDelPhotos = document.getElementById("display-photos-CheckBoxId").checked;
      const changeDelPhotos = document.getElementById("change-photos-CheckBoxId").checked;
      const updatedDelPhotos = document.getElementById("deliverables-photos-Id").value;
      const disPlayDelAlbums = document.getElementById("display-albums-CheckBoxId").checked;
      const changeDelAlbums = document.getElementById("change-albums-CheckBoxId").checked;
      const updatedDelAlbums = document.getElementById("deliverables-albums-Id").value;
      const disPlayDelFilms = document.getElementById("display-film-CheckBoxId").checked;
      const changeDelFilms = document.getElementById("change-film-CheckBoxId").checked;
      const updatedDelFilms = document.getElementById("deliverables-film-Id").value;
      const disPlayDelReels = document.getElementById("display-reels-CheckBoxId").checked;
      const changeDelReels = document.getElementById("change-reels-CheckBoxId").checked;
      const updatedDelReels = document.getElementById("deliverables-reels-Id").value;
      const disPlayDelLongVideos = document.getElementById("display-longVideos-CheckBoxId").checked;
      const changeDelLongVideos = document.getElementById("change-longVideos-CheckBoxId").checked;
      const updatedDelLongVideos = document.getElementById("deliverables-longVideos-Id").value;
      const disPlayDelRawData = document.getElementById("display-rawData-CheckBoxId").checked;
      const changeDelRawData = document.getElementById("change-rawData-CheckBoxId").checked;
      const updatedDelRawData = document.getElementById("deliverables-rawData-Id").value;
      deliverablesObj = { delChange, disPlayDelRawData, changeDelRawData, updatedDelRawData, disPlayDelLongVideos, changeDelLongVideos, updatedDelLongVideos, disPlayDelPhotos, changeDelPhotos, updatedDelPhotos, disPlayDelAlbums, changeDelAlbums, updatedDelAlbums, disPlayDelFilms, changeDelFilms, updatedDelFilms, disPlayDelReels, changeDelReels, updatedDelReels }
    }

    addQuotation(quotation, deliverablesObj);

  }

});

async function getDocumentData(collection_name, document_id) {
  const seededDataDocRef = doc(db, collection_name, document_id); // Reference to the 'Quotations' collection and the specific document ID
  try {
    const docSnap = await getDoc(seededDataDocRef); // Fetch the document snapshot

    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (error) {
    showToast("Error fetching document: "+ error, "error");
  }
}

document.getElementById('editTermsAndConditions').addEventListener('click', (event) => {
  if (createInProgress || editInProgress) {
    const isConfirmed = confirm("Ohh ! You have not saved the changes. Are you sure you want to move  ?");
    if (isConfirmed) {
      createInProgress = false;
      editInProgress = false;
      displayTermsAndConditions();
    }
  } else {
    displayTermsAndConditions();
  }
});

async function displayTermsAndConditions() {
  document.getElementById("formContainer").classList.add("hidden");
  document.getElementById("quotationTable").classList.add("hidden");
  document.getElementById("quotationTable").classList.remove("active-table");
  document.getElementById("paginationContainer").classList.add("hidden");
  document.getElementById("termsAndConditionsSection").classList.remove("hidden");
  document.getElementById("deliverablesSection").classList.add("hidden");
  document.getElementById("greetingsSection").classList.add("hidden");
  document.getElementById('editTermsAndConditionsSection').innerHTML = "";
  termsAndConditionsCount = 0;
  const data = await getDocumentData(SEEDED_DATA_COLL, TERMS_AND_CONDITIONS_DOC_ID)
  data.terms_and_conditions.forEach(item => {
    addNewTerms(item);
  });
}

document.getElementById("addNewTermsBtn").addEventListener("click", (event) => {
  addNewTerms('');
});

function addNewTerms(item) {
  let editTermsAndConditionsSection = document.getElementById('editTermsAndConditionsSection');
  let newTerms = document.createElement('div');
  newTerms.classList.add('termsAndConditions');
  termsAndConditionsCount += 1;
  newTerms.innerHTML +=
    `<div style="display: flex; flex-direction: row; ">
    <label style="width:1%;">${termsAndConditionsCount}.</label> 
    <textarea name="termsAndCondition" style="margin:20px;" type="text" rows="6">${item}</textarea>
    </div>`
  editTermsAndConditionsSection.appendChild(newTerms);
}

document.getElementById("termsAndConditionsForm").addEventListener("submit", (event) => {
  event.preventDefault();
  saveTermsAndConditions()
});

async function saveTermsAndConditions() {
  const terms = Array.from(document.querySelectorAll('.termsAndConditions')).map(term => {
    let actualTerm = term.querySelector('textarea[name="termsAndCondition"]').value
    return actualTerm && actualTerm.trim() !== '' ? actualTerm : null;
  }).filter(term => term !== null);
  try {
    const docRef = doc(db, SEEDED_DATA_COLL, TERMS_AND_CONDITIONS_DOC_ID);

    const updatedData = {
      ['terms_and_conditions']: terms, // Dynamically set the field to update
    };
    //await deleteDoc(quotationCollectionRef); // Deletes the document
    await updateDoc(docRef, updatedData);
    console.log("Terms and Conditions updated successfully!");
    fetchQuotations();
  } catch (error) {
    showToast("Error in Terms and Conditions updating: "+ error, "error");
  }
}

document.getElementById('editDeliverables').addEventListener('click', (event) => {
  if (createInProgress || editInProgress) {
    const isConfirmed = confirm("Ohh ! You have not saved the changes. Are you sure you want to move  ?");
    if (isConfirmed) {
      createInProgress = false;
      editInProgress = false;
      displayDeliverables();
    }
  } else {
    displayDeliverables();
  }
});

async function displayDeliverables() {
  document.getElementById("formContainer").classList.add("hidden");
  document.getElementById("quotationTable").classList.add("hidden");
  document.getElementById("quotationTable").classList.remove("active-table");
  document.getElementById("paginationContainer").classList.add("hidden");
  document.getElementById("termsAndConditionsSection").classList.add("hidden");
  document.getElementById("deliverablesSection").classList.remove("hidden");
  document.getElementById("greetingsSection").classList.add("hidden");
  document.getElementById('editDeliverablesSection').innerHTML = "";
  deliverablesCount = 0;
  const data = await getDocumentData(SEEDED_DATA_COLL, DELIVERABLES_DOC_ID)
  data.Deliverables.forEach(item => {
    addNewDeliverables(item);
  });
}

document.getElementById("addNewDeliverablesBtn").addEventListener("click", (event) => {
  addNewDeliverables('');
});

function addNewDeliverables(item) {
  let editDeliverablesSection = document.getElementById('editDeliverablesSection');
  let newDeliverables = document.createElement('div');
  newDeliverables.classList.add('deliverables');
  deliverablesCount += 1;
  newDeliverables.innerHTML +=
    `<div style="display: flex; flex-direction: row; ">
  <label style="width:1%;">${deliverablesCount}.</label> 
  <textarea name="deliverable" style="margin:20px;" type="text" rows="6" columns="150">${item}</textarea>
  </div>`
  editDeliverablesSection.appendChild(newDeliverables);
}

document.getElementById("deliverablesForm").addEventListener("submit", (event) => {
  event.preventDefault();
  saveDeliverables()
});

async function saveDeliverables() {
  const deliverables = Array.from(document.querySelectorAll('.deliverables')).map(term => {
    let actualDeliverable = term.querySelector('textarea[name="deliverable"]').value
    return actualDeliverable && actualDeliverable.trim() !== '' ? actualDeliverable : null;
  }).filter(term => term !== null);
  try {
    const docRef = doc(db, SEEDED_DATA_COLL, DELIVERABLES_DOC_ID);

    const updatedData = {
      ['Deliverables']: deliverables, // Dynamically set the field to update
    };
    //await deleteDoc(quotationCollectionRef); // Deletes the document
    await updateDoc(docRef, updatedData);
    console.log("Deliverables updated successfully!");
    fetchQuotations();
  } catch (error) {
    showToast("Error in Deliverables updating: "+ error, "error");
  }
}

document.getElementById('change-deliverables-CheckBoxId').addEventListener('click', (event) => {
  document.getElementById("changeDeliverables").classList.toggle("hidden");
});

document.getElementById('editGreetings').addEventListener('click', (event) => {
  if (createInProgress || editInProgress) {
    const isConfirmed = confirm("Ohh ! You have not saved the changes. Are you sure you want to move  ?");
    if (isConfirmed) {
      createInProgress = false;
      editInProgress = false;
      displayGreetings();
    }
  } else {
    displayGreetings();
  }
});

async function displayGreetings() {
  document.getElementById("formContainer").classList.add("hidden");
  document.getElementById("quotationTable").classList.add("hidden");
  document.getElementById("quotationTable").classList.remove("active-table");
  document.getElementById("paginationContainer").classList.add("hidden");
  document.getElementById("termsAndConditionsSection").classList.add("hidden");
  document.getElementById("deliverablesSection").classList.add("hidden");
  document.getElementById("greetingsSection").classList.remove("hidden");
  document.getElementById('editGreetingsSection').innerHTML = "";
  greetingsCount = 0;
  const data = await getDocumentData(SEEDED_DATA_COLL, GREETINGS_DOC_ID)
  data.greetings.forEach(item => {
    addNewGreetings(item);
  });
}

document.getElementById("addNewGreetingsBtn").addEventListener("click", (event) => {
  addNewGreetings('');
});

function addNewGreetings(item) {
  let editGreetingsSection = document.getElementById('editGreetingsSection');
  let newGreetings = document.createElement('div');
  newGreetings.classList.add('greetings');
  greetingsCount += 1;
  newGreetings.innerHTML +=
    `<div style="display: flex; flex-direction: row; ">
    <label style="width:1%;">${greetingsCount}.</label> 
    <textarea name="greeting" style="margin:20px;" type="text" rows="6">${item}</textarea>
    </div>`
  editGreetingsSection.appendChild(newGreetings);
}

document.getElementById("greetingsForm").addEventListener("submit", (event) => {
  event.preventDefault();
  saveGreetings()
});

async function saveGreetings() {
  const terms = Array.from(document.querySelectorAll('.greetings')).map(term => {
    let actualGreeting = term.querySelector('textarea[name="greeting"]').value
    return actualGreeting && actualGreeting.trim() !== '' ? actualGreeting : null;
  }).filter(term => term !== null);
  try {
    const docRef = doc(db, SEEDED_DATA_COLL, GREETINGS_DOC_ID);

    const updatedData = {
      ['greetings']: terms, // Dynamically set the field to update
    };
    //await deleteDoc(quotationCollectionRef); // Deletes the document
    await updateDoc(docRef, updatedData);
    fetchQuotations();
  } catch (error) {
    showToast("Error in Greetings updating: "+ error, "error");
  }
}

window.disableEnableElement = disableEnableElement;

function disableEnableElement(idArr) {
  idArr.forEach(item => {
    document.getElementById(item).disabled = !document.getElementById(item).disabled;
  })
}

window.changeDeliverablesElement = changeDeliverablesElement;

function changeDeliverablesElement(checkbox, textbox) {
  disableEnableElement([checkbox]);
  let checkoxVal = document.getElementById(checkbox).disabled;
  if(checkoxVal){
    document.getElementById(textbox).disabled = checkoxVal;
    document.getElementById(checkbox).checked = !checkoxVal;
  }
}

async function validateTitle(customerName) {
  const customersRef = collection(db, QUOTATION_COLL);
  const q = query(customersRef, where("title", "==", customerName));
  const querySnapshot = await getDocs(q);
  if (querySnapshot && querySnapshot.size > 0 && (createInProgress || (editInProgress && oldTitleInEdit != customerName))) {
    return true;
  }
  return false;
}

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `show ${type}`;

  setTimeout(() => {
    toast.className = toast.className.replace("show", "");
  }, 6000);
}

// Initialize the database
initDB();

// ===== Dark Mode =====
const darkToggle = document.getElementById("darkModeToggle");

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

darkToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
});