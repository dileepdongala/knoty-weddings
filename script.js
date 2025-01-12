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
<div style="flex-direction: column; background-color: rgb(46, 48, 48);">
    <div style="text-align: center;">
        <div style="display: block;">
            <img src="logo.jpeg" alt="Company Logo" style="width:100px; margin-bottom:20px; margin-top:20px !important;">
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
        <div style="justify-content: center;display: flex;  flex-direction : row; flex-wrap: wrap;">`

        events.forEach(event => {

            quoteHTML += `
            <li style="list-style-type:none">
                <div
                    style=" display: inline-block; background-color: rgb(14, 65, 64); width: 300px; padding: 15px; margin:5px; border-radius: 15px;">
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

        /*  <h3>Complimentary Items</h3>

        <ul>${complimentary.map(item => `<li>${item}</li>`).join("")}</ul>

     <h3>Deliverables</h3>

     <ul style="list-style-type:none">${deliverables.map(item => `<li>${item}</li>`).join("")}</ul>

   <h3>Charges</h3>

                <p>Total Cost: ${totalCost}</p>

                <p>50% advance, remaining 50% on shoot day.</p>

                <h3>Hard Drives</h3>

                <p>You must provide 2x 8TB external hard drives.</p>*
                
                 <h3>Terms & Conditions</h3>

                <ul style="list-style-type:none">${terms.map(term => `<li>${term}</li>`).join("")}</ul> */

       quoteHTML += ` 
        </div>
        <div>
            <div style="text-align : center; background-color: rgb(14, 65, 64); padding:15px; margin:30px">
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

            <div style="text-align : center;">
                <p style="font-family: freight-text-pro, serif; font-weight: 400; font-size: 40px;"><span
                        style="color: rgb(249, 203, 156);">Deliverables</span></p>
            </div>

            <div style="width: 100%; height: 100%; position: absolute; top: 0; left: 0; z-index: 0; opacity: .3;"></div>
            <div 
                style="display: flex; flex-direction: column; gap: 40px; width: 100%; justify-content: center; align-items: center; z-index: 1;">
                <div  style="max-width: 720px; width: 100%; gap: 16px;">
                    <div
                        style="display: flex; width: 100%; background-color: rgb(12, 57, 58); position: relative; border-radius: 6px;">
                        <div style="display: flex; flex-direction: column; width: 100%; padding: 16px; padding: 16px;">
                            <div style="height: fit-content;"><a style="display: flex;">
                                    <div>
                                        <p><span style="font-family: Georgia, serif; font-size: 17px;"><strong
                                                    style="color: rgb(249, 203, 156);">Photos</strong></span>
                                        </p>
                                    </div>
                                </a><span style="display: flex; margin-bottom: 10px;">
                                    <p><span style="font-family: Georgia, serif; color: rgb(252, 229, 205);">You
                                            shall receive&nbsp;<span
                                                style="border-bottom:none; border:none; background:none;"
                                                data-id="6752dcfe49dc10123321f903">1500</span>
                                            handpicked &amp; edited images from all your events
                                            showcasing your wedding story - delivered
                                            in&nbsp;&nbsp;<span
                                                style="border-bottom:none; border:none; background:none;">30</span>&nbsp;
                                            days.</span>&nbsp;</p>
                                </span></div>
                        </div>
                    </div>
                    <div
                        style="display: flex; width: 100%; background-color: rgb(12, 57, 58); position: relative; border-radius: 6px;">
                        <div style="display: flex; flex-direction: column; width: 100%; padding: 16px;">
                            <div style="height: fit-content;"><a style="display: flex;">
                                    <div>
                                        <p><span style="font-family: Georgia, serif; font-size: 17px;"><strong
                                                    style="color: rgb(249, 203, 156);">Albums</strong></span>
                                        </p>
                                    </div>
                                </a><span style="display: flex; margin-bottom: 10px;">
                                    <p><span style="font-family: Georgia, serif; color: rgb(252, 229, 205);">Two
                                            Premium Designer albums consisting of&nbsp;150&nbsp;images
                                            in each, designed according to your preferences - delivered
                                            in&nbsp;25&nbsp;days from the date of selection</span></p>
                                </span></div>
                        </div>
                    </div>
                    <div
                        style="display: flex; width: 100%; background-color: rgb(12, 57, 58); position: relative; border-radius: 6px;">
                        <div style="display: flex; flex-direction: column; width: 100%; padding: 16px;">
                            <div style="height: fit-content;"><a style="display: flex;">
                                    <div>
                                        <p><span style="font-family: Georgia, serif; font-size: 17px;"><strong
                                                    style="color: rgb(249, 203, 156);">Wedding
                                                    Film</strong></span>
                                        </p>
                                    </div>
                                </a><span style="display: flex; margin-bottom: 10px;">
                                    <p><span style="font-family: Georgia, serif; color: rgb(252, 229, 205);">A
                                            cinematic Film of&nbsp;&nbsp;<span
                                                style="border-bottom:none; border:none; background:none;">4 -
                                                6</span>&nbsp;mins with the best footages from all the
                                            events - delivered in&nbsp;&nbsp;<span
                                                style="border-bottom:none; border:none; background:none;">90</span>&nbsp;
                                            days.</span></p>
                                </span></div>
                        </div>
                    </div>
                    <div
                        style="display: flex; width: 100%; background-color: rgb(12, 57, 58); position: relative; border-radius: 6px;">
                        <div style="display: flex; flex-direction: column; width: 100%; padding: 16px;">
                            <div style="height: fit-content;"><a style="display: flex;">
                                    <div>
                                        <p><span style="font-family: Georgia, serif; font-size: 17px;"><strong
                                                    style="color: rgb(249, 203, 156);">Traditional
                                                    Videos</strong></span>
                                        </p>
                                    </div>
                                </a><span style="display: flex; margin-bottom: 10px;">
                                    <p><span style="font-family: Georgia, serif; color: rgb(252, 229, 205);">Full
                                            Length documented long videos for all the events - delivered
                                            in &nbsp;<span
                                                style="border-bottom:none; border:none; background:none;">90</span>
                                            days.
                                            <br></span></p>
                                </span></div>
                        </div>
                    </div>
                    <div
                        style="display: flex; width: 100%; background-color: rgb(12, 57, 58); position: relative; border-radius: 6px;">
                        <div style="display: flex; flex-direction: column; width: 100%; padding: 16px;">
                            <div style="height: fit-content;"><a style="display: flex;">
                                    <div>
                                        <p><span style="font-family: Georgia, serif; font-size: 17px;"><strong
                                                    style="color: rgb(249, 203, 156);">RAW Data</strong></span>
                                        </p>
                                    </div>
                                </a><span style="display: flex; margin-bottom: 10px;">
                                    <p><span style="font-family: Georgia, serif; color: rgb(252, 229, 205);">All
                                            Raw data, Edited photos &amp; videos will be delivered in
                                            Hard drives along with albums.</span></p>
                                </span></div>
                        </div>
                    </div>
                </div>
            </div>   
            <div style="display: flex; justify-content: center; width: 100%; gap: 40px; padding: 20px 0px;">
                <div
                    style="display: flex; flex-direction: column; text-align: center; word-break: break-word; min-width: 880px; max-width: 880px;">
                    <div>
                        <p style="line-height: 1.2;"><span
                                style="font-family: freight-text-pro, serif; color: rgb(249, 203, 156); font-size: 36px;">Charges</span>
                        </p>
                        <p style="line-height: 0.5;"><br></p>
                        <p style="line-height: 1.2;"><span
                                style="font-family: Georgia, serif; color: rgb(252, 229, 205); font-size: 36px;">₹&nbsp;<span
                                    style="border-bottom:none; border:none; background:none;">${totalCost}</span></span>
                        </p>
                        <p><span style="font-family: Georgia, serif; color: rgb(252, 229, 205); font-size: 18px;">+GST
                                18%</span></p>
                        <p style="text-align: center;"><span
                                style="font-family: Georgia, serif; color: rgb(252, 229, 205); font-size: 18px;">50%
                                to be paid in advance to block the dates.</span></p>
                        <p style="text-align: center;"><span
                                style="font-family: Georgia, serif; color: rgb(252, 229, 205); font-size: 18px;">
                                Remaining 50% Payment shall be done on last day of shoot.</span></p>
                        <p style="text-align: center;"><span
                                style="font-family: Georgia, serif; color: rgb(252, 229, 205); font-size: 18px;">Deliverables
                                timeline starts from the date of full payment clearance.</span></p>
                    </div>
                </div>
            </div>

            <div style="display: flex; justify-content: center; width: 100%; gap: 40px; padding: 20px 0px;">
                <div
                    style="display: none; flex-direction: column; text-align: center; word-break: break-word; min-width: 880px; max-width: 880px;">
                    <div style="height: 100%;">
                        <div>
                            <p><span style="font-family: freight-text-pro, serif; font-size: 36px;">Hard
                                    Drives</span></p>
                        </div>
                    </div>
                </div>
                <div
                    style="display: flex; flex-direction: column; text-align: center; word-break: break-word; min-width: 880px; max-width: 880px;">
                    <div style="height: 100%;">
                        <div>
                            <p><span
                                    style="font-family: freight-text-pro, serif; color: rgb(249, 203, 156); font-size: 36px;">Hard
                                    Drives</span></p>
                            <p style="text-align: left;"><span
                                    style="font-family: Georgia, serif; color: rgb(252, 229, 205); font-size: 18px;">✧
                                    You shall provide 2 units of&nbsp;&nbsp;8&nbsp;TB&nbsp;&nbsp;external hard
                                    drives to store all the data and backup</span></p>
                        </div>
                    </div>
                </div>
            </div>

            <div style="display: flex; justify-content: center; width: 100%; gap: 40px; padding: 20px 0px;">
                <div
                    style="display: none; flex-direction: column; text-align: center; word-break: break-word; min-width: 880px; max-width: 880px;">
                    <div style="height: 100%;">
                        <div>
                            <p><br></p>
                            <p><br></p>
                        </div>
                    </div>
                </div>
                <div
                    style="display: flex; flex-direction: column; text-align: center; word-break: break-word; min-width: 880px; max-width: 880px;">
                    <div>
                        <p style="text-align: center;"><span
                                style="font-family: freight-text-pro, serif; color: rgb(249, 203, 156); font-size: 36px;">Additional
                                Services</span></p>
                        <p style="text-align: left;"><span style="font-family: Georgia, serif; font-size: 18px;">
                                <br> <span style="color: rgb(252, 229, 205);">Add-on services provided by our
                                    partner&nbsp;vendor,&nbsp;&nbsp;that can greatly enhance your event
                                    experience.</span></span></p>
                        <p style="text-align: left;"><span
                                style="font-family: Georgia, serif; color: rgb(252, 229, 205); font-size: 18px;"><br></span>
                        </p>
                        <p style="text-align: left;"><span
                                style="font-family: Georgia, serif; color: rgb(252, 229, 205); font-size: 18px;"><strong>LED
                                    Screens</strong> </span></p>
                        <p style="text-align: left;"><span
                                style="font-family: Georgia, serif; color: rgb(252, 229, 205); font-size: 18px;"><br></span>
                        </p>
                        <p style="text-align: left;"><span
                                style="font-family: Georgia, serif; color: rgb(252, 229, 205); font-size: 18px;">✧
                                Charges : ₹&nbsp;&nbsp;20,000&nbsp;per LED Screen</span></p>
                        <p style="text-align: left;"><span
                                style="font-family: Georgia, serif; color: rgb(252, 229, 205); font-size: 18px;">
                                <br> <strong>Web Live</strong> </span></p>
                        <p style="text-align: left;"><span
                                style="font-family: Georgia, serif; color: rgb(252, 229, 205); font-size: 18px;"><br></span>
                        </p>
                        <p style="text-align: left;"><span
                                style="font-family: Georgia, serif; color: rgb(252, 229, 205); font-size: 18px;">✧
                                Charges : ₹&nbsp;&nbsp;15,000&nbsp;per session ( 4 hours )</span></p>
                    </div>
                </div>
            </div>
<div style="justify-content: center;">
            <div style="display: flex; flex-direction: column; justify-content: center; width: 100%; gap: 40px; padding: 20px 0px;">
                <div
                    style="display: flex; flex-direction: column; text-align: center; word-break: break-word; min-width: 880px; max-width: 880px;">
                    <div>
                        <p><span
                                style="font-family: freight-text-pro, serif; font-size: 36px; color: rgb(249, 203, 156);">Terms
                                and Conditions<br></span></p>
                    </div>
                </div>
                <div
                    style="display: flex; flex-direction: column; text-align: center; word-break: break-word; min-width: 880px; max-width: 880px;">
                    <div style="height: 100%;">
                        <div>
                            <p style="text-align: left;"><span
                                    style="font-family: Georgia, serif; line-height: 1; color: rgb(252, 229, 205);">✧
                                    For events held at locations distant from our office, you shall
                                    arrange&nbsp; travel &amp; accommodation for our shoot crew to ensure
                                    seamless service</span></p>
                            <p style="text-align: left;"><span
                                    style="font-family: Georgia, serif; line-height: 1; color: rgb(252, 229, 205);"><br></span>
                            </p>
                            <p style="text-align: left;"><span
                                    style="font-family: Georgia, serif; color: rgb(252, 229, 205);"> ✧
                                    Cancellation after advance payment &amp; team reservation will incur a 25%
                                    fee of the total order value. The remaining amount will be refunded within
                                    90 days&nbsp;</span></p>
                            <p style="text-align: left;"><span
                                    style="font-family: Georgia, serif; color: rgb(252, 229, 205);"><br></span>
                            </p>
                            <p style="text-align: left;"><span
                                    style="font-family: Georgia, serif; color: rgb(252, 229, 205);"> ✧ Our
                                    Pricing is completely based on the list of events you provided ,ensuring
                                    that&nbsp;you're only charged for the services you need.</span></p>
                            <p style="text-align: left;"><span
                                    style="font-family: Georgia, serif; color: rgb(252, 229, 205);"><br></span>
                            </p>
                            <p style="text-align: left;"><span
                                    style="font-family: Georgia, serif; color: rgb(252, 229, 205);">✧ Any
                                    addition of new events will incur additional charges.</span></p>
                            <p style="text-align: left;"><span
                                    style="font-family: Georgia, serif; color: rgb(252, 229, 205);"><br></span>
                            </p>
                            <p style="text-align: left;"><span
                                    style="font-family: Georgia, serif; color: rgb(252, 229, 205);">✧ Any change
                                    of plan or postponement of any events will be accomodated with the best team
                                    available.&nbsp;</span></p>
                            <p style="text-align: left;"><span
                                    style="font-family: Georgia, serif; color: rgb(252, 229, 205);"><br></span>
                            </p>
                            <p style="text-align: left;"><span
                                    style="font-family: Georgia, serif; color: rgb(252, 229, 205);"> ✧ We hold
                                    all the copyrights to use photos and videos in our social media &amp;
                                    promotional platforms.</span></p>
                            <p style="text-align: left;"><span
                                    style="font-family: Georgia, serif; color: rgb(252, 229, 205);"><br></span>
                            </p>
                            <p style="text-align: left;"><span
                                    style="font-family: Georgia, serif; line-height: 1.4; color: rgb(252, 229, 205);">
                                    ✧ While we’ve never lost any event's data in the past 10 years, in the
                                    rarest probability of any data loss, we are liable to shoot another event
                                    for free or deduct the corresponding event charges.</span></p>
                            <p style="text-align: left;"><span
                                    style="font-family: Georgia, serif; line-height: 1.4; color: rgb(252, 229, 205);"><br></span>
                            </p>
                            <p style="text-align: left;"><span
                                    style="font-family: Georgia, serif; color: rgb(252, 229, 205);"> ✧ Re edits
                                    - Photos &amp; Videos - you can mention any number of changes and get it
                                    done within 15 days from the day of delivery. </span></p>
                            <p style="text-align: left;"><span
                                    style="font-family: Georgia, serif; color: rgb(252, 229, 205);"><br></span>
                            </p>
                            <p style="text-align: left;"><span
                                    style="font-family: Georgia, serif; color: rgb(252, 229, 205);">✧ After all
                                    the photos and videos are delivered to you, we will consider the project as
                                    closed &amp; cannot accommodate any further work requests.</span></p>
                            <p style="text-align: left;"><span
                                    style="font-family: Georgia, serif; color: rgb(252, 229, 205);"><br></span>
                            </p>
                            <p style="text-align: left;"><span
                                    style="font-family: Georgia, serif; color: rgb(252, 229, 205);"> ✧ Once your
                                    data is delivered through HDDs, we’ll not own any of your information. We
                                    consider that you’re the sole owner of your data and the complete
                                    responsibility of it lies with you.</span></p>
                        </div>
                    </div>
                </div>
            </div>
            </div>

            
            <div style="display: flex; flex-direction: column;padding: 20px 0px; z-index: 1; width: 100%; gap: 40px;">
                <div
                    style="display: flex; flex-direction: column; text-align: center; color: rgb(0, 0, 0); word-break: break-word;">
                    <div style="height: 100%;">
                        <div>
                            <p style="font-family: Georgia, serif; font-weight: 400; font-size: 22px;"><span
                                    style="color: rgb(252, 229, 205);">Congratulations,</span></p>
                            <p style="font-family: Georgia, serif; font-weight: 400; font-size: 22px;"><span
                                    style="color: rgb(252, 229, 205);">Knoty Weddings</span></p>
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
    </div>
</div>`;
    const newTab = window.open('','_blank');
    newTab.document.write(quoteHTML);
    newTab.document.close();


    document.getElementById("quotationContainer").innerHTML = quoteHTML;

    document.getElementById("quotationOutput").classList.remove("hidden");

}
