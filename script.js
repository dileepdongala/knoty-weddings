function addEvent() {

    const eventSection = document.getElementById("eventSection");

    const newEvent = document.createElement("div");

    newEvent.classList.add("event");

    newEvent.innerHTML = `

        <label>Event Name:</label>

        <input type="text" class="eventName" required>

        

        <label>Location:</label>

        <input type="text" class="eventLocation" required>

        

        <label>Date:</label>

        <input type="date" class="eventDate" required>

        

        <label>Cinematographers:</label>

        <input type="number" class="cinematographers" min="0" required>

        

        <label>Candid Photographers:</label>

        <input type="number" class="candidPhotographers" min="0" required>

        

        <label>Traditional Photographers:</label>

        <input type="number" class="traditionalPhotographers" min="0" required>

        

        <label>Traditional Videographers:</label>

        <input type="number" class="traditionalVideographers" min="0" required>

    `;

    eventSection.appendChild(newEvent);

}



function generateQuotation() {

    const bride = document.getElementById("bride").value;

    const groom = document.getElementById("groom").value;

    const totalCost = document.getElementById("totalCost").value;

    const deliverables = document.getElementById("deliverables").value.split("\n").filter(x => x.trim());

    const complimentary = document.getElementById("complimentary").value.split("\n").filter(x => x.trim());

    const terms = document.getElementById("terms").value.split("\n").filter(x => x.trim());



    let quoteHTML = `

        <div style="text-align: center;">

            <img src="logo.jpg" alt="Logo" style="width: 100px; height: auto; margin-bottom: 20px;">

            <h2>Dear ${bride} & ${groom},</h2>

            <p>We value your belief in our work!<br>Discover our services, deliverables, and pricing tailored for your requirements.</p>

        </div>

        <h3>List of Events</h3>

        <p>Details of events go here...</p>

        <h3>Complimentary Items</h3>

        <ul>${complimentary.map(item => `<li>${item}</li>`).join("")}</ul>

        <h3>Deliverables</h3>

        <ul>${deliverables.map(item => `<li>${item}</li>`).join("")}</ul>

        <h3>Charges</h3>

        <p>Total Cost: ${totalCost}</p>

        <p>50% advance, remaining 50% on shoot day.</p>

        <h3>Hard Drives</h3>

        <p>You must provide 2x 8TB external hard drives.</p>

        <h3>Terms & Conditions</h3>

        <ul>${terms.map(term => `<li>${term}</li>`).join("")}</ul>

    `;



    document.getElementById("quotationContainer").innerHTML = quoteHTML;

    document.getElementById("quotationOutput").classList.remove("hidden");

}
