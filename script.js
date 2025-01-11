function addEvent() {

    const eventSection = document.getElementById('eventSection');

    const newEvent = document.createElement('div');

    newEvent.classList.add('event');

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

<div style="text-align: center;">

    <div data-section-id="6752cea1a7c06d85177d809e" data-block-id="image" style="display: block;">
        <div class="block  "
            style="flex-direction: column; background-color: rgb(4, 71, 71); background-size: cover; background-position: center center; background-repeat: no-repeat; position: relative; border: none;">
            <div style="display: flex; padding: 0px; z-index: 1;">
                <div class="layout d-flex justify-content-center gap-0-imp  flex-direction-row-reverse-imp"
                    style="display: flex; width: 100%; gap: 40px;">
                    <div class="row w-100p d-flex justify-content-center align-items-center  gap-152 p-y-30px">
                        <div class="column"
                            style="display: flex; max-width: 400px; justify-content: center; background-color: transparent;">
                            <div class="image_block component " style="width: 192px; height: 192px;">
                                <div class="img_cropper">
                                    <img src="logo.jpeg" alt=""
                                        style="transform: translate(-2.41955px, -2.03063px) rotate(0deg) scale(2.645);">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <p>
                    <span
                        style="font-family: california-palms-script, cursive; font-size: 43px; color: rgb(252, 229, 205);">Dear
                    </span>
                </p>
                <p>
                    <span style="color: rgb(252, 229, 205);"><br></span>
                </p>
                <p>&nbsp;
                    <span class="variable"
                        style="font-family: freight-text-pro, serif; font-size: 36px; color: rgb(252, 229, 205);; border-bottom:none; border:none; background:none;"
                        data-id="619f75683f381fd66dac4b65">
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
            <h2>Dear ${bride} & ${groom},</h2>

        </div>

        <div class="column     " style="display: flex; text-align: center; color: rgb(0, 0, 0); word-break: break-word;">
            <div class="text_component component  undefined" style="height: 100%;">
                <div>
                    <p style="font-family: freight-text-pro, serif; font-weight: 400; font-size: 40px;">
                        <span style="color: rgb(249, 203, 156);">
                        List of Events
                        </span>
                    </p>
                </div>
        </div>`

        events.forEach(event => {

            quoteHTML += `
    
<li>

    <div class="et-row clienEventsStyling" data-id="00000001c545633e98752569"
        style="background-color: rgb(14, 65, 64); max-width: 354px;">
        <div class="date-location">
            <span style="color: rgb(252, 229, 205);">${event.date}</span>,
            <span>&nbsp;</span>
            <span style="color: rgb(252, 229, 205);">${event.location}</span>
        </div>
        <div class="event-name"
            style="color: rgb(252, 229, 205); display: flex; gap: 20px; flex-flow: wrap; max-width: 748px; justify-content: flex-start; padding-top: 12px;">
            ${event.name}
        </div>
        <div class="role"
            style="color: rgb(252, 229, 205); text-transform: capitalize; font-size: 16px; font-style: normal; font-weight: 400; line-height: normal;">
            ${event.candidPhotographers} Candid Photographer
        </div>
        <div class="role"
            style="color: rgb(252, 229, 205); text-transform: capitalize; font-size: 16px; font-style: normal; font-weight: 400; line-height: normal;">
            ${event.traditionalPhotographers} Traditional Photographer
        </div>
        <div class="role"
            style="color: rgb(252, 229, 205); text-transform: capitalize; font-size: 16px; font-style: normal; font-weight: 400; line-height: normal;">
            ${event.cinematographers} Cinematographer
        </div>
        <div class="role"
            style="color: rgb(252, 229, 205); text-transform: capitalize; font-size: 16px; font-style: normal; font-weight: 400; line-height: normal;">
            ${event.traditionalVideographers} Videographer</div>
        <div class="desc" style="color: rgb(252, 229, 205);">
        </div>
    </div>

</li>
    
            `;
    
        });

       quoteHTML += ` <h3>Complimentary Items</h3>

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
const newTab = window.open('','_blank');
newTab.document.write(quoteHTML);
    newTab.document.close();


    document.getElementById("quotationContainer").innerHTML = quoteHTML;

    document.getElementById("quotationOutput").classList.remove("hidden");

}
