import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, addDoc, updateDoc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

const QUOTATION_COLL = "Quotations";
const SEEDED_DATA_COLL = "Seeded_Data";
const GREETINGS_DOC_ID = "Greetings_Doc";
const COMPLIMENTARY_DOC_ID = "Complimentary_Doc";
const DELIVERABLES_DOC_ID = "Deliverables_Doc";
const EXTRA_REQUIREMENTS_DOC_ID = "Extra_Requirements_Doc";
const TERMS_AND_CONDITIONS_DOC_ID = "Terms_And_Conditions_Doc";
const CHARGES_DOC_ID = "Charges_Doc";
let db;
let documentId;
let eventsCount = 1;
let termsAndConditionsCount = 0;
let deliverablesCount = 0;
let greetingsCount = 0;
let documentUrl;

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

  /* const firebaseConfig = {
    apiKey: "AIzaSyDtFmFbzffrijSB6t9G7hYsmmjH1vPR0jU",
    authDomain: "kwphotography-ea039.firebaseapp.com",
    databaseURL: "https://kwphotography-ea039-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "kwphotography-ea039",
    storageBucket: "kwphotography-ea039.firebasestorage.app",
    messagingSenderId: "643669622642",
    appId: "1:643669622642:web:af4d25f389a501629fa7eb",
    measurementId: "G-3MFN4VCXMM"
  };*/

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  fetchQuotations();
}

// Add a quotation to fireBase
async function addQuotation(quotation) {

  // Add data
  const now = new Date();

  const day = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-indexed
  const year = now.getFullYear().toString();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');

  const formattedDateTime = `${day}-${month}-${year} ${hours}:${minutes}`;

  const today = new Date();
  today.setDate(today.getDate() + 7);
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
    addGst : quotation.addGst,
    validUpTo : formatedToday.split(" ")[1]+"-"+formatedToday.split(" ")[0]+"-"+formatedToday.split(" ")[2],
  };
  try {
    const docRef = await addDoc(quotationCollectionRef, quotationData);
    console.log("Document written with ID:", docRef.id);
    documentId = docRef.id;
    let urlTitle = quotation.title.replace(" & ", "-");
    documentUrl = `quotation.html?id=${urlTitle}:::${documentId}`;

    // Open the quotation in a new tab
    window.open(documentUrl, "_blank")
  } catch (error) {
    alert("Error adding document:", error);
  }
  const docRef = doc(db, QUOTATION_COLL, documentId);

  const updatedData = {
    ['url']: documentUrl, // Dynamically set the field to update
  };
  await updateDoc(docRef, updatedData);

  document.getElementById("formContainer").classList.toggle("hidden");

  fetchQuotations();

}

