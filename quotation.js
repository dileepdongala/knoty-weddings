import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore, getDoc, doc, addDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

const dbName = "quotationsDB";
const storeName = "quotations";
let db;
let documentId;
let documentRef;
let documentUrl;

// Initialize IndexedDB
function initDB() {
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
    fetchQuotation();
}

// Fetch quotation by ID from IndexedDB
async function fetchQuotation() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id")

    if (!id) {
        document.getElementById("details").textContent = "Invalid ID.";
        return;
    }

    const userDocRef = doc(db, "Quotations", id); // Reference to the 'Quotations' collection and the specific document ID
    try {
        const docSnap = await getDoc(userDocRef); // Fetch the document snapshot

        if (docSnap.exists()) {
            console.log("User data:", docSnap.data());
            const quotation = docSnap.data();

            if(quotation && quotation.expired) {
                document.getElementById("details").textContent = "Quotation is expired. Please contact us";
            } else if  (quotation && !quotation.expired) {
                const bride = quotation.bride;
                const groom = quotation.groom;
                const totalCost = quotation.price;
                const events = quotation.events;
                let quoteHTML = `
<div style="flex-direction: column; background-color: rgb(46, 48, 48);">
    <div style="text-align: center;">
        <div style="display: block;">
            <img src="logo.jpeg" alt="Company Logo" style="width:130px; margin-bottom:20px; margin-top:20px !important;  border-radius: 3000px;">
        </div>
    </div>

    <div style=" text-align: center; color: rgb(0, 0, 0); word-break: break-word;">
    <p
        style="font-family: freight-text-pro, serif; font-weight: 400; font-size: 40px; ">
        <span style="color: rgb(249, 203, 156);">
            Dear  ${bride} & ${groom} ,
        </span>
    </p>
    <p style="line-height: 1.5;">
        <span style="font-family: Georgia, serif; color: rgb(209, 237, 57);">We appreciate your trust in our efforts.&nbsp;&nbsp;
        </span>
    </p>
    <p style="line-height: 1.5;">
        <span style="font-family: Georgia, serif; color: rgb(209, 237, 57);">
            Explore our services, customized deliverables, and pricing that perfectly fit your needs!
        </span>
    </p>
</div>


    <div style=" text-align: center; color: rgb(0, 0, 0); word-break: break-word;">
        <p
            style="font-family: freight-text-pro, serif; font-weight: 400; font-size: 40px; ">
            <span>&#128203;</span>
            <span style="color: rgb(249, 203, 156);">
                Events
            </span>
        </p>
    </div>

    <div style="display: flex;  flex-direction : column; ">
        <div style="justify-content: center;display: flex;  flex-direction : row; flex-wrap: wrap;">`

                events.forEach(event => {

                    quoteHTML += `
            <li style="list-style-type:none">
                <div
                    style=" display: inline-block; background-color: rgb(22, 1 , 1); width: 300px; padding: 15px; margin:5px; border-radius: 15px;">
                    <div>
                        <span>&#128198;</span>
                        <span style="color: rgb(209, 237, 57);">${event.date}</span>,
                        <span>&nbsp;</span>
                        <span>&nbsp;</span>
                        <span>&nbsp;</span>
                        <span>&#128205;</span>
                        <span style="color: rgb(209, 237, 57);">${event.location}</span>
                    </div>
                    <div
                        style="color: rgb(209, 237, 57); display: flex; gap: 20px; flex-flow: wrap; max-width: 748px; justify-content: flex-start; padding-top: 15px;">
                        ${event.name}
                    </div>
                    <div
                        style="color: rgb(209, 237, 57); text-transform: capitalize; font-size: 16px; font-style: normal; font-weight: 400; line-height: normal; padding-top: 10px;">
                        <span>&#128247;</span> 
                         ${event.candidPhotographers} Candid Photographer
                    </div>
                    <div
                        style="color: rgb(209, 237, 57); text-transform: capitalize; font-size: 16px; font-style: normal; font-weight: 400; line-height: normal; padding-top: 10px;">
                        <span>&#128248;</span>
                        ${event.traditionalPhotographers} Traditional Photographer
                    </div>
                    <div
                        style="color: rgb(209, 237, 57); text-transform: capitalize; font-size: 16px; font-style: normal; font-weight: 400; line-height: normal; padding-top: 10px;">
                        <span>&#127909;</span>
                        ${event.cinematographers} Cinematographer
                    </div>
                    <div
                        style="color: rgb(209, 237, 57); text-transform: capitalize; font-size: 16px; font-style: normal; font-weight: 400; line-height: normal; padding-top: 10px; ">
                        <span>&#128249;</span>
                        ${event.traditionalVideographers} Videographer</div>
                </div>
                <div class="desc" style="color: rgb(209, 237, 57);">
                </div>
            </li> `;

                });

                quoteHTML += ` 
        </div>
        <div>
            <div style="text-align : center; background-color: rgb(22, 1 , 1); padding:15px; margin:30px; border-radius:300px" >
                <div style=" font-family: freight-text-pro, serif; font-weight: 400; font-size: 40px;color: rgb(249, 203, 156);">
                <span>&#127909;</span>
                    Complimentary</div>
                <div>
                    <p><span style="font-family: Georgia, serif; font-size: 20px;"><strong
                                                    style="color: rgb(249, 203, 156);">Couple Shoot</strong>
                            </span></p>
                    <p><span style="font-family: Georgia, serif; font-size: 16px; color: rgb(209, 237, 57);">
                    You will receive a curated selection of&nbsp;50&nbsp;elegantly edited and retouched
                    </span></p>
                    <p><span style="font-family: Georgia, serif; font-size: 16px; color: rgb(209, 237, 57);"> 
                    images from your pre-wedding photo shoot, accessible via the cloud.
                    </span></p>
                </div>
            </div>

            <div style="text-align : center;">
                <p style="font-family: freight-text-pro, serif; font-weight: 400; font-size: 40px;"><span
                        style="color: rgb(249, 203, 156);">
                        <span>&#10003;</span>
                        Deliverables</span></p>
            </div>

            <div style="width: 100%; height: 100%; position: absolute; top: 0; left: 0; z-index: 0; opacity: .3;"></div>
            <div 
                style="display: flex; flex-direction: column; gap: 40px; width: 100%; justify-content: center; align-items: center; z-index: 1;">
                <div  style="max-width: 720px; width: 100%; gap: 16px;">
                    <div
                        style="display: flex; width: 100%; background-color: rgb(22, 1 , 1); position: relative; border-radius: 30px;">
                        <div style="display: flex; flex-direction: column; width: 100%; padding: 16px; padding: 16px;">
                            <div style="height: fit-content;"><a style="display: flex;">
                                    <div>
                                        <p><span style="font-family: Georgia, serif; font-size: 17px;"><strong
                                                    style="color: rgb(249, 203, 156);">Photos</strong></span>
                                        </p>
                                    </div>
                                </a><span style="display: flex; margin-bottom: 5px;">
                                    <p><span style="font-family: Georgia, serif; color: rgb(209, 237, 57);">You
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
                        style="display: flex; width: 100%; background-color: rgb(22, 1 , 1); position: relative; border-radius: 30px;">
                        <div style="display: flex; flex-direction: column; width: 100%; padding: 16px;">
                            <div style="height: fit-content;"><a style="display: flex;">
                                    <div>
                                        <p><span style="font-family: Georgia, serif; font-size: 17px;"><strong
                                                    style="color: rgb(249, 203, 156);">Albums</strong></span>
                                        </p>
                                    </div>
                                </a><span style="display: flex; margin-bottom: 5px;">
                                    <p><span style="font-family: Georgia, serif; color: rgb(209, 237, 57);">Two
                                            Premium Designer albums consisting of&nbsp;150&nbsp;images
                                            in each, designed according to your preferences - delivered
                                            in&nbsp;25&nbsp;days from the date of selection</span></p>
                                </span></div>
                        </div>
                    </div>
                    <div
                        style="display: flex; width: 100%; background-color: rgb(22, 1 , 1); position: relative; border-radius: 30px;">
                        <div style="display: flex; flex-direction: column; width: 100%; padding: 16px;">
                            <div style="height: fit-content;"><a style="display: flex;">
                                    <div>
                                        <p><span style="font-family: Georgia, serif; font-size: 17px;"><strong
                                                    style="color: rgb(249, 203, 156);">Wedding
                                                    Film</strong></span>
                                        </p>
                                    </div>
                                </a><span style="display: flex; margin-bottom: 5px;">
                                    <p><span style="font-family: Georgia, serif; color: rgb(209, 237, 57);">A
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
                        style="display: flex; width: 100%; background-color: rgb(22, 1 , 1); position: relative; border-radius: 30px;">
                        <div style="display: flex; flex-direction: column; width: 100%; padding: 16px;">
                            <div style="height: fit-content;"><a style="display: flex;">
                                    <div>
                                        <p><span style="font-family: Georgia, serif; font-size: 17px;"><strong
                                                    style="color: rgb(249, 203, 156);">Traditional
                                                    Videos</strong></span>
                                        </p>
                                    </div>
                                </a><span style="display: flex; margin-bottom: 5px;">
                                    <p><span style="font-family: Georgia, serif; color: rgb(209, 237, 57);">Full
                                            Length documented long videos for all the events - delivered
                                            in &nbsp;<span
                                                style="border-bottom:none; border:none; background:none;">90</span>
                                            days.
                                            <br></span></p>
                                </span></div>
                        </div>
                    </div>
                    <div
                        style="display: flex; width: 100%; background-color: rgb(22, 1 , 1); position: relative; border-radius: 30px;">
                        <div style="display: flex; flex-direction: column; width: 100%; padding: 16px;">
                            <div style="height: fit-content;"><a style="display: flex;">
                                    <div>
                                        <p><span style="font-family: Georgia, serif; font-size: 17px;"><strong
                                                    style="color: rgb(249, 203, 156);">RAW Data</strong></span>
                                        </p>
                                    </div>
                                </a><span style="display: flex; margin-bottom: 5px;">
                                    <p><span style="font-family: Georgia, serif; color: rgb(209, 237, 57);">All
                                            Raw data, Edited photos &amp; videos will be delivered in
                                            Hard drives along with albums.</span></p>
                                </span></div>
                        </div>
                    </div>
                </div>
            </div>   
            <div style="display: flex; justify-content: center; padding: 20px 0px; background-color: rgb(22, 1 , 1); padding: 15px; margin: 30px; border-radius: 300px;">
                <div
                    style="display: flex; flex-direction: column; text-align: center; word-break: break-word; width : 60%;">
                    <div>
                        <p style="line-height: 1.2;">
                        <span style='font-size:35px;'>&#128181;</span><span
                                style="font-family: freight-text-pro, serif; color: rgb(249, 203, 156); font-size: 36px;">Charges</span>
                        </p>
                        <p style="line-height: 1.2;"><span
                                style="font-family: Georgia, serif; color: rgb(209, 237, 57); font-size: 36px;">₹&nbsp;<span
                                    style="border-bottom:none; border:none; background:none;">${totalCost}</span></span>
                        </p>
                        <p><span style="font-family: Georgia, serif; color: rgb(209, 237, 57); font-size: 18px;">+GST
                                18%</span></p>
                        <p style="text-align: center;"><span
                                style="font-family: Georgia, serif; color: rgb(209, 237, 57); font-size: 18px;">50%
                                to be paid in advance to block the dates.</span></p>
                        <p style="text-align: center;"><span
                                style="font-family: Georgia, serif; color: rgb(209, 237, 57); font-size: 18px;">
                                Remaining 50% Payment shall be done on last day of shoot.</span></p>
                        <p style="text-align: center;"><span
                                style="font-family: Georgia, serif; color: rgb(209, 237, 57); font-size: 18px;">Deliverables
                                timeline starts from the date of full payment clearance.</span></p>
                    </div>
                </div>
            </div>

            <div style="display: flex; justify-content: center; width: 100%; gap: 40px; padding: 20px 0px;">
                <div
                    style="display: flex; flex-direction: column; background-color: rgb(22, 1 , 1); padding: 15px; border-radius: 30px; text-align: center; word-break: break-word; width : 70%;">
                        <div>
                            <p><span style='font-size:36px;'>&#128190;</span>
                            <span
                                    style="font-family: freight-text-pro, serif; color: rgb(249, 203, 156); font-size: 36px;">Hard
                                    Drives</span></p>
                            <p style="text-align: left;"><span
                                    style="font-family: Georgia, serif; color: rgb(209, 237, 57); font-size: 18px;">📭
                                    You shall provide 2 units of&nbsp;&nbsp;8&nbsp;TB&nbsp;&nbsp;external hard
                                    drives to store all the data and backup</span></p>
                        </div>
                </div>
            </div>

            <div style="display: flex; justify-content: center; padding: 20px 0px; background-color: rgb(22, 1 , 1); margin: 30px; border-radius: 300px;">
                <div
                    style="display: flex; flex-direction: column; text-align: center; word-break: break-word; width : 60%;">
                    <div>
                        <p style="text-align: center;">
                        <span style='font-size:36px;'>&#128279;</span>
                        <span
                                style="font-family: freight-text-pro, serif; color: rgb(249, 203, 156); font-size: 36px;">Additional
                                Services</span></p>
                        <p style="text-align: left;"><span style="font-family: Georgia, serif; font-size: 18px;">
                                <br> <span style="color: rgb(209, 237, 57);">Add-on services provided by our
                                    partner&nbsp;vendor,&nbsp;&nbsp;that can greatly enhance your event
                                    experience.</span></span></p>
                        
                        <p style="text-align: left;"><span
                                style="font-family: Georgia, serif; color: rgb(209, 237, 57); font-size: 18px;"><strong>LED
                                    Screens</strong> </span></p>
                        
                        <p style="text-align: left;"><span
                                style="font-family: Georgia, serif; color: rgb(209, 237, 57); font-size: 18px;">💲
                                Charges : ₹&nbsp;&nbsp;20,000&nbsp;per LED Screen</span></p>
                        <p style="text-align: left;"><span
                                style="font-family: Georgia, serif; color: rgb(209, 237, 57); font-size: 18px;">
                                <br> <strong>Web Live</strong> </span></p>
                        
                        <p style="text-align: left;"><span
                                style="font-family: Georgia, serif; color: rgb(209, 237, 57); font-size: 18px;">💲
                                Charges : ₹&nbsp;&nbsp;15,000&nbsp;per session ( 4 hours )</span></p>
                    </div>
                </div>
            </div>
            <div
            style="display: flex; flex-direction: column; text-align: center;">
                <div>
                    <p>
                    <span style='font-size:36px;'>&#128209;</span>
                    <span style="font-family: freight-text-pro, serif; font-size: 36px; color: rgb(249, 203, 156);">Terms
                            and Conditions<br></span></p>
                </div>
            <div
                style="display: flex; flex-direction: column; text-align: center;">
                <div>
                    <p style="text-align: left; margin:30px"><span
                            style="font-family: Georgia, serif; line-height: 1; color: rgb(209, 237, 57);">📌
                            For events held at locations distant from our office, you shall
                            arrange&nbsp; travel &amp; accommodation for our shoot crew to ensure
                            seamless service</span></p>
                    <p style="text-align: left; margin:30px"><span style="font-family: Georgia, serif; color: rgb(209, 237, 57);">
                            📌
                            Cancellation after advance payment &amp; team reservation will incur a 25%
                            fee of the total order value. The remaining amount will be refunded within
                            90 days&nbsp;</span></p>
                    <p style="text-align: left; margin:30px"><span style="font-family: Georgia, serif; color: rgb(209, 237, 57);">
                            📌
                            Our
                            Pricing is completely based on the list of events you provided ,ensuring
                            that&nbsp;you're only charged for the services you need.</span></p>
                    <p style="text-align: left; margin:30px"><span style="font-family: Georgia, serif; color: rgb(209, 237, 57);">📌
                            Any
                            addition of new events will incur additional charges.</span></p>
                    <p style="text-align: left; margin:30px"><span style="font-family: Georgia, serif; color: rgb(209, 237, 57);">📌
                            Any
                            change
                            of plan or postponement of any events will be accomodated with the best team
                            available.&nbsp;</span></p>
                    <p style="text-align: left; margin:30px"><span style="font-family: Georgia, serif; color: rgb(209, 237, 57);">
                            📌 We
                            hold
                            all the copyrights to use photos and videos in our social media &amp;
                            promotional platforms.</span></p>
                    <p style="text-align: left; margin:30px"><span
                            style="font-family: Georgia, serif; line-height: 1.4; color: rgb(209, 237, 57);">
                            📌 While we’ve never lost any event's data in the past 10 years, in the
                            rarest probability of any data loss, we are liable to shoot another event
                            for free or deduct the corresponding event charges.</span></p>
                    <p style="text-align: left; margin:30px"><span style="font-family: Georgia, serif; color: rgb(209, 237, 57);">
                            📌 Re
                            edits
                            - Photos &amp; Videos - you can mention any number of changes and get it
                            done within 15 days from the day of delivery. </span></p>
                    <p style="text-align: left; margin:30px"><span style="font-family: Georgia, serif; color: rgb(209, 237, 57);">📌
                            After all
                            the photos and videos are delivered to you, we will consider the project as
                            closed &amp; cannot accommodate any further work requests.</span></p>
                    <p style="text-align: left; margin:30px"><span style="font-family: Georgia, serif; color: rgb(209, 237, 57);">
                            📌
                            Once your
                            data is delivered through HDDs, we’ll not own any of your information. We
                            consider that you’re the sole owner of your data and the complete
                            responsibility of it lies with you.</span></p>
                </div>
            </div>
        </div>
     <div style="display: flex; flex-direction: column;padding: 20px 0px; z-index: 1; width: 100%; gap: 40px;">
                <div
                    style="display: flex; flex-direction: column; text-align: center; color: rgb(0, 0, 0); word-break: break-word;">
                    <div style="height: 100%;">
                        <div>
                            <p style="font-family: Georgia, serif; font-weight: 400; font-size: 22px;">
                            <span style='font-size:22px;'>&#129309;</span>
                            <span
                                    style="color: rgb(209, 237, 57);">Congratulations,</span></p>
                            <p style="font-family: Georgia, serif; font-weight: 400; font-size: 22px;">
                            <span style='font-size:22px;'>&#128525;</span>
                            <span style="color: rgb(209, 237, 57);">Knoty Weddings</span>
                            <span style='font-size:22px;'>&#128525;</span></p>
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
    </div>
</div>`;
                document.getElementById("details").innerHTML = quoteHTML;
            } else {
                document.getElementById("details").textContent = "Quotation not found.";
            }
        }
        else {
            console.log("No such document!");
        }
    } catch (error) {
        console.error("Error fetching document:", error);
    }

}

// Initialize the database and fetch the quotation
initDB();
