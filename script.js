import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, addDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

const dbName = "quotationsDB";
const storeName = "quotations";
let db;
let documentId;
let documentRef;
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

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
}

// Add a quotation to fireBase
async function addQuotation(quotation) {

  // Add data
  const now = new Date();

  const day = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-indexed
  const year = now.getFullYear().toString().slice(-2);
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');

  const formattedDateTime = `${day}-${month}-${year} ${hours}:${minutes}`;

  const quotationCollectionRef = collection(db, "Quotations"); // Reference to the 'Quotations' collection

  const quotationData = {
    //id: Date.now() + Math.random(),
    bride: quotation.brideName,
    groom: quotation.groomName,
    price: quotation.price,
    created_date: formattedDateTime,
    events: quotation.events
  };
  try {
    const docRef = await addDoc(quotationCollectionRef, quotationData);
    console.log("Document written with ID:", docRef.id);
    documentRef = docRef;
    documentId = docRef.id;
    console.log('Document written with ID:', docRef.id);
    documentUrl = `quotation.html?id=${documentId}`;

    // Open the quotation in a new tab
    window.open(documentUrl, "_blank")
  } catch (error) {
    console.error("Error adding document:", error);
  }

    const updatedData = {
    ['url']: documentUrl, // Dynamically set the field to update
  };
  await updateDoc(docRef, updatedData);

  document.getElementById("formContainer").classList.toggle("hidden");

  fetchQuotations();

}

// Fetch quotations from fireBase
async function fetchQuotations() {

  const quotationCollectionRef = collection(db, "Quotations"); // Reference to the 'Quotations' collection
  try {
    const querySnapshot = await getDocs(quotationCollectionRef);
    const tableBody = document.querySelector("#quotationTable tbody");
    tableBody.innerHTML = "";
    querySnapshot.forEach((doc) => {
      console.log(`${doc.id}:`, doc.data());
      const quotation = doc.data();
      const row = document.createElement("tr");
      let quoteHTML = `
          <td>${quotation.bride}</td>
          <td>${quotation.groom}</td>
          <td>${quotation.created_date}</td>
          <td>${quotation.price}</td>
          <td><a href="${quotation.url}" target="_blank">Open</a></td>`
      if (quotation.expired) {
        quoteHTML += `<td style = "background-color : red">Expired</td>`
      } else {
        quoteHTML += `<td><button value="${doc.id}" id="expireQuotation-${doc.id}">Expire</button></td>`
      }
      ;
      row.innerHTML = quoteHTML;
      tableBody.appendChild(row);
    });

  } catch (error) {
    console.error("Error fetching Quotations:", error);
  }
}

// Delete a quotation from fireBase
async function expireQuotation(documentId) {

  try {
    const docRef = doc(db, 'Quotations', documentId);

    const updatedData = {
      ['expired']: true, // Dynamically set the field to update
    };
    //await deleteDoc(quotationCollectionRef); // Deletes the document
    await updateDoc(docRef, updatedData);
    console.log("Quotation expired successfully!");
    fetchQuotations();
  } catch (error) {
    console.error("Error expiring Quotation:", error);
  }
}

function addEvent() {

  const eventSection = document.getElementById('eventSection');

  const newEvent = document.createElement('div');

  newEvent.classList.add('event');

  newEvent.innerHTML = `

        <label>Event Name:</label>
<input type="text" name="eventName" required>
<label>Location:</label>
<input type="text" name="eventLocation" required>
<label>Date:</label>
<input type="date" name="eventDate" required>
<label>Cinematographers:</label>
<input type="number" name="cinematographers" min="0" required>
<label>Candid Photographers:</label>
<input type="number" name="candidPhotographers" min="0" required>
<label>Traditional Photographers:</label>
<input type="number" name="traditionalPhotographers" min="0" required>
<label>Traditional Videographers:</label>
<input type="number" name="traditionalVideographers" min="0" required>

    `;

  eventSection.appendChild(newEvent);

}

// Event listeners
document.getElementById("createQuotation").addEventListener("click", () => {
  document.getElementById("formContainer").classList.toggle("hidden");
});

document.getElementById("fetchQuotations").addEventListener("click", fetchQuotations);

document.getElementById("addEvent").addEventListener("click", addEvent);

/*document.getElementById("expireQuotation").addEventListener("click", (event) => {
  expireQuotation(event.value);
});*/

document.getElementById('quotationTable').addEventListener('click', (event) => {
  // Check if the clicked element is a button with an ID starting with 'expire'
  if (event.target && event.target.id.startsWith('expireQuotation')) {
    console.log(`Button ${event.target.id} clicked!`);
    expireQuotation(event.target.value);
  }
});

document.getElementById("quotationForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const brideName = document.getElementById("brideName").value;
  const groomName = document.getElementById("groomName").value;
  const events = Array.from(document.querySelectorAll('.event')).map(event => ({

    name: event.querySelector('input[name="eventName"]').value,

    location: event.querySelector('input[name="eventLocation"]').value,

    date: event.querySelector('input[name="eventDate"]').value,

    cinematographers: event.querySelector('input[name="cinematographers"]').value,

    candidPhotographers: event.querySelector('input[name="candidPhotographers"]').value,

    traditionalPhotographers: event.querySelector('input[name="traditionalPhotographers"]').value,

    traditionalVideographers: event.querySelector('input[name="traditionalVideographers"]').value

  }));
  const creationDate = `${Date.now()}`;
  const price = document.getElementById("price").value;

  const quotation = { brideName, groomName, events, creationDate, price };

  addQuotation(quotation);
});


// Initialize the database
initDB();