// Fetch quotations from fireBase
async function fetchQuotations() {
  document.getElementById("formContainer").classList.add("hidden");
  document.getElementById("quotationTable").classList.toggle("hidden");
  document.getElementById("termsAndConditionsSection").classList.add("hidden");
  document.getElementById("deliverablesSection").classList.add("hidden");
  document.getElementById("greetingsSection").classList.add("hidden");
  const quotationCollectionRef = collection(db, QUOTATION_COLL); // Reference to the 'Quotations' collection
  try {
    const querySnapshot = await getDocs(quotationCollectionRef);
    const tableBody = document.querySelector("#quotationTable tbody");
    tableBody.innerHTML = "";
    querySnapshot.forEach((doc) => {
      const quotation = doc.data();
      const row = document.createElement("tr");
      let quoteHTML = `
          <td>${quotation.title}</td>
          <td>₹ ${quotation.price} /-</td>
          <td><a href="${quotation.url}" target="_blank">Open</a></td>`
      if (quotation.status == "Expired") {
        quoteHTML += `<td>🔶 Expired</td>
        <td><button value="${doc.id}" id="activateQuotation-${doc.id}">Activate</button></td>`
      } else if (quotation.status == "Sent") {
        quoteHTML += `<td>🔷 Sent </td>
        <td><button value="${doc.id}" id="expireQuotation-${doc.id}">Expire</button></td>`
      } else if (quotation.status == "Accepted") {
        quoteHTML += `<td >✅ Accepted </td>
        <td><button value="${doc.id}" id="expireQuotation-${doc.id}">Expire</button></td>`
      } else if (quotation.status == "Rejected") {
        quoteHTML += `<td >🔴 Rejected </td>
        <td><button value="${doc.id}" id="expireQuotation-${doc.id}">Expire</button></td>`
      } else {
        quoteHTML += `<td >🧼 Draft </td>
        <td><button value="${doc.id}" id="expireQuotation-${doc.id}">Expire</button></td>`
      }
      quoteHTML += ` 
      <td><button style="background-color:#1475a1"value="${doc.id}" id="sentQuotation-${doc.id}">Sent</button>
      <td><button style="background-color:#b30000" value="${doc.id}" id="rejectQuotation-${doc.id}">Reject</button>
      <td><button style="background-color:#00b369" value="${doc.id}" id="acceptQuotation-${doc.id}">Accept</button></td>
      <td><button style="background-color:#db1b1b" value="${doc.id}" id="deleteQuotation-${doc.id}">Delete</button>
      <td>${quotation.created_date}</td>`
        ;
      row.innerHTML = quoteHTML;
      tableBody.appendChild(row);
    });

  } catch (error) {
    alert("Error fetching Quotations:", error);
  }
}

// update a quotation from fireBase
async function updateQuotationStatus(documentId,status) {

  try {
    const isConfirmed = confirm("Are you sure you want to update status to " + status +" for this proposal?");
    if (isConfirmed) {
      // Delete the row
      const docRef = doc(db, QUOTATION_COLL, documentId);

      const updatedData = {
        ['status']: status, // Dynamically set the field to update
      };
      //await deleteDoc(quotationCollectionRef); // Deletes the document
      await updateDoc(docRef, updatedData);
      alert("Proposal " + status +" successfully! Please update the status properly.");
      fetchQuotations();
      document.getElementById("quotationTable").classList.toggle("hidden");
    }
  } catch (error) {
    alert("Error in " + status +"  Proposal:", error);
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
      if(quotation.status=="Accepted"){
        alert("❗❗❗ Cannot delete Accepted proposal ❗❗❗ Please update the status and try again");
      }
      else {
        await deleteDoc(docRef);
        alert("Proposal deleted successfully!");
        fetchQuotations();
        document.getElementById("quotationTable").classList.toggle("hidden");
      }
    }
  } catch (error) {
    alert("Error expiring Proposal:", error);
  }
}

export function toggleInput(checkbox,eventNum) {
  let inputField;
  if(checkbox.id.startsWith('eventLocation')){
    inputField = document.getElementById('eventLocationId-'+eventNum);
  }
  else if(checkbox.id.startsWith('eventDate')){
    inputField = document.getElementById('eventDateId-'+eventNum);
  }
  if (checkbox.checked) {
    inputField.type = "text"
    inputField.value = "TBD";
    inputField.disabled = true;
  } else {
    inputField.value = "";
    inputField.disabled = false;
    if(checkbox.id.startsWith('eventDate'))
      inputField.type = "date";
  }
};
window.toggleInput = toggleInput;

