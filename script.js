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

    const bride = document.getElementById("bride").value;

    const groom = document.getElementById("groom").value;

    const totalCost = document.getElementById("totalCost").value;

    const deliverables = document.getElementById("deliverables").value.split("\n").filter(x => x.trim());

    const complimentary = document.getElementById("complimentary").value.split("\n").filter(x => x.trim());

    const terms = document.getElementById("terms").value.split("\n").filter(x => x.trim());

    const events = Array.from(document.querySelectorAll('.event')).map(event => ({

        name: event.querySelector('input[name="eventName"]').value,

        location: event.querySelector('input[name="eventLocation"]').value,

        date: event.querySelector('input[name="eventDate"]').value,

        cinematographers: event.querySelector('input[name="cinematographers"]').value,

        candidPhotographers: event.querySelector('input[name="candidPhotographers"]').value,

        traditionalPhotographers: event.querySelector('input[name="traditionalPhotographers"]').value,

        traditionalVideographers: event.querySelector('input[name="traditionalVideographers"]').value

    }));





    let quoteHTML = `
<div style="flex-direction: column; background-color: rgb(4, 71, 71);">
    <div style="text-align: center;">
        <div style="display: block;">
            <img src="logo.jpeg" alt="Company Logo" style="width:100px; margin-bottom:20px;">
        </div>
    </div>

    <div style="text-align: center;">
        <p>
            <span style=" font-family: california-palms-script, cursive; font-size: 43px; color: rgb(252,
        229, 205);">Dear
            </span>
        </p>
        <p>
            <span style="color: rgb(252, 229, 205);"><br></span>
        </p>
        <p>&nbsp;
            <span
                style="font-family: freight-text-pro, serif; font-size: 36px; color: rgb(252, 229, 205); border-bottom:none; border:none; background:none;">
                ${bride} & ${groom}
            </span>
        </p><br>
        <p style="line-height: 1.5;">
            <span style="font-family: Georgia, serif; color: rgb(252, 229, 205);">We value your belief in our
                work!&nbsp;&nbsp;
            </span>
        </p>
        <p style="line-height: 1.5;">
            <span style="font-family: Georgia, serif; color: rgb(252, 229, 205);">
                Discover our services, deliverables &amp;&nbsp; pricing tailored to your&nbsp;requirements .
            </span>
        </p>
    </div>


    <div style=" text-align: center; color: rgb(0, 0, 0); word-break: break-word;">
        <p
            style="font-family: freight-text-pro, serif; font-weight: 400; font-size: 40px; ">
            <span style="color: rgb(249, 203, 156);">
                List of Events
            </span>
        </p>
    </div>

    <div style="display: flex;  flex-direction : column; ">
        <div style="display: flex;  flex-direction : row; flex-wrap: wrap;">`

        events.forEach(event => {

            quoteHTML += `
            <li style="list-style-type:none">
                <div
                    style=" display: inline-block; background-color: rgb(14, 65, 64); width: 300px; padding: 15px; margin:5px;">
                    <div>
                        <span style="color: rgb(252, 229, 205);">${event.date}</span>,
                        <span>&nbsp;</span>
                        <span>&nbsp;</span>
                        <span>&nbsp;</span>
                        <span style="color: rgb(252, 229, 205);">${event.location}</span>
                    </div>
                    <div
                        style="color: rgb(252, 229, 205); display: flex; gap: 20px; flex-flow: wrap; max-width: 748px; justify-content: flex-start; padding-top: 15px;">
                        ${event.name}
                    </div>
                    <div
                        style="color: rgb(252, 229, 205); text-transform: capitalize; font-size: 16px; font-style: normal; font-weight: 400; line-height: normal; padding-top: 10px;">
                        ${event.candidPhotographers} Candid Photographer
                    </div>
                    <div
                        style="color: rgb(252, 229, 205); text-transform: capitalize; font-size: 16px; font-style: normal; font-weight: 400; line-height: normal; padding-top: 10px;">
                        ${event.traditionalPhotographers} Traditional Photographer
                    </div>
                    <div
                        style="color: rgb(252, 229, 205); text-transform: capitalize; font-size: 16px; font-style: normal; font-weight: 400; line-height: normal; padding-top: 10px;">
                        ${event.cinematographers} Cinematographer
                    </div>
                    <div
                        style="color: rgb(252, 229, 205); text-transform: capitalize; font-size: 16px; font-style: normal; font-weight: 400; line-height: normal; padding-top: 10px; ">
                        ${event.traditionalVideographers} Videographer</div>
                </div>
                <div class="desc" style="color: rgb(252, 229, 205);">
                </div>
            </li> `;
    
        });

       // <h3>Complimentary Items</h3>

       // <ul>${complimentary.map(item => `<li>${item}</li>`).join("")}</ul>

       quoteHTML += ` 
        </div>
        <div>
            <div style="text-align : center; background-color: rgb(14, 65, 64); padding:15px; ">
                <div style=" font-family: freight-text-pro, serif; font-size: 26px;color: rgb(249, 203, 156);">
                    COMPLIMENTARY COUPLE
                    SHOOT</div>
                <div>
                    <p><span style="font-family: Georgia, serif; font-size: 16px; color: rgb(252, 229, 205);">Your pre
                            wedding photo
                            shoot, </span></p>
                    <p><span style="font-family: Georgia, serif; font-size: 16px; color: rgb(252, 229, 205);">you will
                            receive a
                            collection of&nbsp;50&nbsp;beautifully</span></p>
                    <p><span style="font-family: Georgia, serif; font-size: 16px; color: rgb(252, 229, 205);"> edited
                            &amp;
                            retouched images in cloud.</span></p>
                </div>
            </div>

                <h3>Deliverables</h3>

                <ul style="list-style-type:none">${deliverables.map(item => `<li>${item}</li>`).join("")}</ul>

                <h3>Charges</h3>

                <p>Total Cost: ${totalCost}</p>

                <p>50% advance, remaining 50% on shoot day.</p>

                <h3>Hard Drives</h3>

                <p>You must provide 2x 8TB external hard drives.</p>

                <h3>Terms & Conditions</h3>

                <ul style="list-style-type:none">${terms.map(term => `<li>${term}</li>`).join("")}</ul>
            
        </div>
    </div>
</div>`;
    const newTab = window.open('','_blank');
    newTab.document.write(quoteHTML);
    newTab.document.close();


    document.getElementById("quotationContainer").innerHTML = quoteHTML;

    document.getElementById("quotationOutput").classList.remove("hidden");

}
