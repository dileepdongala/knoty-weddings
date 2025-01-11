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



function generateQuotation() {

    const bride = document.getElementById('bride').value;

    const groom = document.getElementById('groom').value;



    const events = Array.from(document.querySelectorAll('.event')).map(event => ({

        name: event.querySelector('input[name="eventName"]').value,

        location: event.querySelector('input[name="eventLocation"]').value,

        date: event.querySelector('input[name="eventDate"]').value,

        cinematographers: event.querySelector('input[name="cinematographers"]').value,

        candidPhotographers: event.querySelector('input[name="candidPhotographers"]').value,

        traditionalPhotographers: event.querySelector('input[name="traditionalPhotographers"]').value,

        traditionalVideographers: event.querySelector('input[name="traditionalVideographers"]').value

    }));



    const deliverables = document.getElementById('deliverables').value;

    const addOns = document.getElementById('addOns').value;

    const totalCost = document.getElementById('totalCost').value;

    const complimentary = document.getElementById('complimentary').value;

    const terms = document.getElementById('terms').value;



    let quoteHTML = `

        <p><strong>Bride:</strong> ${bride}</p>

        <p><strong>Groom:</strong> ${groom}</p>

        <h3>Events</h3>

        <ul>

    `;



    events.forEach(event => {

        quoteHTML += `

            <li>

                <strong>${event.name}</strong> - ${event.date} at ${event.location}<br>

                Cinematographers: ${event.cinematographers}, Candid Photographers: ${event.candidPhotographers}, Traditional Photographers: ${event.traditionalPhotographers}, Traditional Videographers: ${event.traditionalVideographers}

            </li>

        `;

    });



    quoteHTML += `

        </ul>

        <h3>Deliverables</h3>

        <p>${deliverables}</p>

        <h3>Add-On Services</h3>

        <p>${addOns}</p>

        <h3>Total Cost</h3>

        <p>${totalCost}</p>

        <h3>Complimentary Items</h3>

        <p>${complimentary}</p>

        <h3>Terms & Conditions</h3>

        <p>${terms}</p>

    `;



    document.getElementById('quoteContent').innerHTML = quoteHTML;

    document.getElementById('quotationOutput').classList.remove('hidden');

}