function addEvent() {
  eventsCount += 1;
  const eventSection = document.getElementById('eventSection');
  const newEvent = document.createElement('div');
  newEvent.classList.add('event');
  newEvent.innerHTML = `<h3>Event ${eventsCount}</h3>
                          <div style="display: flex; flex-direction: row; flex-wrap: wrap; margin: 20px; ">
                            <div style="display: flex; flex-direction: row; width:50%;">
                                <label for="eventName">Event Name:</label>
                                <input type="text" name="eventName" required>
                            </div>
                            <div style="display: flex; flex-direction: row; width:50%">
                                <label for="eventLocation">📍 Location:</label>
                                <input id="eventLocationId-${eventsCount}" type="text" name="eventLocation" required>
                                <span>&nbsp;</span>
                                <span>&nbsp;</span>
                                <span>&nbsp;</span> 
                                <br><br>
                                <label for="eventLocationTBD"> TBD
                                    <input id="eventLocationTBD-${eventsCount}" name="eventLocationTBD" type="checkbox"  onclick="toggleInput(this,${eventsCount})">
                                </label>
                            </div>
                        </div>
                        <div style="display: flex; flex-direction: row; flex-wrap: wrap;margin: 20px; ">
                            <div style="display: flex; flex-direction: row; width:50%">
                                <label for="eventDate">📆 Date:</label>
                                <input id="eventDateId-${eventsCount}" type="date" name="eventDate" required>
                                <span>&nbsp;</span>
                                <span>&nbsp;</span>
                                <span>&nbsp;</span> 
                                <br><br>
                                <label for="eventDateTBD"> TBD
                                    <input id="eventDateTBD-${eventsCount}" name="eventDateTBD" type="checkbox"  onclick="toggleInput(this,${eventsCount})">
                                </label>
                            </div>
                        </div>
                         <!-- <div style="display: flex; flex-direction: row; flex-wrap: wrap;margin: 20px; ">
                            <div style="display: flex; flex-direction: row; width:50%">
                                <label for="cinematographers">🎥 Cinematographers:</label>
                                <input type="number" name="cinematographers" min="0" value="0" required>
                            </div>
                            <div style="display: flex; flex-direction: row; width:50%">
                                <label for="candidPhotographers">📷 Candid Photographers:</label>
                                <input type="number" name="candidPhotographers" min="0" value="0" required>
                            </div>
                        </div>
                        <div style="display: flex; flex-direction: row; flex-wrap: wrap;margin: 20px; ">
                            <div style="display: flex; flex-direction: row; width:50%">
                                <label for="traditionalPhotographers">📸 Traditional Photographers:</label>
                                <input type="number" name="traditionalPhotographers" min="0" value="0" required>
                            </div>
                            <div style="display: flex; flex-direction: row; width:50%">
                                <label for="traditionalVideographers">📹 Traditional Videographers:</label>
                                <input type="number" name="traditionalVideographers" min="0" value="0" required>
                            </div>
                        </div> -->
                        <div style="display: flex; flex-direction: row; flex-wrap: wrap;margin: 20px; ">
                            <div style="display: flex; flex-direction: row; width:50%">
                                <label for="videographers">🎥 Videographers:</label>
                                <input type="number" name="videographers" min="0" value="0" required>
                            </div>
                            <div style="display: flex; flex-direction: row; width:50%">
                                <label for="photographers">📷 Photographers:</label>
                                <input type="number" name="photographers" min="0" value="0" required>
                            </div>
                        </div>`;

  eventSection.appendChild(newEvent);

}

// Event listeners
document.getElementById("createQuotation").addEventListener("click", () => {
  document.getElementById("formContainer").classList.toggle("hidden");
  document.getElementById("termsAndConditionsSection").classList.add("hidden");
  document.getElementById("deliverablesSection").classList.add("hidden");
  document.getElementById("greetingsSection").classList.add("hidden");
});

document.getElementById("fetchQuotations").addEventListener("click", fetchQuotations);

document.getElementById("addEvent").addEventListener("click", addEvent);

document.getElementById('quotationTable').addEventListener('click', (event) => {
  // Check if the clicked element is a button with an ID starting with 'expireQuotation'
  if (event.target && event.target.id.startsWith('expireQuotation')) {
    updateQuotationStatus(event.target.value,"Expired");
  }
  else if (event.target && event.target.id.startsWith('activateQuotation')) {
    updateQuotationStatus(event.target.value,"Draft");
  }
  else if (event.target && event.target.id.startsWith('sentQuotation')) {
    updateQuotationStatus(event.target.value,"Sent");
  }
  else if (event.target && event.target.id.startsWith('rejectQuotation')) {
    updateQuotationStatus(event.target.value,"Rejected");
  }
  else if (event.target && event.target.id.startsWith('acceptQuotation')) {
    updateQuotationStatus(event.target.value,"Accepted");
  }  
  else if (event.target && event.target.id.startsWith('deleteQuotation')) {
    deleteQuotation(event.target.value);
  }
});

