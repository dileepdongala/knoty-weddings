import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore, getDoc, doc, addDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

const QUOTATION_COLL = "Quotations";
const SEEDED_DATA_COLL = "Seeded_Data";
const GREETINGS_DOC_ID = "Greetings_Doc";
const COMPLIMENTARY_DOC_ID = "Complimentary_Doc";
const DELIVERABLES_DOC_ID = "Deliverables_Doc";
const EXTRA_REQUIREMENTS_DOC_ID = "Extra_Requirements_Doc";
const TERMS_AND_CONDITIONS_DOC_ID = "Terms_And_Conditions_Doc";
const CHARGES_DOC_ID = "Charges_Doc";
let db;
let title;
let events;
let totalCost;
let addGst;
let validUpTo;
// Array of month names
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var a = ['','One ','Two ','Three ','Four ', 'Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
var b = ['', '', 'Twenty','Thirty','Forty','Fifty', 'Sixty','Seventy','Eighty','Ninety'];


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
    const idURL = params.get("id")
    const id = idURL.split(":::")[1];

    if (!id) {
        document.getElementById("details").innerHTML = `<p style="font-family:cursive; font-size:28px; font-weight: 400; ">
        <span style="color: rgb(231, 239, 208);">❗❗❗Something strange happened. Please contact us ❗❗❗ </span>
    </p>`;
        return;
    }

    const quotationDocRef = doc(db, QUOTATION_COLL, id); // Reference to the 'Quotations' collection and the specific document ID
    try {
        const docSnap = await getDoc(quotationDocRef); // Fetch the document snapshot

        if (docSnap.exists()) {
            const quotation = docSnap.data();

            if (quotation && quotation.status == "Expired") {
                document.getElementById("details").innerHTML = `<p style="font-family:cursive; font-size:28px; font-weight: 400; ">
            <span style="color: rgb(231, 239, 208);">❗❗❗ Quotation is Expired. Please contact us ❗❗❗ </span>
        </p>`;
            } else if (quotation && quotation.status != "Expired") {
                title = quotation.title;
                totalCost = quotation.price;
                addGst = quotation.addGst;
                events = quotation.events;
                validUpTo = quotation.validUpTo;
                let quoteHTML = `<div style="flex-direction: column; background-color: #0e323eed;">`
                quoteHTML += await getGreetingsElement();
                quoteHTML += await getEventsElemet(events);
                quoteHTML += await getComplimentaryElement();
                quoteHTML += await getDeliverablesElement();
                quoteHTML += await getPriceDetailsElement();
                quoteHTML += await getHardDrivesElement();
                quoteHTML += await getAdditionalServicesElement();
                quoteHTML += await getTermsAndConditionsElement();
                quoteHTML += `<div style="display: flex; flex-direction: column;padding: 20px 0px; z-index: 1; width: 100%; gap: 40px;">
                <div
                    style="display: flex; flex-direction: column; text-align: center; color: rgb(0, 0, 0); word-break: break-word;">
                    <div style="height: 100%;">
                        <div>
                            <p style="font-weight: 400; font-size: 22px;">
                            <span style='font-size:22px;'>&#129309;</span>
                            <span
                                    style="color: rgb(242, 243, 237);">Congratulations,</span></p>
                            <p style="font-family: Georgia, serif; font-weight: 400; font-size: 22px;">
                            <span style='font-size:22px;'>&#128525;</span>
                            <span style="color: rgb(242, 243, 237);">Knoty Weddings</span>
                            <span style='font-size:22px;'>&#128525;</span></p>
                            <p style="font-weight: 400; font-size: 22px;">
                            <span style="color: rgb(242, 243, 237);">** This quotation is valid for 7 days (${validUpTo})**</span>
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

async function getDocumentData(collection_name, document_id) {
    const seededDataDocRef = doc(db, collection_name, document_id); // Reference to the 'Quotations' collection and the specific document ID
    try {
        const docSnap = await getDoc(seededDataDocRef); // Fetch the document snapshot

        if (docSnap.exists()) {
            return docSnap.data();
        }
    } catch (error) {
        console.error("Error fetching document:", error);
    }
}

async function getGreetingsElement() {
    let greetings_HTML =
        `<div style="text-align: center;">
       <!-- <p style="font-family: Ariel, sans-serif; font-size:80px; font-weight: 800; ">
            <span style="color: rgb(231, 239, 208);">KNOTY WEDDINGS</span>
        </p>-->
             <img src="logo1.png" alt="Company Logo"
                style="margin-top:20px !important; width:80%"> 
    </div>
    <div style=" text-align: center; color: rgb(0, 0, 0); word-break: break-word;">
        <p style="font-size:25px; font-weight: 400; ">
            <span style="color: rgb(231, 239, 208);">Dear ${title} ,</span>
        </p>`
    const data = await getDocumentData(SEEDED_DATA_COLL, GREETINGS_DOC_ID)
    data.greetings.forEach(item => {
        greetings_HTML +=
            `<p style="line-height: 1.5;">
            <span style="font-size:20px; color: rgb(242, 243, 237);">${item}
            </span>
        </p>`
    });
    greetings_HTML += `</div>`
    return greetings_HTML;
}

async function getEventsElemet() {
    let eventsHTML =
        `<div style=" text-align: center; color: rgb(0, 0, 0); word-break: break-word;">
        <p
            style="font-weight: 400; font-size: 40px; ">
            <span style="color: rgb(231, 239, 208);">
                Events
            </span>
        </p>
    </div>

        <div style="justify-content: center;display: flex;  flex-direction : row; flex-wrap: wrap;">`

    events.forEach(event => {
        let eventDate;
        if (event.date != "TBD") {
            // Split the string into day, month, and year
            const [day, month, year] = event.date.split("-");

            // Convert the month number to short name (subtract 1 for zero-based index)
            const shortMonth = monthNames[parseInt(month, 10) - 1];
            eventDate = day + "-" + shortMonth + "-" + year;
        } else {
            eventDate = event.date
        }
        eventsHTML += `
            <li style="list-style-type:none">
                <div
                    style=" display: inline-block; background-color: #134251; width: 300px; padding: 15px; margin:5px; border-radius: 15px;">
                    <div>
                        <span>&#128198;</span>
                        <span style="color: rgb(242, 243, 237);">${eventDate}</span>
                        <span>&nbsp;</span>
                        <span>&nbsp;</span>
                        <span>&nbsp;</span>
                        <span>&#128205;</span>
                        <span style="color: rgb(242, 243, 237);">${event.location}</span>
                    </div>
                    <div
                        style="font-size:20px; color: rgb(242, 243, 237); display: flex; gap: 20px; flex-flow: wrap; max-width: 748px; justify-content: flex-start; padding-top: 15px; font-weight: 1000">
                        ${event.name}
                    </div>
                    <div
                        style="font-size:20px; color: rgb(242, 243, 237); text-transform: capitalize; font-size: 16px; font-style: normal; font-weight: 400; line-height: normal; padding-top: 10px;">
                        <span>&#128247;</span> 
                         ${event.photographers} Photographers
                    </div>
                    <div
                        style="font-size:20px; color: rgb(242, 243, 237); text-transform: capitalize; font-size: 16px; font-style: normal; font-weight: 400; line-height: normal; padding-top: 10px;">
                        <span>&#127909;</span>
                        ${event.videographers} Videographers
                    </div>
                </div>
                <div class="desc" style="color: rgb(242, 243, 237);">
                </div>
            </li> `;

    });
    eventsHTML += `</div>`;
    return eventsHTML;
}

async function getComplimentaryElement() {
    let complimentary_HTML =
        `<div style="display: flex; justify-content: center; width: 100%; padding: 20px 0px;">
            <div style="text-align : center; background-color: #134251; padding:15px; margin:30px; border-radius:30px" >
            <div style="font-weight: 400; font-size: 40px;color: rgb(231, 239, 208);">
                Complimentary</div>
        <div>`
    const complimentaryData = await getDocumentData(SEEDED_DATA_COLL, COMPLIMENTARY_DOC_ID)
    /* let count = 0;
     complimentaryData.complimentary.forEach(complimentaryItem => {
         if (count == 0) {
             complimentary_HTML +=
                 `<p><span style="font-size: 20px;"><strong
                                             style="font-size:20px;color: rgb(231, 239, 208);">${complimentaryItem}</strong>
                     </span></p>`
         } else {
             complimentary_HTML +=
                 `<p><span style="font-size: 20px; color: rgb(242, 243, 237);">
             ${complimentaryItem}
             </span></p>`
         }
         count += 1;
     });*/

    complimentaryData.complimentary.forEach(complimentaryItem => {
        let complimentaryArr = complimentaryItem.split(":::");
        let count = 0;
        complimentaryArr.forEach(item => {
            if (count == 0) {
                complimentary_HTML +=
                    `<p><span style="font-size: 20px;"><strong
                                                style="font-size:20px;color: rgb(231, 239, 208);">${item}</strong>
                        </span></p>`
            } else {
                complimentary_HTML +=
                    `<p><span style="font-size: 20px; color: rgb(242, 243, 237);">
                ${item}
                </span></p>`
            }
            count += 1;
        });
    });

    complimentary_HTML += `</div>
    </div> </div>`
    return complimentary_HTML;
}

async function getDeliverablesElement() {
    let deliverables_HTML =
        `<div style="text-align : center;">
        <p style="font-weight: 400; font-size: 40px;">
            <span style="color: rgb(231, 239, 208);">
            <span>&#10003;</span>
            Deliverables</span>
        </p>
    </div>
    <div style="display: flex; flex-direction: column; gap: 40px; width: 100%; justify-content: center; align-items: center; z-index: 1;">
    <div style="max-width: 720px; width: 100%; gap: 16px;">`

    const data = await getDocumentData(SEEDED_DATA_COLL, DELIVERABLES_DOC_ID)
    data.Deliverables.forEach(deliverable => {
        let deliverablesArr = deliverable.split(":::");
        deliverables_HTML +=
            `<div style="display: flex; width: 100%; background-color: #134251; position: relative; border-radius: 30px; margin-bottom:16px">
                <div style="display: flex; flex-direction: column; width: 100%; padding: 16px; padding: 16px;">
                    <div style="height: fit-content;">`
        if (deliverablesArr.length > 1) {
            deliverables_HTML +=
                `<a style="display: flex;">
                        <div>
                            <p>
                                <span style="font-size: 17px;">
                                    <strong style="color: rgb(231, 239, 208);">${deliverablesArr[1]}</strong>
                                </span>
                            </p>
                        </div>
                    </a>`
        }
        deliverables_HTML +=
            `<span style="display: flex; margin-bottom: 5px;">
                        <p>
                            <span style="font-size:20px; color: rgb(242, 243, 237);">
                            <span>&#128262;</span>
                            ${deliverablesArr[0]}</span>&nbsp;
                        </p>
                    </span>
                </div>
            </div>
        </div>`
    });
    deliverables_HTML += `</div>
    </div>`
    return deliverables_HTML;
}

function inWords (num) {
    if ((num = num.toString()).length > 9) return 'overflow';
    var n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return; var str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'And ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Only ' : '';
    return str;
}


async function getPriceDetailsElement() {
    const priceInWords = inWords(totalCost);
    let charges_HTML =
        `<div style="display: flex; justify-content: center; width: 100%; padding: 20px 0px;">
        <div style="display: flex; justify-content: center; padding: 20px 0px; background-color: #134251; padding: 30px; margin: 30px; border-radius: 30px;">
    <div
        style="display: flex; flex-direction: column; text-align: center; word-break: break-word;">
        <div>
        <p style="line-height: 1.2;">
            <span
                    style="color: rgb(231, 239, 208); font-size: 36px;">Charges</span>
            </p>
            <p style="line-height: 1.2;"><span
                    style="color: rgb(242, 243, 237); font-size: 36px;">₹&nbsp;<span
                        style="border-bottom:none; border:none; background:none;">${totalCost}</span></span>
            </p>
            <p style="line-height: 1.2;"><span
                        style="color: rgb(242, 243, 237); font-size: 20px; border-bottom:none; border:none; background:none;">( ${priceInWords} Rupees )</span>
            </p>`
    const data = await getDocumentData(SEEDED_DATA_COLL, CHARGES_DOC_ID)
    let count = 0;
    data.charge.forEach(item => {
        if (count != 0 || addGst || addGst == 'true') {
            charges_HTML +=
                `<p>
            <span style="color: rgb(242, 243, 237); font-size: 20px;">
            ${item}
            </span>
        </p>`
        }
        count += 1;
    });
    charges_HTML += `</div> </div> </div> </div>`
    return charges_HTML;
}

async function getHardDrivesElement() {
    let extraRequirements_HTML =
        `<div style="display: flex; justify-content: center; width: 100%; padding: 20px 0px;">`

    const data = await getDocumentData(SEEDED_DATA_COLL, EXTRA_REQUIREMENTS_DOC_ID)
    data.extra_requirements.forEach(item => {
        const heading = item.split(":::")[0];
        const detail = item.split(":::")[1];
        extraRequirements_HTML +=
            `<div style="display: flex; flex-direction: column; background-color: #134251; padding: 30px; border-radius: 30px; text-align: center; word-break: break-word;">
            <div>
                <p>
                    <span style="color: rgb(231, 239, 208); font-size: 36px;">
                    ${heading}</span>
                </p>
                <p style="text-align: center;">
                    <span style="color: rgb(242, 243, 237); font-size: 20px;">
                     ${detail}
                    </span>
                </p>
            </div>
    </div>`
    });
    extraRequirements_HTML += `</div>`
    return extraRequirements_HTML;
}

async function getAdditionalServicesElement() {
    return `<div style="display: flex; justify-content: center; width: 100%; padding: 20px 0px;">
                <div style="display: flex; justify-content: center; padding: 20px 0px; background-color: #134251; margin: 30px; border-radius: 30px;">
                <div
                    style="display: flex; flex-direction: column; text-align: center; word-break: break-word; width : 60%;">
                    <div>
                        <p style="text-align: center;">
                        <span
                                style="color: rgb(231, 239, 208); font-size: 36px;">Additional
                                Services</span></p>
                        <p style="text-align: center;"><span style="font-size: 20px;">
                                <br> <span style="color: rgb(242, 243, 237);">Add-on services provided by our
                                    partner&nbsp;vendor,&nbsp;&nbsp;that can greatly enhance your event
                                    experience.</span></span></p>
                        
                        <p style="text-align: center;"><span
                                style="color: rgb(242, 243, 237); font-size: 20px;"><strong>LED
                                    Screens</strong> </span></p>
                        
                        <p style="text-align: center;"><span
                                style="color: rgb(242, 243, 237); font-size: 20px;">💲
                                Charges : ₹&nbsp;&nbsp;20,000&nbsp;per LED Screen</span></p>
                        <p style="text-align: center;"><span
                                style="color: rgb(242, 243, 237); font-size: 20px;">
                                <br> <strong>Web Live</strong> </span></p>
                        
                        <p style="text-align: center;"><span
                                style="color: rgb(242, 243, 237); font-size: 20px;">💲
                                Charges : ₹&nbsp;&nbsp;15,000&nbsp;per session (&nbsp;5&nbsp;hours&nbsp;)</span></p>
                    </div>
                </div>
            </div> </div>
`;
}

async function getTermsAndConditionsElement() {
    let termsAndConditions_HTML =
        `<div style="display: flex; justify-content: center; width: 100%; padding: 20px 0px;">
        <div style="display: flex; justify-content: center; padding: 20px 0px; background-color: #134251; margin: 30px; border-radius: 30px;">
            <div
            style="display: flex; flex-direction: column; text-align: center">
                <div>
                    <p>
                    <span style="font-size: 36px; color: rgb(231, 239, 208);">Terms
                            and Conditions<br></span></p>
                </div>
            <div
                style="display: flex; flex-direction: column; text-align: center;">
                <div>`
    const data = await getDocumentData(SEEDED_DATA_COLL, TERMS_AND_CONDITIONS_DOC_ID)
    let count = 1;
    data.terms_and_conditions.forEach(item => {
        termsAndConditions_HTML +=
            `<p style="text-align: left; margin:30px">
            <span style="font-size:20px; line-height: 1; color: rgb(242, 243, 237);">
            ${count}. ${item}
            </span>
        </p>`
        count += 1;
    });
    termsAndConditions_HTML += `</div> </div> </div></div></div>`
    return termsAndConditions_HTML;
}

// Disable right-click context menu
document.addEventListener("contextmenu", (e) => e.preventDefault());

// Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
document.addEventListener("keydown", (e) => {
  if (e.keyCode === 123 || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) || (e.ctrlKey && e.key === 'U')) {
    e.preventDefault();
  }
});

// Initialize the database and fetch the quotation
initDB();
