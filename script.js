const dbName = "quotationsDB";
const storeName = "quotations";
let db;

// Initialize IndexedDB
function initDB() {
  const request = indexedDB.open(dbName, 1);

  request.onupgradeneeded = (event) => {
    db = event.target.result;
    db.createObjectStore(storeName, { keyPath: "id", autoIncrement: true });
  };

  request.onsuccess = (event) => {
    db = event.target.result;
  };

  request.onerror = () => {
    console.error("Error opening database.");
  };
}

// Add a quotation to IndexedDB
function addQuotation(quotation) {
  const transaction = db.transaction([storeName], "readwrite");
  const store = transaction.objectStore(storeName);
  store.add(quotation);
}

// Fetch quotations from IndexedDB
function fetchQuotations() {
  const transaction = db.transaction([storeName], "readonly");
  const store = transaction.objectStore(storeName);

  const request = store.getAll();

  request.onsuccess = () => {
    displayQuotations(request.result);
  };

  request.onerror = () => {
    console.error("Error fetching quotations.");
  };
}

// Delete a quotation from IndexedDB
function deleteQuotation(id) {
  const transaction = db.transaction([storeName], "readwrite");
  const store = transaction.objectStore(storeName);
  store.delete(id);
  fetchQuotations();
}

// Display quotations in the table
function displayQuotations(quotations) {
  const tableBody = document.querySelector("#quotationTable tbody");
  tableBody.innerHTML = "";

  quotations.forEach((quotation) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${quotation.brideName}</td>
      <td>${quotation.groomName}</td>
      <td>${quotation.creationDate}</td>
      <td>${quotation.price}</td>
      <td><a href="${quotation.url}" target="_blank">Open</a></td>
      <td><button onclick="deleteQuotation(${quotation.id})">Expire</button></td>
    `;

    tableBody.appendChild(row);
  });
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
  
    const transaction = db.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);
  
    const quotation = { brideName, groomName, events, creationDate, price };
    
    const request = store.add(quotation);
  
    request.onsuccess = (event) => {
      const id = event.target.result;
      const url = `quotation.html?id=${id}`;
      quotation.url = url; // Update the URL with the ID for display in the table.
  
      // Update the record in IndexedDB with the URL
      const updateTransaction = db.transaction([storeName], "readwrite");
      const updateStore = updateTransaction.objectStore(storeName);
      updateStore.put({ ...quotation, id });
  
      // Open the quotation in a new tab
      window.open(url, "_blank");
    };
  });
  

// Initialize the database
initDB();