document.getElementById("quotationForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const title = document.getElementById("title").value;
  const price = document.getElementById("price").value;
  const addGst = document.getElementById("addGST").checked;
  const events = Array.from(document.querySelectorAll('.event')).map(event => ({
    name: event.querySelector('input[name="eventName"]').value,
    location: event.querySelector('input[name="eventLocation"]').value,
    date: event.querySelector('input[name="eventDate"]').value  == 'TBD'?
      `TBD` : 
      `${event.querySelector('input[name="eventDate"]').value.split("-")[2]}-${event.querySelector('input[name="eventDate"]').value.split("-")[1]}-${event.querySelector('input[name="eventDate"]').value.split("-")[0]}` ,
    /*cinematographers: event.querySelector('input[name="cinematographers"]').value,
    candidPhotographers: event.querySelector('input[name="candidPhotographers"]').value,
    traditionalPhotographers: event.querySelector('input[name="traditionalPhotographers"]').value,
    traditionalVideographers: event.querySelector('input[name="traditionalVideographers"]').value*/
    videographers: event.querySelector('input[name="videographers"]').value,
    photographers: event.querySelector('input[name="photographers"]').value
  }));

  const quotation = { title, events, price , addGst};

  addQuotation(quotation);
});

async function getDocumentData(collection_name, document_id) {
  const seededDataDocRef = doc(db, collection_name, document_id); // Reference to the 'Quotations' collection and the specific document ID
  try {
    const docSnap = await getDoc(seededDataDocRef); // Fetch the document snapshot

    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (error) {
    alert("Error fetching document:", error);
  }
}

document.getElementById('editTermsAndConditions').addEventListener('click', (event) => {
  displayTermsAndConditions();
});

async function displayTermsAndConditions() {
  document.getElementById("formContainer").classList.add("hidden");
  document.getElementById("quotationTable").classList.add("hidden");
  document.getElementById("termsAndConditionsSection").classList.toggle("hidden");
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
    <textarea name="termsAndCondition" style="margin:20px;" type="text" rows="3">${item}</textarea>
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
    alert("Error in Terms and Conditions updating:", error);
  }
}

document.getElementById('editDeliverables').addEventListener('click', (event) => {
  displayDeliverables();
});

async function displayDeliverables() {
  document.getElementById("formContainer").classList.add("hidden");
  document.getElementById("quotationTable").classList.add("hidden");
  document.getElementById("termsAndConditionsSection").classList.add("hidden");
  document.getElementById("deliverablesSection").classList.toggle("hidden");
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
  <textarea name="deliverable" style="margin:20px;" type="text" rows="3">${item}</textarea>
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
    alert("Error in Deliverables updating:", error);
  }
}

document.getElementById('editGreetings').addEventListener('click', (event) => {
  displayGreetings();
});

async function displayGreetings() {
  document.getElementById("formContainer").classList.add("hidden");
  document.getElementById("quotationTable").classList.add("hidden");
  document.getElementById("termsAndConditionsSection").classList.add("hidden");
  document.getElementById("deliverablesSection").classList.add("hidden");
  document.getElementById("greetingsSection").classList.toggle("hidden");
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
    <textarea name="greeting" style="margin:20px;" type="text" rows="3">${item}</textarea>
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
    console.log("Greetings updated successfully!");
    fetchQuotations();
  } catch (error) {
    alert("Error in Greetings updating:", error);
  }
}

// Disable right-click context menu
/*document.addEventListener("contextmenu", (e) => e.preventDefault());

// Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
document.addEventListener("keydown", (e) => {
  if (e.keyCode === 123 || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) || (e.ctrlKey && e.key === 'U')) {
    e.preventDefault();
  }
});*/


// Initialize the database
initDB();
