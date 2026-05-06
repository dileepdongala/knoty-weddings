import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, addDoc, updateDoc, getDoc, deleteDoc, query, where, setDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

const QUOTATION_COLL = "Quotations";
const SEEDED_DATA_COLL = "Seeded_Data";
const GREETINGS_DOC_ID = "Greetings_Doc";
const COMPLIMENTARY_DOC_ID = "Complimentary_Doc";
const DELIVERABLES_DOC_ID = "Deliverables";
const ADDITIONAL_SERVICES_DOC_ID = "Additional_Services_Doc";
const TERMS_AND_CONDITIONS_DOC_ID = "Terms_And_Conditions_Doc";
const WHATSAPP_MESSAGE_ID = "Whatsapp_message";
const QUOTATION_HOST = "Quotation_Host";
let db;
let documentId;
let eventsCount = 1;
let termsAndConditionsCount = 0;
let deliverablesCount = 0;
let complimentaryCount = 0;
let defaultAdditionalServiceCount = 0;
let greetingsCount = 0;
let customAddOnCount = 0;
let customDeliverablesCount = 0;
let documentUrl;
let hostUrl;
let proposalDefaultsLoadPromise;
let proposalDefaults = {
  complimentary: [],
  deliverables: {},
  additionalServices: {}
};
let createInProgress = false;
let editInProgress = false;
let oldTitleInEdit;

// Pagination variables
let allQuotations = [];
let filteredQuotations = [];
let currentPage = 1;
const itemsPerPage = 15;

function toggleTableFiltersVisibility(shouldShow) {
  document.getElementById("tableFilters").classList.toggle("hidden", !shouldShow);
}

function updateFilterSummary() {
  const resultCount = filteredQuotations.length;
  const totalCount = allQuotations.length;
  const label = totalCount === 1 ? "proposal" : "proposals";
  document.getElementById("filterResultCount").textContent = `Showing ${resultCount} of ${totalCount} ${label}`;
}

function applyQuotationFilters(resetPage = false) {
  const titleSearchValue = document.getElementById("titleSearch").value.trim().toLowerCase();
  const selectedStatus = document.getElementById("statusFilter").value;

  filteredQuotations = allQuotations.filter((quotation) => {
    const matchesTitle = !titleSearchValue || (quotation.title || "").toLowerCase().includes(titleSearchValue);
    const matchesStatus = !selectedStatus || quotation.status === selectedStatus;
    return matchesTitle && matchesStatus;
  });

  if (resetPage) {
    currentPage = 1;
  } else {
    const totalPages = Math.max(1, Math.ceil(filteredQuotations.length / itemsPerPage));
    currentPage = Math.min(currentPage, totalPages);
  }

  updateFilterSummary();
  renderPage();
}

function createDefaultDeliverablesState() {
  return {
    photos: "1000 Handpicked & Edited images in Cloud (delivered in 20 days )",
    albums: "Two premium Designer Albums 150-200 images in each album (40 sheets per album)",
    film: "A cinematic Film of 3-5 mins with best footages from all the events in cloud (delivered in 60 days )",
    long_video: "Full Length Documented long videos for all the events in hard drives (delivered in 60 days )",
    reels: "Reels from 2 different events , duration of each reel is 30 sec to 1 min - delivered in 60 days.",
    raw_data: "All Raw data, Edited photos & videos in Hard drives",
    additional_deliverables: []
  };
}

function createDefaultAdditionalServicesState() {
  return {
    intro: "Add-on services provided by our partner vendors that can greatly enhance your event experience.",
    led: {
      title: "LED Screens",
      price: "20,000",
      details: "per LED screen"
    },
    web_live: {
      title: "Web Live",
      price: "20,000",
      time: 5,
      details: "per session"
    },
    albums: {
      title: "Albums",
      price: "20,000",
      photos: 150,
      details: "per album"
    },
    additional_services: []
  };
}

function normalizeTextValue(value) {
  return `${value || ""}`.trim();
}

function normalizeList(list) {
  return Array.isArray(list) ? list.filter(item => item && `${item}`.trim()) : [];
}

function parseStructuredEntry(entry, fallbackTitle = "") {
  if (!entry) {
    return { title: fallbackTitle, details: "" };
  }

  if (typeof entry === "object") {
    const title = normalizeTextValue(entry.title || entry.main || fallbackTitle);
    const details = normalizeTextValue(entry.details || entry.meta);
    return { title, details };
  }

  const text = normalizeTextValue(entry);
  if (!text) {
    return { title: fallbackTitle, details: "" };
  }

  if (text.includes(":::")) {
    const [title, ...rest] = text.split(":::");
    return {
      title: normalizeTextValue(title) || fallbackTitle,
      details: normalizeTextValue(rest.join(":::"))
    };
  }

  const bracketMatch = text.match(/^(.*?)(?:\(([^)]+)\))$/);
  if (bracketMatch) {
    return {
      title: normalizeTextValue(bracketMatch[1]) || fallbackTitle,
      details: normalizeTextValue(bracketMatch[2])
    };
  }

  return { title: text || fallbackTitle, details: "" };
}

function serializeStructuredEntry(entry) {
  const title = normalizeTextValue(entry?.title || entry?.main);
  const details = normalizeTextValue(entry?.details || entry?.meta);
  if (!title) return "";
  return details ? `${title}:::${details}` : title;
}

function formatDeliverablePreview(entry) {
  const title = normalizeTextValue(entry?.title);
  const details = normalizeTextValue(entry?.details);
  if (!title) return "";
  return details ? `${title} (${details})` : title;
}

function normalizeDeliverablesDoc(data = {}) {
  const defaults = createDefaultDeliverablesState();
  const legacyList = normalizeList(data.Deliverables);
  const usesLegacyReelsSlot = legacyList.length >= 6;

  return {
    photos: data.photos || legacyList[0] || defaults.photos,
    albums: data.albums || legacyList[1] || defaults.albums,
    film: data.film || legacyList[2] || defaults.film,
    long_video: data.long_video || legacyList[3] || defaults.long_video,
    reels: data.reels || (usesLegacyReelsSlot ? legacyList[4] : "") || defaults.reels,
    raw_data: data.raw_data || (usesLegacyReelsSlot ? legacyList[5] : legacyList[4]) || defaults.raw_data,
    additional_deliverables: normalizeList(
      data.additional_deliverables || (usesLegacyReelsSlot ? legacyList.slice(6) : legacyList.slice(5))
    ).map(item => parseStructuredEntry(item))
  };
}

function normalizeComplimentaryDoc(data = {}) {
  const complimentary = normalizeList(data.items || data.complimentary).map(item => parseStructuredEntry(item));
  if (complimentary.length) {
    return complimentary;
  }

  return [
    {
      title: "Drone",
      details: "Drone coverage is complimentary for the wedding event."
    },
    {
      title: "Pre-Wedding Photoshoot",
      details: "You will receive a collection of 50 beautifully edited & retouched images in cloud gallery"
    }
  ];
}

function normalizeAdditionalServiceItem(service = {}) {
  return {
    title: (service.title || "").trim(),
    price: (service.price || "").trim(),
    details: (service.details || "").trim()
  };
}

function normalizeAdditionalServicesDoc(data = {}) {
  const defaults = createDefaultAdditionalServicesState();
  return {
    intro: (data.intro || defaults.intro).trim(),
    led: {
      title: (data.led?.title || defaults.led.title).trim(),
      price: (data.led?.price || defaults.led.price).trim(),
      details: (data.led?.details || defaults.led.details).trim()
    },
    web_live: {
      title: (data.web_live?.title || defaults.web_live.title).trim(),
      price: (data.web_live?.price || defaults.web_live.price).trim(),
      time: Number(data.web_live?.time || defaults.web_live.time) || defaults.web_live.time,
      details: (data.web_live?.details || defaults.web_live.details).trim()
    },
    albums: {
      title: (data.albums?.title || defaults.albums.title).trim(),
      price: (data.albums?.price || defaults.albums.price).trim(),
      photos: Number(data.albums?.photos || defaults.albums.photos) || defaults.albums.photos,
      details: (data.albums?.details || defaults.albums.details).trim()
    },
    additional_services: Array.isArray(data.additional_services)
      ? data.additional_services
        .map(normalizeAdditionalServiceItem)
        .filter(service => service.title || service.price || service.details)
      : []
  };
}

function getPreWeddingComplimentaryText(complimentaryList = []) {
  const match = complimentaryList.find(item => normalizeTextValue(item.title).toLowerCase().includes("pre-wedding"));
  if (!match) {
    return "You will receive a collection of 50 beautifully edited & retouched images in cloud gallery";
  }

  return normalizeTextValue(match.details) || "You will receive a collection of 50 beautifully edited & retouched images in cloud gallery";
}

function getDroneComplimentaryText(complimentaryList = []) {
  const match = complimentaryList.find(item => normalizeTextValue(item.title).toLowerCase().includes("drone"));
  if (!match) {
    return "Drone coverage is complimentary for the wedding event.";
  }

  return normalizeTextValue(match.details) || "Drone coverage is complimentary for the wedding event.";
}

function createQuotationSlug(title = "") {
  return normalizeTextValue(title)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isLocalPreviewContext() {
  return window.location.protocol === "file:"
    || window.location.hostname === "localhost"
    || window.location.hostname === "127.0.0.1";
}

function getLocalQuotationPreviewUrl(title) {
  const previewUrl = new URL("./quotation.html", window.location.href);
  previewUrl.searchParams.set("title", title);
  return previewUrl.toString();
}

function getQuotationOpenUrl(quotation) {
  if (isLocalPreviewContext()) {
    return getLocalQuotationPreviewUrl(quotation.title);
  }

  return `${hostUrl}${quotation.url || `/${quotation.slug || createQuotationSlug(quotation.title)}`}`;
}

function getQuotationPdfUrl(quotation) {
  const pdfUrl = new URL(getQuotationOpenUrl(quotation), window.location.href);
  pdfUrl.searchParams.set("download", "pdf");
  return pdfUrl.toString();
}

function applyProposalFormDefaults() {
  const deliverables = proposalDefaults.deliverables;
  const services = proposalDefaults.additionalServices;

  document.getElementById("preWeddingShootId").value = getPreWeddingComplimentaryText(proposalDefaults.complimentary);
  document.getElementById("droneComplimentaryHint").textContent = `*${getDroneComplimentaryText(proposalDefaults.complimentary)}*`;

  document.getElementById("albumsAddOnCostId").value = services.albums.price;
  document.getElementById("albumsAddOnPhotosId").value = services.albums.photos;
  document.getElementById("ledScreensId").value = services.led.price;
  document.getElementById("webLiveId").value = services.web_live.price;
  document.getElementById("webLiveTimeId").value = services.web_live.time;

  document.getElementById("albumsAddOnServiceNameLabel").textContent = services.albums.title;
  document.getElementById("albumsAddOnSectionLabel").textContent = services.albums.title;
  document.getElementById("albumsAddOnUnitLabel").textContent = services.albums.details;
  document.getElementById("albumsAddOnCountUnitLabel").textContent = "images";
  document.getElementById("ledSectionTitleLabel").textContent = services.led.title;
  document.getElementById("ledSectionDetailsLabel").textContent = services.led.details;
  document.getElementById("webLiveSectionTitleLabel").textContent = services.web_live.title;
  document.getElementById("webLiveSectionDetailsLabel").textContent = services.web_live.details;
  document.getElementById("webLiveSectionTimeUnitLabel").textContent = "hours";

  document.getElementById("defaultDeliverableSummaryPhotos").textContent = `1. ${deliverables.photos}`;
  document.getElementById("defaultDeliverableSummaryAlbums").textContent = `2. ${deliverables.albums}`;
  document.getElementById("defaultDeliverableSummaryFilm").textContent = `3. ${deliverables.film}`;
  document.getElementById("defaultDeliverableSummaryLongVideos").textContent = `4. ${deliverables.long_video}`;
  document.getElementById("defaultDeliverableSummaryReels").textContent = `5. ${deliverables.reels}`;
  document.getElementById("defaultDeliverableSummaryRawData").textContent = `6. ${deliverables.raw_data}`;

  document.getElementById("deliverables-photos-Id").value = deliverables.photos;
  document.getElementById("deliverables-albums-Id").value = deliverables.albums;
  document.getElementById("deliverables-film-Id").value = deliverables.film;
  document.getElementById("deliverables-longVideos-Id").value = deliverables.long_video;
  document.getElementById("deliverables-reels-Id").value = deliverables.reels;
  document.getElementById("deliverables-rawData-Id").value = deliverables.raw_data;
}

async function loadProposalDefaults(forceReload = false) {
  if (proposalDefaultsLoadPromise && !forceReload) {
    return proposalDefaultsLoadPromise;
  }

  proposalDefaultsLoadPromise = (async () => {
    const [complimentaryDoc, deliverablesDoc, additionalServicesDoc] = await Promise.all([
      getDocumentData(SEEDED_DATA_COLL, COMPLIMENTARY_DOC_ID),
      getDocumentData(SEEDED_DATA_COLL, DELIVERABLES_DOC_ID),
      getDocumentData(SEEDED_DATA_COLL, ADDITIONAL_SERVICES_DOC_ID)
    ]);

    proposalDefaults = {
      complimentary: normalizeComplimentaryDoc(complimentaryDoc || {}),
      deliverables: normalizeDeliverablesDoc(deliverablesDoc || {}),
      additionalServices: normalizeAdditionalServicesDoc(additionalServicesDoc || {})
    };

    applyProposalFormDefaults();
    return proposalDefaults;
  })();

  return proposalDefaultsLoadPromise;
}

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
  getQuotationHost();
  loadProposalDefaults();
  fetchQuotations();
}

async function getQuotationHost() {
  const data = await getDocumentData(SEEDED_DATA_COLL, QUOTATION_HOST);
  hostUrl = data.Quotation_host;
}

// Add a quotation to fireBase
async function addQuotation(quotation, deliverablesObj) {

  // Add data
  const now = new Date();

  const day = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-indexed
  const year = now.getFullYear().toString();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');

  const formattedDateTime = `${day}-${month}-${year} ${hours}:${minutes}`;

  const today = new Date();
  today.setDate(today.getDate() + 14); // Changed from 7 to 14 days
  // Format the date as dd-MMM-yyyy
  const options = { day: '2-digit', month: 'short', year: 'numeric' };
  let formatedToday = today.toLocaleDateString('en-US', options).replace(',', '');

  const quotationCollectionRef = collection(db, QUOTATION_COLL); // Reference to the 'Quotations' collection

  const quotationData = {
    title: quotation.title,
    slug: createQuotationSlug(quotation.title),
    price: quotation.price,
    created_date: formattedDateTime,
    events: quotation.events,
    status: "Draft",
    addGst: quotation.addGst,
    validUpTo: editInProgress ? document.getElementById("editValidUpToId").value : formatedToday.split(" ")[1] + "-" + formatedToday.split(" ")[0] + "-" + formatedToday.split(" ")[2],
    mobile: quotation.mobile,
    splitTeam: quotation.splitTeam,
    Albums_Addon: quotation.Albums_Addon,
    HD_Changed: quotation.HD_Changed,
    LED_Changed: quotation.LED_Changed,
    WebLive_Changed: quotation.WebLive_Changed,
    pwpsRequired: quotation.pwpsRequired,
    droneRequired: quotation.droneRequired,
    custom_add_on_services: quotation.customAddOnServices,
    custom_deliverables: quotation.customDeliverables,
  };
  if (quotation.Albums_Addon) {
    quotationData.Albums_Addon_Changed = quotation.Albums_Addon_Changed;
    if (quotation.Albums_Addon_Changed) {
      quotationData.Albums_Addon_Price = quotation.Albums_Addon_Price;
      quotationData.Albums_Addon_Photos = quotation.Albums_Addon_Photos;
    }
  }
  if (quotation.HD_Changed) {
    quotationData.HD_Count = quotation.HD_Count;
    quotationData.HD_Size = quotation.HD_Size;
  }
  if (quotation.LED_Changed) {
    quotationData.LED_Price = quotation.LED_Price;
  }
  if (quotation.WebLive_Changed) {
    quotationData.WebLive_Price = quotation.WebLive_Price;
    quotationData.WebLive_Time = quotation.WebLive_Time;
  }
  if (quotation.pwpsRequired) {
    quotationData.pwpsChange = quotation.pwpsChange;
    if (quotation.pwpsChange) {
      quotationData.preWeddingPhotoShoot = quotation.preWeddingPhotoShoot;
    }
  }
  if (typeof deliverablesObj.delChange === "boolean") {
    quotationData.delChange = deliverablesObj.delChange;
  }
  if (typeof deliverablesObj.disPlayDelRawData === "boolean") {
    quotationData.display_del_raw_data = deliverablesObj.disPlayDelRawData;
  }
  if (typeof deliverablesObj.disPlayDelLongVideos === "boolean") {
    quotationData.display_del_long_videos = deliverablesObj.disPlayDelLongVideos;
  }
  if (typeof deliverablesObj.disPlayDelPhotos === "boolean") {
    quotationData.display_del_photos = deliverablesObj.disPlayDelPhotos;
  }
  if (typeof deliverablesObj.disPlayDelAlbums === "boolean") {
    quotationData.display_del_albums = deliverablesObj.disPlayDelAlbums;
  }
  if (typeof deliverablesObj.disPlayDelFilms === "boolean") {
    quotationData.display_del_films = deliverablesObj.disPlayDelFilms;
  }
  if (typeof deliverablesObj.disPlayDelReels === "boolean") {
    quotationData.display_del_reels = deliverablesObj.disPlayDelReels;
  }
  if (deliverablesObj.delChange) {
    if (deliverablesObj.disPlayDelRawData && deliverablesObj.changeDelRawData) {
      quotationData.del_raw_data = deliverablesObj.updatedDelRawData;
    }
    if (deliverablesObj.disPlayDelLongVideos && deliverablesObj.changeDelLongVideos) {
      quotationData.del_long_videos = deliverablesObj.updatedDelLongVideos;
    }
    if (deliverablesObj.disPlayDelPhotos && deliverablesObj.changeDelPhotos) {
      quotationData.del_photos = deliverablesObj.updatedDelPhotos;
    }
    if (deliverablesObj.disPlayDelAlbums && deliverablesObj.changeDelAlbums) {
      quotationData.del_albums = deliverablesObj.updatedDelAlbums;
    }
    if (deliverablesObj.disPlayDelFilms && deliverablesObj.changeDelFilms) {
      quotationData.del_films = deliverablesObj.updatedDelFilms;
    }
    if (deliverablesObj.disPlayDelReels && deliverablesObj.changeDelReels) {
      quotationData.del_reels = deliverablesObj.updatedDelReels;
    }
  }
  try {
    if (editInProgress) {
      const editDocId = document.getElementById("editDocumentId").value;
      const docRef = doc(db, QUOTATION_COLL, editDocId);
      await updateDoc(docRef, quotationData);
      documentId = editDocId;
    }
    if (createInProgress) {
      const docRef = await addDoc(quotationCollectionRef, quotationData);
      documentId = docRef.id;
    }
    documentUrl = `/${quotationData.slug}`;

    // Open the quotation in a new tab
    window.open(getQuotationOpenUrl({ ...quotationData, url: documentUrl }), "_blank");
  } catch (error) {
    showToast("Error adding document: "+ error, "error");
  }
  const docRef = doc(db, QUOTATION_COLL, documentId);

  const updatedData = {
    ['slug']: quotationData.slug,
    ['url']: documentUrl, // Dynamically set the field to update
  };
  await updateDoc(docRef, updatedData);

  document.getElementById("quotationForm").reset();

  document.getElementById("formContainer").classList.toggle("hidden");
  createInProgress = false;
  editInProgress = false;
  fetchQuotations();

}

function sortTableByDate() {
  allQuotations.sort((a, b) => {
    let dateA = a.created_date;
    let dateB = b.created_date;

    // Convert "dd-mm-yyyy hh:mm" to Date object for comparison
    let timestampA = new Date(dateA.split(" ")[0].split("-").reverse().join("-") + "T" + dateA.split(" ")[1]);
    let timestampB = new Date(dateB.split(" ")[0].split("-").reverse().join("-") + "T" + dateB.split(" ")[1]);

    return timestampB - timestampA; // Descending order (latest first)
  });
}

function renderPage() {
  const totalItems = filteredQuotations.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  currentPage = Math.min(currentPage, totalPages);
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageData = filteredQuotations.slice(start, end);

  const tableBody = document.querySelector("#quotationTable tbody");
  tableBody.innerHTML = "";

  if (!pageData.length) {
    tableBody.innerHTML = `
      <tr class="empty-state">
        <td colspan="9">No proposals match the current search or status filter.</td>
      </tr>
    `;
    document.getElementById("pageInfo").textContent = totalItems === 0 ? "No matching proposals" : `Page ${currentPage} of ${totalPages}`;
    document.getElementById("prevPage").disabled = true;
    document.getElementById("nextPage").disabled = true;
    document.getElementById("paginationContainer").classList.add("hidden");
    return;
  }

  pageData.forEach((quotation) => {
    const row = document.createElement("tr");
    let completeUrl = getQuotationOpenUrl(quotation);
    let pdfUrl = getQuotationPdfUrl(quotation);
    documentUrl = quotation.url;
    
    // Determine status icon and color
    let statusDisplay = '🧼 Draft';
    let statusClass = 'status-draft';
    
    if (quotation.status == "Expired") {
      statusDisplay = '🔶 Expired';
      statusClass = 'status-expired';
    } else if (quotation.status == "Sent") {
      statusDisplay = '🔷 Sent';
      statusClass = 'status-sent';
    } else if (quotation.status == "Accepted") {
      statusDisplay = '✅ Accepted';
      statusClass = 'status-accepted';
    } else if (quotation.status == "Rejected") {
      statusDisplay = '🔴 Rejected';
      statusClass = 'status-rejected';
    }
    
    // Build actions menu
    let actionButtons = '';
    const docId = quotation.id;
    if (quotation.status == "Expired") {
      actionButtons = `
        <button class="action-btn" value="${docId}" id="activateQuotation-${docId}" style="color: var(--primary);">Activate</button>
      `;
    } else if (quotation.status == "Sent" || quotation.status == "Accepted" || quotation.status == "Rejected" || quotation.status == "Draft") {
      actionButtons = `
        <button class="action-btn" value="${docId}" id="editProposal-${docId}" style="color: var(--primary);">Edit</button>
        <button class="action-btn success" value="${docId}" id="acceptQuotation-${docId}">Accept</button>
        <button class="action-btn danger" value="${docId}" id="rejectQuotation-${docId}">Reject</button>
        <button class="action-btn danger" value="${docId}" id="expireQuotation-${docId}">Expire</button>
        <button class="action-btn danger" value="${docId}" id="deleteQuotation-${docId}">Delete</button>
      `;
    }
    
    let quoteHTML = `
        <td data-label="Title">${quotation.title}</td>
        <td data-label="Price">₹${quotation.price}/-</td>
        <td data-label="Quotation">
          <div class="quotation-links">
            <a href="${completeUrl}" target="_blank">Open</a>
            <a class="pdf-download-link" href="${pdfUrl}" target="_blank" title="Download quotation as PDF">PDF</a>
          </div>
        </td>
        <td data-label="Mobile">+${quotation.mobile}</td>
        <td data-label="Share"><i onclick="sendWhatsAppMessage(${quotation.mobile},'${docId}')" class="fa fa-whatsapp" style="cursor: pointer;font-size:24px;"></i></td>
        <td data-label="Status"><span class="${statusClass}">${statusDisplay}</span></td>
        <td data-label="Validity">${quotation.validUpTo}</td>
        <td data-label="Created">${quotation.created_date}</td>
        <td data-label="Actions">
          <div class="action-menu-container">
            <button class="action-menu-btn" onclick="toggleActionMenu(event)">⋮</button>
            <div class="action-menu-dropdown">
              ${actionButtons}
            </div>
          </div>
        </td>
      `;
    
    row.innerHTML = quoteHTML;
    tableBody.appendChild(row);
  });

  // Update pagination info
  document.getElementById("pageInfo").textContent = `Page ${currentPage} of ${totalPages}`;
  document.getElementById("prevPage").disabled = currentPage === 1;
  document.getElementById("nextPage").disabled = currentPage === totalPages;

  // Show/hide pagination
  if (totalPages > 1) {
    document.getElementById("paginationContainer").classList.remove("hidden");
  } else {
    document.getElementById("paginationContainer").classList.add("hidden");
  }
}

// Fetch quotations from fireBase
async function fetchQuotations() {
  document.getElementById("formContainer").classList.add("hidden");
  document.getElementById("quotationTable").classList.remove("hidden");
  document.getElementById("quotationTable").classList.add("active-table");
  toggleTableFiltersVisibility(true);
  document.getElementById("paginationContainer").classList.remove("hidden");
  document.getElementById("termsAndConditionsSection").classList.add("hidden");
  document.getElementById("deliverablesSection").classList.add("hidden");
  document.getElementById("greetingsSection").classList.add("hidden");
  const quotationCollectionRef = collection(db, QUOTATION_COLL); // Reference to the 'Quotations' collection
  try {
    const querySnapshot = await getDocs(quotationCollectionRef);
    allQuotations = [];
    querySnapshot.forEach((doc) => {
      allQuotations.push({ id: doc.id, ...doc.data() });
    });
    sortTableByDate();
    applyQuotationFilters(true);

  } catch (error) {
    showToast("Error fetching Quotations: "+ error, "error");
  }
}

// Pagination button handlers
document.getElementById("prevPage").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderPage();
  }
});

document.getElementById("nextPage").addEventListener("click", () => {
  const totalPages = Math.max(1, Math.ceil(filteredQuotations.length / itemsPerPage));
  if (currentPage < totalPages) {
    currentPage++;
    renderPage();
  }
});

document.getElementById("titleSearch").addEventListener("input", () => {
  applyQuotationFilters(true);
});

document.getElementById("statusFilter").addEventListener("change", () => {
  applyQuotationFilters(true);
});

// Toggle action menu visibility
function toggleActionMenu(event) {
  event.stopPropagation();
  const button = event.currentTarget;
  const dropdown = button.nextElementSibling;
  
  // Close all other open menus
  document.querySelectorAll('.action-menu-dropdown.active').forEach(menu => {
    if (menu !== dropdown) {
      menu.classList.remove('active');
    }
  });
  
  dropdown.classList.toggle('active');
}

// Close menus when clicking outside
document.addEventListener('click', function(event) {
  if (!event.target.closest('.action-menu-container')) {
    document.querySelectorAll('.action-menu-dropdown.active').forEach(menu => {
      menu.classList.remove('active');
    });
  }
});

// Handle action button clicks
document.addEventListener('click', function(event) {
  if (event.target.classList.contains('action-btn') || event.target.closest('.action-btn')) {
    const button = event.target.classList.contains('action-btn') ? event.target : event.target.closest('.action-btn');
    const id = button.id;
    const value = button.value;
    
    // Close the menu
    document.querySelectorAll('.action-menu-dropdown.active').forEach(menu => {
      menu.classList.remove('active');
    });
    
    // Handle different action types
    if (id.startsWith('expireQuotation')) {
      updateQuotationStatus(value, "Expired");
    } else if (id.startsWith('activateQuotation')) {
      updateQuotationStatus(value, "Draft");
    } else if (id.startsWith('rejectQuotation')) {
      updateQuotationStatus(value, "Rejected");
    } else if (id.startsWith('acceptQuotation')) {
      updateQuotationStatus(value, "Accepted");
    } else if (id.startsWith('deleteQuotation')) {
      deleteQuotation(value);
    } else if (id.startsWith('editProposal')) {
      editProposal(value);
    }
  }
});

function addEventsForEdit(eventData, eCnt) {
  let eventDateVal = (eventData.date == 'TBD') ? `TBD` : `${eventData.date.split("-")[2]}-${eventData.date.split("-")[1]}-${eventData.date.split("-")[0]}`;
  const eventSection = document.getElementById('eventSection');
  const newEvent = document.createElement('div');
  newEvent.setAttribute("id", "Event-" + eCnt);
  newEvent.classList.add('event');
  let eventDateType = (eventDateVal == 'TBD') ? "text" : "date";
  newEvent.innerHTML = `<div style="display: flex; flex-direction: row; flex-wrap: wrap; margin: 20px; gap:20px">
                                <h3>Event</h3>
                                <i class="fa fa-trash-o" title="Remove Current Event"
                                    style="cursor: pointer;padding: 10px;font-size:30px;color:red" onclick="removeSelectedEvent(${eCnt})"></i>
                            </div>
                          <div style="display: flex; flex-direction: row; flex-wrap: wrap; margin: 20px; gap:20px">
                            <div style="display: flex; flex-direction: column; gap: 5px;">
                                <label for="eventName">Event Name : </label>
                                <input type="text"  id="eventNameId-${eCnt}" name="eventName" required value="${eventData.name}">
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 5px;">
                                <label for="eventLocation">📍 Location : </label>
                                <input id="eventLocationId-${eCnt}" type="text" name="eventLocation" required value="${eventData.location}">
                                <label for="eventLocationTBD"> TBD
                                    <input id="eventLocationTBD-${eCnt}" name="eventLocationTBD" type="checkbox" onclick="toggleInput(this,${eCnt})">
                                </label>
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 5px;">
                                <label for="eventDate">📆 Date : </label>
                                <input id="eventDateId-${eCnt}" type=${eventDateType} name="eventDate" required value="${eventDateVal}">
                                <label for="eventDateTBD"> TBD
                                    <input id="eventDateTBD-${eCnt}" name="eventDateTBD" type="checkbox"  onclick="toggleInput(this,${eCnt})">
                                </label>
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 5px;">
                                <label for="eventDetails">Details : </label>
                                <textarea id="eventDetails-${eCnt}" rows="3" cols="30" name="eventDetails" value="${eventData.eventDetails}"></textarea>
                            </div>
                        </div>
                          <div style="display: flex; flex-direction: row; flex-wrap: wrap;margin: 20px;  gap:20px">
                            <div style="display: flex; flex-direction: column; gap: 5px;">
                                <label for="cinematographers">🎥 Cinematographers : </label>
                                <input id="cinematographers-${eCnt}" type="number" name="cinematographers" min="0" required value="${eventData.cinematographers}">
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 5px;">
                                <label for="candidPhotographers">📷 Candid Photographers : </label>
                                <input id="candidPhotographers-${eCnt}" type="number" name="candidPhotographers" min="0" required value="${eventData.candidPhotographers}">
                            </div>
                        </div>
                        <div style="display: flex; flex-direction: row; flex-wrap: wrap;margin: 20px; gap:20px">
                             <div style="display: flex; flex-direction: column; gap: 5px;">
                                <label for="traditionalVideographers">📹 Traditional Videographers : </label>
                                <input id="traditionalVideographers-${eCnt}" type="number" name="traditionalVideographers" min="0" required value="${eventData.traditionalVideographers}">
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 5px;">
                                <label for="traditionalPhotographers">📸 Traditional Photographers : </label>
                                <input id="traditionalPhotographers-${eCnt}" type="number" name="traditionalPhotographers" min="0" required value="${eventData.traditionalPhotographers}">
                            </div>
                        </div>
                        `;

  eventSection.appendChild(newEvent);
  //TO-DO
  let eventDateTBDVal = (eventData.date == 'TBD') ? true : false;
  let eventLocTBDVal = (eventData.location == 'TBD') ? true : false;
  let locInputField = document.getElementById('eventLocationId-' + eCnt);
  let dateInputField = document.getElementById('eventDateId-' + eCnt);
  let locTBDField = document.getElementById('eventLocationTBD-' + eCnt);
  let dateTBDField = document.getElementById('eventDateTBD-' + eCnt);
  document.getElementById('eventDetails-' + eCnt).value = eventData.eventDetails;

  if (eventDateTBDVal) {
    dateTBDField.checked = true;
    dateInputField.disabled = true;
  } else {
    dateInputField.disabled = false;
    dateTBDField.checked = false;
  }

  if (eventLocTBDVal) {
    locTBDField.checked = true;
    locInputField.disabled = true;
  }

}

async function editProposal(docId) {
  createInProgress = false;
  editInProgress = true;
  document.getElementById("formTitle").textContent = "Edit Proposal";
  document.getElementById("submitBtn").textContent = "Update";
  await loadProposalDefaults();
  const quotationDocRef = doc(db, QUOTATION_COLL, docId); // Reference to the 'Quotations' collection and the specific document ID
  try {
    const docSnap = await getDoc(quotationDocRef); // Fetch the document snapshot

    if (docSnap.exists()) {
      document.getElementById("quotationTable").classList.add("hidden");
      document.getElementById("quotationTable").classList.remove("active-table");
      toggleTableFiltersVisibility(false);
      document.getElementById("formContainer").classList.remove("hidden");
      clearDataForNewProposal();
      const quotation = docSnap.data();
      oldTitleInEdit = quotation.title;
      document.getElementById("editDocumentId").value = docId;
      document.getElementById("editValidUpToId").value = quotation.validUpTo;
      document.getElementById("editValidUpToId").disabled = false;
      document.getElementById("editValidUpToIdDiv").classList.remove("hidden");
      document.getElementById("title").value = quotation.title;
      document.getElementById("mobile").value = quotation.mobile;
      document.getElementById("price").value = quotation.price;
      document.getElementById("addGST").checked = quotation.addGst;
      let eCnt = 1;
      quotation.events.forEach(item => {
        if (eCnt == 1) {
          const eventSection = document.getElementById('eventSection');
          while (eventSection.firstChild) {
            eventSection.removeChild(eventSection.lastChild);
          }
          eventsCount = 1;
          addEventsForEdit(item, eCnt);
        } else {
          addEventsForEdit(item, eCnt);
          eventsCount = eventsCount + 1;
        }
        eCnt = eCnt + 1;
      });
      document.getElementById("albumsAddOnCheckBoxId").checked = quotation.Albums_Addon;
      document.getElementById("changeAlbumAddOnSec").classList.toggle("hidden", !quotation.Albums_Addon);
      if (quotation.Albums_Addon) {
        document.getElementById("albumsAddOnChangeCheckBoxId").checked = quotation.Albums_Addon_Changed;
        document.getElementById("changeAlbumAddOnSec").classList.remove("hidden");
        if (quotation.Albums_Addon_Changed) {
          document.getElementById("albumsAddOnCostId").value = quotation.Albums_Addon_Price;
          document.getElementById("albumsAddOnPhotosId").value = quotation.Albums_Addon_Photos;
        }
      }
      document.getElementById("hardDrivesCheckBoxId").checked = quotation.HD_Changed;
      if (quotation.HD_Changed) {
        document.getElementById("hardDrivesCountId").value = quotation.HD_Count;
        document.getElementById("hardDrivesSizeId").value = quotation.HD_Size;
      }
      document.getElementById("ledScreensCheckBoxId").checked = quotation.LED_Changed;
      if (quotation.LED_Changed) {
        document.getElementById("ledScreensId").value = quotation.LED_Price;
      }
      document.getElementById("webLiveCheckBoxId").checked = quotation.WebLive_Changed;
      if (quotation.WebLive_Changed) {
        document.getElementById("webLiveId").value = quotation.WebLive_Price;
        document.getElementById("webLiveTimeId").value = quotation.WebLive_Time;
      }

      document.getElementById("preWeddingPSReqCheckBoxId").checked = quotation.pwpsRequired;
      if (quotation.pwpsRequired) {
        document.getElementById("changePWPSSectionDiv").classList.remove("hidden");
        document.getElementById("preWeddingShootCheckBoxId").checked = quotation.pwpsChange;
        if (quotation.pwpsChange) {
          document.getElementById("preWeddingShootId").value = quotation.preWeddingPhotoShoot;
          document.getElementById("preWeddingShootId").disabled = false;
        }
      }

      document.getElementById("dronesCheckBoxId").checked = quotation.droneRequired;
      (quotation.custom_add_on_services || []).forEach(service => {
        addCustomAddOnService(service);
      });
      (quotation.custom_deliverables || []).forEach(item => {
        addCustomDeliverable(item);
      });

      document.getElementById("change-deliverables-CheckBoxId").checked = Boolean(quotation.delChange);
      document.getElementById("changeDeliverables").classList.add("hidden");
      if (typeof quotation.display_del_photos === "boolean")
        document.getElementById("display-photos-CheckBoxId").checked = quotation.display_del_photos;
      if (typeof quotation.display_del_albums === "boolean")
        document.getElementById("display-albums-CheckBoxId").checked = quotation.display_del_albums;
      if (typeof quotation.display_del_films === "boolean")
        document.getElementById("display-film-CheckBoxId").checked = quotation.display_del_films;
      if (typeof quotation.display_del_long_videos === "boolean")
        document.getElementById("display-longVideos-CheckBoxId").checked = quotation.display_del_long_videos;
      if (typeof quotation.display_del_raw_data === "boolean")
        document.getElementById("display-rawData-CheckBoxId").checked = quotation.display_del_raw_data;
      if (typeof quotation.display_del_reels === "boolean")
        document.getElementById("display-reels-CheckBoxId").checked = quotation.display_del_reels;

      if (quotation.delChange) {
        document.getElementById("changeDeliverables").classList.remove("hidden");
        if (quotation.del_albums)
          document.getElementById("deliverables-albums-Id").value = quotation.del_albums;
        if (quotation.del_photos)
          document.getElementById("deliverables-photos-Id").value = quotation.del_photos;
        if (quotation.del_films)
          document.getElementById("deliverables-film-Id").value = quotation.del_films;
        if (quotation.del_long_videos)
          document.getElementById("deliverables-longVideos-Id").value = quotation.del_long_videos;
        if (quotation.del_raw_data)
          document.getElementById("deliverables-rawData-Id").value = quotation.del_raw_data;
        if (quotation.del_reels)
          document.getElementById("deliverables-reels-Id").value = quotation.del_reels;

        syncDeliverableElement("display-photos-CheckBoxId", "change-photos-CheckBoxId", "deliverables-photos-Id", Boolean(quotation.del_photos));
        syncDeliverableElement("display-albums-CheckBoxId", "change-albums-CheckBoxId", "deliverables-albums-Id", Boolean(quotation.del_albums));
        syncDeliverableElement("display-film-CheckBoxId", "change-film-CheckBoxId", "deliverables-film-Id", Boolean(quotation.del_films));
        syncDeliverableElement("display-longVideos-CheckBoxId", "change-longVideos-CheckBoxId", "deliverables-longVideos-Id", Boolean(quotation.del_long_videos));
        syncDeliverableElement("display-rawData-CheckBoxId", "change-rawData-CheckBoxId", "deliverables-rawData-Id", Boolean(quotation.del_raw_data));
        syncDeliverableElement("display-reels-CheckBoxId", "change-reels-CheckBoxId", "deliverables-reels-Id", Boolean(quotation.del_reels));
      }

      // splitTeam = quotation.splitTeam;
    }
  } catch (error) {
    console.error("Error fetching document:", error);
  }
}


// update a quotation from fireBase
async function updateQuotationStatus(documentId, status) {

  try {
    const isConfirmed = confirm("Are you sure you want to update status to " + status + " for this proposal?");
    if (isConfirmed) {
      const docRef = doc(db, QUOTATION_COLL, documentId);

      const updatedData = {
        ['status']: status, // Dynamically set the field to update
      };
      await updateDoc(docRef, updatedData);
      showToast("Proposal " + status + " successfully! Please update the status properly.", "success");
      fetchQuotations();
    }
  } catch (error) {
    showToast("Error in " + status + "  Proposal: "+ error, "error");
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
      if (quotation.status == "Accepted") {
        showToast("❗❗❗ Cannot delete Accepted proposal ❗❗❗ Please update the status and try again", "Warning");
      }
      else {
        await deleteDoc(docRef);
        showToast("Proposal deleted successfully!", "Success");
        fetchQuotations();
      }
    }
  } catch (error) {
    showToast("Error expiring Proposal: "+ error, "error");
  }
}

export function toggleInput(checkbox, eventNum) {
  let inputField;
  if (checkbox.id.startsWith('eventLocation')) {
    inputField = document.getElementById('eventLocationId-' + eventNum);
  }
  else if (checkbox.id.startsWith('eventDate')) {
    inputField = document.getElementById('eventDateId-' + eventNum);
  }
  if (checkbox.checked) {
    inputField.type = "text"
    inputField.value = "TBD";
    inputField.disabled = true;
  } else {
    inputField.value = "";
    inputField.disabled = false;
    if (checkbox.id.startsWith('eventDate'))
      inputField.type = "date";
  }
};

window.toggleInput = toggleInput;
window.sendWhatsAppMessage = sendWhatsAppMessage;
window.toggleActionMenu = toggleActionMenu;
window.removeEvent = removeEvent;
window.removeSelectedEvent = removeSelectedEvent;
window.hideElement = hideElement;

function hideElement(valueId, hideId) {
  if(document.getElementById(valueId).checked)
  document.getElementById(hideId).classList.remove("hidden");
  else
  document.getElementById(hideId).classList.add("hidden");
}

async function sendWhatsAppMessage(number, docId) {
  const docRef = doc(db, QUOTATION_COLL, docId);

  const updatedData = {
    ['status']: 'Sent', // Dynamically set the field to update
  };
  await updateDoc(docRef, updatedData);
  showToast("Proposal sent successfully!", "Success");
  fetchQuotations();
  const quotation = await getDocumentData(QUOTATION_COLL, docId)
  const data = await getDocumentData(SEEDED_DATA_COLL, WHATSAPP_MESSAGE_ID)
  let message = data.Whatsapp_message + "\n " + hostUrl + quotation.url;
  let whatsappUrl = `https://api.whatsapp.com/send?phone=${number}&text=${encodeURIComponent(message)}`;

  window.open(whatsappUrl, "_blank");
  updateQuotationStatus(docId, "Sent");
}
function addEvent() {
  let lastEventDateId = "eventDateId-" + eventsCount;
  eventsCount += 1;
  const eventSection = document.getElementById('eventSection');
  const newEvent = document.createElement('div');
  newEvent.setAttribute("id", "Event-" + eventsCount);
  const firstEventDate = document.getElementById(lastEventDateId).value;
  newEvent.classList.add('event');
  newEvent.innerHTML = ` <div style="display: flex; flex-direction: row; flex-wrap: wrap; margin: 20px; gap:20px">
                                <h3>Event</h3>
                                <i class="fa fa-trash-o" title="Remove Current Event"
                                    style="cursor: pointer;padding: 10px;font-size:30px;color:red" onclick="removeSelectedEvent(${eventsCount})"></i>
                            </div>
                          <div style="display: flex; flex-direction: row; flex-wrap: wrap; margin: 20px; gap:20px">
                            <div style="display: flex; flex-direction: column; gap: 5px;">
                                <label for="eventName">Event Name : </label>
                                <input type="text" name="eventName" required>
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 5px;">
                                <label for="eventLocation">📍 Location : </label>
                                <input id="eventLocationId-${eventsCount}" type="text" name="eventLocation" required>
                                <label for="eventLocationTBD"> TBD
                                    <input id="eventLocationTBD-${eventsCount}" name="eventLocationTBD" type="checkbox"  onclick="toggleInput(this,${eventsCount})">
                                </label>
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 5px;">
                                <label for="eventDate">📆 Date : </label>
                                <input id="eventDateId-${eventsCount}" type="date" name="eventDate" value="${firstEventDate}" required>
                                <label for="eventDateTBD"> TBD
                                    <input id="eventDateTBD-${eventsCount}" name="eventDateTBD" type="checkbox"  onclick="toggleInput(this,${eventsCount})">
                                </label>
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 5px;">
                                <label for="eventDetails">Details : </label>
                                <textarea id="eventDetails-${eventsCount}" rows="3" cols="30" name="eventDetails"></textarea>
                            </div>
                        </div>
                          <div style="display: flex; flex-direction: row; flex-wrap: wrap;margin: 20px;  gap:20px">
                            <div style="display: flex; flex-direction: column; gap: 5px;">
                                <label for="cinematographers">🎥 Cinematographers : </label>
                                <input type="number" name="cinematographers" min="0" value="1" required>
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 5px;">
                                <label for="candidPhotographers">📷 Candid Photographers : </label>
                                <input type="number" name="candidPhotographers" min="0" value="1" required>
                            </div>
                        </div>
                        <div style="display: flex; flex-direction: row; flex-wrap: wrap;margin: 20px; gap:20px">
                             <div style="display: flex; flex-direction: column; gap: 5px;">
                                <label for="traditionalVideographers">📹 Traditional Videographers : </label>
                                <input type="number" name="traditionalVideographers" min="0" value="1" required>
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 5px;">
                                <label for="traditionalPhotographers">📸 Traditional Photographers : </label>
                                <input type="number" name="traditionalPhotographers" min="0" value="1" required>
                            </div>
                        </div>`;

  eventSection.appendChild(newEvent);

}

function removeEvent() {
  if (eventsCount > 1) {
    const eventSection = document.getElementById('eventSection');
    var child = document.getElementById("Event-" + eventsCount);
    eventSection.removeChild(child);
    eventsCount -= 1;
  }
}

function removeSelectedEvent(eventNo) {
  const isConfirmed = confirm("Are you sure you want to delete current Event ?");
    if (isConfirmed) {
      if (eventsCount > 1) {
        const eventSection = document.getElementById('eventSection');
        var child = document.getElementById("Event-" + eventNo);
        eventSection.removeChild(child);
        eventsCount -= 1;
      }
    }
}

function clearDataForNewProposal() {
  while (eventsCount > 1)
    removeEvent();
  document.getElementById("quotationForm").reset();
  resetCustomCollections();
  applyProposalFormDefaults();
  const fields = ["eventDateId-1", "eventNameId-1", "eventLocationId-1"]; // List of IDs
  fields.forEach(id => {
    document.getElementById(id).value = "";
    document.getElementById(id).disabled = false;
    if (id.startsWith('eventDate')) {
      document.getElementById(id).type = "date";
    }
  });

  const crewFields = ["candidPhotographers-1", "cinematographers-1", "traditionalPhotographers-1", "traditionalVideographers-1"]; // List of IDs
  crewFields.forEach(id => document.getElementById(id).value = "1");

  const hiddenFields = ["changeDeliverables"]
  hiddenFields.forEach(id => document.getElementById(id).classList.add("hidden"));
  document.getElementById("changePWPSSectionDiv").classList.toggle("hidden", !document.getElementById("preWeddingPSReqCheckBoxId").checked);
  document.getElementById("changeAlbumAddOnSec").classList.toggle("hidden", !document.getElementById("albumsAddOnCheckBoxId").checked);

  const disableFields = ["deliverables-photos-Id", "deliverables-albums-Id", "deliverables-film-Id", "deliverables-longVideos-Id",
    "deliverables-rawData-Id", "deliverables-reels-Id", "change-reels-CheckBoxId", "albumsAddOnCostId", "editValidUpToId",
    "albumsAddOnPhotosId", "hardDrivesCountId", "hardDrivesSizeId", "ledScreensId", "webLiveId", "webLiveTimeId", "preWeddingShootId"
  ]
  disableFields.forEach(id => document.getElementById(id).disabled = true);

  syncDeliverableElement("display-photos-CheckBoxId", "change-photos-CheckBoxId", "deliverables-photos-Id");
  syncDeliverableElement("display-albums-CheckBoxId", "change-albums-CheckBoxId", "deliverables-albums-Id");
  syncDeliverableElement("display-film-CheckBoxId", "change-film-CheckBoxId", "deliverables-film-Id");
  syncDeliverableElement("display-longVideos-CheckBoxId", "change-longVideos-CheckBoxId", "deliverables-longVideos-Id");
  syncDeliverableElement("display-rawData-CheckBoxId", "change-rawData-CheckBoxId", "deliverables-rawData-Id");
  syncDeliverableElement("display-reels-CheckBoxId", "change-reels-CheckBoxId", "deliverables-reels-Id");

}

async function openNewProposalForm() {
  editInProgress = false;
  createInProgress = true;
  document.getElementById("formTitle").textContent = "New Proposal";
  document.getElementById("submitBtn").textContent = "Create";
  await loadProposalDefaults();
  clearDataForNewProposal();
  document.getElementById("quotationTable").classList.add("hidden");
  document.getElementById("quotationTable").classList.remove("active-table");
  document.getElementById("paginationContainer").classList.add("hidden");
  toggleTableFiltersVisibility(false);
  document.getElementById("formContainer").classList.remove("hidden");
  document.getElementById("termsAndConditionsSection").classList.add("hidden");
  document.getElementById("deliverablesSection").classList.add("hidden");
  document.getElementById("greetingsSection").classList.add("hidden");
  document.getElementById("editValidUpToIdDiv").classList.add("hidden");
}

function resetCustomCollections() {
  document.getElementById("customAddOnServicesList").innerHTML = "";
  document.getElementById("customDeliverablesList").innerHTML = "";
  customAddOnCount = 0;
  customDeliverablesCount = 0;
}

function refreshCustomCollectionLabels() {
  document.querySelectorAll("#customAddOnServicesList .custom-add-on-service .editor-index").forEach((label, index) => {
    label.textContent = `Add-on Service ${index + 1}`;
  });
  document.querySelectorAll("#customDeliverablesList .custom-deliverable .editor-index").forEach((label, index) => {
    label.textContent = `Deliverable ${index + 1}`;
  });
  customAddOnCount = document.querySelectorAll("#customAddOnServicesList .custom-add-on-service").length;
  customDeliverablesCount = document.querySelectorAll("#customDeliverablesList .custom-deliverable").length;
}

function addCustomAddOnService(service = {}) {
  const list = document.getElementById("customAddOnServicesList");
  const row = document.createElement("div");
  row.classList.add("dynamic-card", "custom-add-on-service");
  row.innerHTML = `
    <div class="dynamic-card-header">
      <span class="editor-index"></span>
      <button type="button" class="dynamic-remove-btn">Remove</button>
    </div>
    <div class="dynamic-grid">
      <div class="dynamic-field">
        <label>Service Title</label>
        <input type="text" name="customAddOnTitle" placeholder="Live Streaming Booth" />
      </div>
      <div class="dynamic-field">
        <label>Price</label>
        <input type="text" name="customAddOnPrice" placeholder="25,000" />
      </div>
      <div class="dynamic-field full-width">
        <label>Details</label>
        <textarea rows="2" name="customAddOnDetails" placeholder="per setup / per event / includes operator"></textarea>
      </div>
    </div>
  `;

  row.querySelector('input[name="customAddOnTitle"]').value = service.title || "";
  row.querySelector('input[name="customAddOnPrice"]').value = service.price || "";
  row.querySelector('textarea[name="customAddOnDetails"]').value = service.details || "";
  row.querySelector(".dynamic-remove-btn").addEventListener("click", () => {
    row.remove();
    refreshCustomCollectionLabels();
  });

  list.appendChild(row);
  refreshCustomCollectionLabels();
}

function addCustomDeliverable(item = "") {
  const list = document.getElementById("customDeliverablesList");
  const row = document.createElement("div");
  row.classList.add("dynamic-card", "custom-deliverable");
  row.innerHTML = `
    <div class="dynamic-card-header">
      <span class="editor-index"></span>
      <button type="button" class="dynamic-remove-btn">Remove</button>
    </div>
    <div class="dynamic-field full-width">
      <label>Deliverable</label>
      <textarea rows="3" name="customDeliverableText" placeholder="Wedding teaser film (delivered in 45 days)"></textarea>
    </div>
  `;

  row.querySelector('textarea[name="customDeliverableText"]').value = item || "";
  row.querySelector(".dynamic-remove-btn").addEventListener("click", () => {
    row.remove();
    refreshCustomCollectionLabels();
  });

  list.appendChild(row);
  refreshCustomCollectionLabels();
}

function getCustomAddOnServices() {
  return Array.from(document.querySelectorAll("#customAddOnServicesList .custom-add-on-service")).map((row, index) => {
    const title = row.querySelector('input[name="customAddOnTitle"]').value.trim();
    const price = row.querySelector('input[name="customAddOnPrice"]').value.trim();
    const details = row.querySelector('textarea[name="customAddOnDetails"]').value.trim();

    if (!title && !price && !details) {
      return null;
    }

    return {
      title: title || `Add-on Service ${index + 1}`,
      price,
      details,
    };
  }).filter(Boolean);
}

function getCustomDeliverables() {
  return Array.from(document.querySelectorAll("#customDeliverablesList .custom-deliverable"))
    .map(row => row.querySelector('textarea[name="customDeliverableText"]').value.trim())
    .filter(Boolean);
}

// Event listeners

document.getElementById("createQuotation").addEventListener("click", () => {
  if (createInProgress || editInProgress) {
    const isConfirmed = confirm("Ohh ! You have not saved the changes. Are you sure you want to move  ?");
    if (isConfirmed) {
      openNewProposalForm();
    }
  } else {
    openNewProposalForm();
  }
});

document.getElementById("fetchQuotations").addEventListener("click", () => {
  if (createInProgress || editInProgress) {
    const isConfirmed = confirm("Ohh ! You have not saved the changes. Are you sure you want to move ?");
    if (isConfirmed) {
      createInProgress = false;
      editInProgress = false;
      fetchQuotations();
    }
  } else {
    fetchQuotations();
  }
});

document.getElementById("addEvent").addEventListener("click", addEvent);
document.getElementById("addCustomAddOnBtn").addEventListener("click", () => addCustomAddOnService());
document.getElementById("addCustomDeliverableBtn").addEventListener("click", () => addCustomDeliverable());

document.getElementById("quotationForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = document.getElementById("title").value;

  const titleError = document.getElementById("titleError");
  const titleName = document.getElementById("title");
  const isValidTitle = await validateTitle(title);
  if (isValidTitle) {
    titleError.textContent = "Title already exists. Please re-arrange it";
    titleName.classList.add("invalid");
    const isConfirmed = confirm("Please change Title. This title is not available to use ?");
    return;
  } else {
    titleError.textContent = "";
    titleName.classList.remove("invalid");
    const price = document.getElementById("price").value;
    const addGst = document.getElementById("addGST").checked;
    const mobile = document.getElementById("mobile").value;
    const Albums_Addon = document.getElementById("albumsAddOnCheckBoxId").checked;
    const Albums_Addon_Changed = document.getElementById("albumsAddOnChangeCheckBoxId").checked;
    const Albums_Addon_Price = document.getElementById("albumsAddOnCostId").value;
    const Albums_Addon_Photos = document.getElementById("albumsAddOnPhotosId").value;
    const HD_Changed = document.getElementById("hardDrivesCheckBoxId").checked;
    const HD_Count = document.getElementById("hardDrivesCountId").value;
    const HD_Size = document.getElementById("hardDrivesSizeId").value;
    const LED_Changed = document.getElementById("ledScreensCheckBoxId").checked;
    const LED_Price = document.getElementById("ledScreensId").value;
    const WebLive_Changed = document.getElementById("webLiveCheckBoxId").checked;
    const WebLive_Price = document.getElementById("webLiveId").value;
    const WebLive_Time = document.getElementById("webLiveTimeId").value;
    const pwpsRequired = document.getElementById("preWeddingPSReqCheckBoxId").checked;
    const pwpsChange = document.getElementById("preWeddingShootCheckBoxId").checked;
    const preWeddingPhotoShoot = document.getElementById("preWeddingShootId").value;
    const droneRequired = document.getElementById("dronesCheckBoxId").checked;
    const customAddOnServices = getCustomAddOnServices();
    const customDeliverables = getCustomDeliverables();
    const delChange = document.getElementById("change-deliverables-CheckBoxId").checked;
    const splitTeam = true;
    const events = Array.from(document.querySelectorAll('.event')).map(event => ({
      name: event.querySelector('input[name="eventName"]').value,
      location: event.querySelector('input[name="eventLocation"]').value,
      eventDetails: event.querySelector('textarea[name="eventDetails"]').value,
      date: event.querySelector('input[name="eventDate"]').value == 'TBD' ?
        `TBD` :
        `${event.querySelector('input[name="eventDate"]').value.split("-")[2]}-${event.querySelector('input[name="eventDate"]').value.split("-")[1]}-${event.querySelector('input[name="eventDate"]').value.split("-")[0]}`,
      cinematographers: event.querySelector('input[name="cinematographers"]').value,
      candidPhotographers: event.querySelector('input[name="candidPhotographers"]').value,
      traditionalPhotographers: event.querySelector('input[name="traditionalPhotographers"]').value,
      traditionalVideographers: event.querySelector('input[name="traditionalVideographers"]').value,
    }));

    const quotation =
      { title, events, price, addGst, mobile, splitTeam, Albums_Addon, Albums_Addon_Changed, Albums_Addon_Price, Albums_Addon_Photos, HD_Changed, HD_Count, HD_Size, LED_Changed, LED_Price, WebLive_Changed, WebLive_Price, WebLive_Time, pwpsRequired, pwpsChange, preWeddingPhotoShoot, droneRequired, customAddOnServices, customDeliverables };
    const disPlayDelPhotos = document.getElementById("display-photos-CheckBoxId").checked;
    const changeDelPhotos = document.getElementById("change-photos-CheckBoxId").checked;
    const updatedDelPhotos = document.getElementById("deliverables-photos-Id").value;
    const disPlayDelAlbums = document.getElementById("display-albums-CheckBoxId").checked;
    const changeDelAlbums = document.getElementById("change-albums-CheckBoxId").checked;
    const updatedDelAlbums = document.getElementById("deliverables-albums-Id").value;
    const disPlayDelFilms = document.getElementById("display-film-CheckBoxId").checked;
    const changeDelFilms = document.getElementById("change-film-CheckBoxId").checked;
    const updatedDelFilms = document.getElementById("deliverables-film-Id").value;
    const disPlayDelReels = document.getElementById("display-reels-CheckBoxId").checked;
    const changeDelReels = document.getElementById("change-reels-CheckBoxId").checked;
    const updatedDelReels = document.getElementById("deliverables-reels-Id").value;
    const disPlayDelLongVideos = document.getElementById("display-longVideos-CheckBoxId").checked;
    const changeDelLongVideos = document.getElementById("change-longVideos-CheckBoxId").checked;
    const updatedDelLongVideos = document.getElementById("deliverables-longVideos-Id").value;
    const disPlayDelRawData = document.getElementById("display-rawData-CheckBoxId").checked;
    const changeDelRawData = document.getElementById("change-rawData-CheckBoxId").checked;
    const updatedDelRawData = document.getElementById("deliverables-rawData-Id").value;
    const deliverablesObj = {
      delChange,
      disPlayDelRawData,
      changeDelRawData,
      updatedDelRawData,
      disPlayDelLongVideos,
      changeDelLongVideos,
      updatedDelLongVideos,
      disPlayDelPhotos,
      changeDelPhotos,
      updatedDelPhotos,
      disPlayDelAlbums,
      changeDelAlbums,
      updatedDelAlbums,
      disPlayDelFilms,
      changeDelFilms,
      updatedDelFilms,
      disPlayDelReels,
      changeDelReels,
      updatedDelReels
    };

    addQuotation(quotation, deliverablesObj);

  }

});

async function getDocumentData(collection_name, document_id) {
  const seededDataDocRef = doc(db, collection_name, document_id); // Reference to the 'Quotations' collection and the specific document ID
  try {
    const docSnap = await getDoc(seededDataDocRef); // Fetch the document snapshot

    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (error) {
    showToast("Error fetching document: "+ error, "error");
  }
}

document.getElementById('editTermsAndConditions').addEventListener('click', (event) => {
  if (createInProgress || editInProgress) {
    const isConfirmed = confirm("Ohh ! You have not saved the changes. Are you sure you want to move  ?");
    if (isConfirmed) {
      createInProgress = false;
      editInProgress = false;
      displayTermsAndConditions();
    }
  } else {
    displayTermsAndConditions();
  }
});

async function displayTermsAndConditions() {
  document.getElementById("formContainer").classList.add("hidden");
  document.getElementById("quotationTable").classList.add("hidden");
  document.getElementById("quotationTable").classList.remove("active-table");
  document.getElementById("paginationContainer").classList.add("hidden");
  toggleTableFiltersVisibility(false);
  document.getElementById("termsAndConditionsSection").classList.remove("hidden");
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
    <textarea name="termsAndCondition" style="margin:20px;" type="text" rows="6">${item}</textarea>
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
    showToast("Error in Terms and Conditions updating: "+ error, "error");
  }
}

document.getElementById('editDeliverables').addEventListener('click', (event) => {
  if (createInProgress || editInProgress) {
    const isConfirmed = confirm("Ohh ! You have not saved the changes. Are you sure you want to move  ?");
    if (isConfirmed) {
      createInProgress = false;
      editInProgress = false;
      displayDeliverables();
    }
  } else {
    displayDeliverables();
  }
});

async function displayDeliverables() {
  document.getElementById("formContainer").classList.add("hidden");
  document.getElementById("quotationTable").classList.add("hidden");
  document.getElementById("quotationTable").classList.remove("active-table");
  document.getElementById("paginationContainer").classList.add("hidden");
  toggleTableFiltersVisibility(false);
  document.getElementById("termsAndConditionsSection").classList.add("hidden");
  document.getElementById("deliverablesSection").classList.remove("hidden");
  document.getElementById("greetingsSection").classList.add("hidden");
  document.getElementById('editDeliverablesSection').innerHTML = "";
  document.getElementById('editComplimentarySection').innerHTML = "";
  document.getElementById('defaultAdditionalServicesList').innerHTML = "";
  deliverablesCount = 0;
  complimentaryCount = 0;
  defaultAdditionalServiceCount = 0;

  const defaults = await loadProposalDefaults(true);

  document.getElementById("defaultAddOnIntro").value = defaults.additionalServices.intro;
  document.getElementById("defaultLedTitle").value = defaults.additionalServices.led.title;
  document.getElementById("defaultLedPrice").value = defaults.additionalServices.led.price;
  document.getElementById("defaultLedDetails").value = defaults.additionalServices.led.details;
  document.getElementById("defaultWebLiveTitle").value = defaults.additionalServices.web_live.title;
  document.getElementById("defaultWebLivePrice").value = defaults.additionalServices.web_live.price;
  document.getElementById("defaultWebLiveTime").value = defaults.additionalServices.web_live.time;
  document.getElementById("defaultWebLiveDetails").value = defaults.additionalServices.web_live.details;
  document.getElementById("defaultAlbumsTitle").value = defaults.additionalServices.albums.title;
  document.getElementById("defaultAlbumsPrice").value = defaults.additionalServices.albums.price;
  document.getElementById("defaultAlbumsPhotos").value = defaults.additionalServices.albums.photos;
  document.getElementById("defaultAlbumsDetails").value = defaults.additionalServices.albums.details;

  document.getElementById("defaultDeliverablesPhotos").value = defaults.deliverables.photos;
  document.getElementById("defaultDeliverablesAlbums").value = defaults.deliverables.albums;
  document.getElementById("defaultDeliverablesFilm").value = defaults.deliverables.film;
  document.getElementById("defaultDeliverablesLongVideos").value = defaults.deliverables.long_video;
  document.getElementById("defaultDeliverablesReels").value = defaults.deliverables.reels;
  document.getElementById("defaultDeliverablesRawData").value = defaults.deliverables.raw_data;

  defaults.complimentary.forEach(item => addNewComplimentary(item));
  defaults.deliverables.additional_deliverables.forEach(item => addNewDeliverables(item));
  defaults.additionalServices.additional_services.forEach(service => addDefaultAdditionalService(service));
}

document.getElementById("addNewDeliverablesBtn").addEventListener("click", () => {
  addNewDeliverables('');
});

document.getElementById("addNewComplimentaryBtn").addEventListener("click", () => {
  addNewComplimentary('');
});

document.getElementById("addDefaultAdditionalServiceBtn").addEventListener("click", () => {
  addDefaultAdditionalService({});
});

function refreshProposalDefaultsEditorLabels() {
  document.querySelectorAll("#editDeliverablesSection .default-deliverable-item .editor-index").forEach((label, index) => {
    label.textContent = `Default Deliverable ${index + 1}`;
  });
  document.querySelectorAll("#editComplimentarySection .complimentary-default-item .editor-index").forEach((label, index) => {
    label.textContent = `Complimentary Item ${index + 1}`;
  });
  document.querySelectorAll("#defaultAdditionalServicesList .default-additional-service .editor-index").forEach((label, index) => {
    label.textContent = `Add-on Service ${index + 1}`;
  });
  deliverablesCount = document.querySelectorAll("#editDeliverablesSection .default-deliverable-item").length;
  complimentaryCount = document.querySelectorAll("#editComplimentarySection .complimentary-default-item").length;
  defaultAdditionalServiceCount = document.querySelectorAll("#defaultAdditionalServicesList .default-additional-service").length;
}

function addNewDeliverables(item) {
  const entry = parseStructuredEntry(item);
  const editDeliverablesSection = document.getElementById('editDeliverablesSection');
  const newDeliverable = document.createElement('div');
  newDeliverable.classList.add('dynamic-card', 'default-deliverable-item');
  newDeliverable.innerHTML = `
    <div class="dynamic-card-header">
      <span class="editor-index"></span>
      <button type="button" class="dynamic-remove-btn">Remove</button>
    </div>
    <div class="dynamic-grid">
      <div class="dynamic-field">
        <label>Title</label>
        <input type="text" name="deliverableTitle" />
      </div>
      <div class="dynamic-field full-width">
        <label>Detail</label>
        <textarea name="deliverableDetails" rows="3"></textarea>
      </div>
    </div>
  `;
  newDeliverable.querySelector('input[name="deliverableTitle"]').value = entry.title || "";
  newDeliverable.querySelector('textarea[name="deliverableDetails"]').value = entry.details || "";
  newDeliverable.querySelector(".dynamic-remove-btn").addEventListener("click", () => {
    newDeliverable.remove();
    refreshProposalDefaultsEditorLabels();
  });
  editDeliverablesSection.appendChild(newDeliverable);
  refreshProposalDefaultsEditorLabels();
}

function addNewComplimentary(item) {
  const entry = parseStructuredEntry(item);
  const complimentarySection = document.getElementById('editComplimentarySection');
  const newComplimentary = document.createElement('div');
  newComplimentary.classList.add('dynamic-card', 'complimentary-default-item');
  newComplimentary.innerHTML = `
    <div class="dynamic-card-header">
      <span class="editor-index"></span>
      <button type="button" class="dynamic-remove-btn">Remove</button>
    </div>
    <div class="dynamic-grid">
      <div class="dynamic-field">
        <label>Title</label>
        <input type="text" name="complimentaryTitle" />
      </div>
      <div class="dynamic-field full-width">
        <label>Description</label>
        <textarea name="complimentaryDetails" rows="3"></textarea>
      </div>
    </div>
  `;
  newComplimentary.querySelector('input[name="complimentaryTitle"]').value = entry.title || "";
  newComplimentary.querySelector('textarea[name="complimentaryDetails"]').value = entry.details || "";
  newComplimentary.querySelector(".dynamic-remove-btn").addEventListener("click", () => {
    newComplimentary.remove();
    refreshProposalDefaultsEditorLabels();
  });
  complimentarySection.appendChild(newComplimentary);
  refreshProposalDefaultsEditorLabels();
}

function addDefaultAdditionalService(service = {}) {
  const list = document.getElementById("defaultAdditionalServicesList");
  const row = document.createElement("div");
  row.classList.add("dynamic-card", "default-additional-service");
  row.innerHTML = `
    <div class="dynamic-card-header">
      <span class="editor-index"></span>
      <button type="button" class="dynamic-remove-btn">Remove</button>
    </div>
    <div class="dynamic-grid">
      <div class="dynamic-field">
        <label>Service Title</label>
        <input type="text" name="defaultServiceTitle" />
      </div>
      <div class="dynamic-field">
        <label>Price</label>
        <input type="text" name="defaultServicePrice" />
      </div>
      <div class="dynamic-field full-width">
        <label>Details</label>
        <textarea rows="2" name="defaultServiceDetails"></textarea>
      </div>
    </div>
  `;
  row.querySelector('input[name="defaultServiceTitle"]').value = service.title || "";
  row.querySelector('input[name="defaultServicePrice"]').value = service.price || "";
  row.querySelector('textarea[name="defaultServiceDetails"]').value = service.details || "";
  row.querySelector(".dynamic-remove-btn").addEventListener("click", () => {
    row.remove();
    refreshProposalDefaultsEditorLabels();
  });
  list.appendChild(row);
  refreshProposalDefaultsEditorLabels();
}

function getStructuredEditorValues(selector, titleSelector, detailsSelector) {
  return Array.from(document.querySelectorAll(selector)).map(item => {
    const title = normalizeTextValue(item.querySelector(titleSelector)?.value);
    const details = normalizeTextValue(item.querySelector(detailsSelector)?.value);
    if (!title && !details) {
      return null;
    }

    return {
      title: title || "Untitled",
      details
    };
  }).filter(Boolean);
}

function getDefaultAdditionalServices() {
  return Array.from(document.querySelectorAll("#defaultAdditionalServicesList .default-additional-service")).map((row) => {
    const title = row.querySelector('input[name="defaultServiceTitle"]').value.trim();
    const price = row.querySelector('input[name="defaultServicePrice"]').value.trim();
    const details = row.querySelector('textarea[name="defaultServiceDetails"]').value.trim();

    if (!title && !price && !details) {
      return null;
    }

    return { title, price, details };
  }).filter(Boolean);
}

document.getElementById("deliverablesForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  await saveDeliverables();
});

async function saveDeliverables() {
  const deliverables = {
    photos: document.getElementById("defaultDeliverablesPhotos").value.trim(),
    albums: document.getElementById("defaultDeliverablesAlbums").value.trim(),
    film: document.getElementById("defaultDeliverablesFilm").value.trim(),
    long_video: document.getElementById("defaultDeliverablesLongVideos").value.trim(),
    reels: document.getElementById("defaultDeliverablesReels").value.trim(),
    raw_data: document.getElementById("defaultDeliverablesRawData").value.trim(),
    additional_deliverables: getStructuredEditorValues(
      "#editDeliverablesSection .default-deliverable-item",
      'input[name="deliverableTitle"]',
      'textarea[name="deliverableDetails"]'
    )
  };
  const complimentary = getStructuredEditorValues(
    "#editComplimentarySection .complimentary-default-item",
    'input[name="complimentaryTitle"]',
    'textarea[name="complimentaryDetails"]'
  );
  const additionalServices = {
    intro: document.getElementById("defaultAddOnIntro").value.trim(),
    led: {
      title: document.getElementById("defaultLedTitle").value.trim(),
      price: document.getElementById("defaultLedPrice").value.trim(),
      details: document.getElementById("defaultLedDetails").value.trim()
    },
    web_live: {
      title: document.getElementById("defaultWebLiveTitle").value.trim(),
      price: document.getElementById("defaultWebLivePrice").value.trim(),
      time: Number(document.getElementById("defaultWebLiveTime").value) || 5,
      details: document.getElementById("defaultWebLiveDetails").value.trim()
    },
    albums: {
      title: document.getElementById("defaultAlbumsTitle").value.trim(),
      price: document.getElementById("defaultAlbumsPrice").value.trim(),
      photos: Number(document.getElementById("defaultAlbumsPhotos").value) || 150,
      details: document.getElementById("defaultAlbumsDetails").value.trim()
    },
    additional_services: getDefaultAdditionalServices()
  };

  const deliverablesDoc = {
    ...deliverables,
    Deliverables: [
      deliverables.photos,
      deliverables.albums,
      deliverables.film,
      deliverables.long_video,
      deliverables.reels,
      deliverables.raw_data,
      ...deliverables.additional_deliverables.map(formatDeliverablePreview)
    ].filter(Boolean)
  };

  try {
    await Promise.all([
      setDoc(doc(db, SEEDED_DATA_COLL, DELIVERABLES_DOC_ID), deliverablesDoc, { merge: true }),
      setDoc(doc(db, SEEDED_DATA_COLL, COMPLIMENTARY_DOC_ID), {
        items: complimentary,
        complimentary: complimentary.map(serializeStructuredEntry)
      }, { merge: true }),
      setDoc(doc(db, SEEDED_DATA_COLL, ADDITIONAL_SERVICES_DOC_ID), additionalServices, { merge: true })
    ]);
    await loadProposalDefaults(true);
    showToast("Proposal defaults updated successfully!", "success");
    fetchQuotations();
  } catch (error) {
    showToast("Error in proposal defaults updating: "+ error, "error");
  }
}

document.getElementById('change-deliverables-CheckBoxId').addEventListener('click', (event) => {
  document.getElementById("changeDeliverables").classList.toggle("hidden");
});

document.getElementById('editGreetings').addEventListener('click', (event) => {
  if (createInProgress || editInProgress) {
    const isConfirmed = confirm("Ohh ! You have not saved the changes. Are you sure you want to move  ?");
    if (isConfirmed) {
      createInProgress = false;
      editInProgress = false;
      displayGreetings();
    }
  } else {
    displayGreetings();
  }
});

async function displayGreetings() {
  document.getElementById("formContainer").classList.add("hidden");
  document.getElementById("quotationTable").classList.add("hidden");
  document.getElementById("quotationTable").classList.remove("active-table");
  document.getElementById("paginationContainer").classList.add("hidden");
  toggleTableFiltersVisibility(false);
  document.getElementById("termsAndConditionsSection").classList.add("hidden");
  document.getElementById("deliverablesSection").classList.add("hidden");
  document.getElementById("greetingsSection").classList.remove("hidden");
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
    <textarea name="greeting" style="margin:20px;" type="text" rows="6">${item}</textarea>
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
    fetchQuotations();
  } catch (error) {
    showToast("Error in Greetings updating: "+ error, "error");
  }
}

window.disableEnableElement = disableEnableElement;

function disableEnableElement(idArr) {
  idArr.forEach(item => {
    document.getElementById(item).disabled = !document.getElementById(item).disabled;
  })
}

window.changeDeliverablesElement = changeDeliverablesElement;

function changeDeliverablesElement(checkbox, textbox) {
  const displayCheckboxId = checkbox.replace("change-", "display-");
  syncDeliverableElement(displayCheckboxId, checkbox, textbox);
}

function syncDeliverableElement(displayCheckboxId, changeCheckboxId, textboxId, forceChangeChecked) {
  const displayCheckbox = document.getElementById(displayCheckboxId);
  const changeCheckbox = document.getElementById(changeCheckboxId);
  const textbox = document.getElementById(textboxId);

  const isDisplayed = displayCheckbox.checked;
  changeCheckbox.disabled = !isDisplayed;

  if (!isDisplayed) {
    changeCheckbox.checked = false;
  } else if (typeof forceChangeChecked === "boolean") {
    changeCheckbox.checked = forceChangeChecked;
  }

  textbox.disabled = !(isDisplayed && changeCheckbox.checked);
}

async function validateTitle(customerName) {
  const customersRef = collection(db, QUOTATION_COLL);
  const q = query(customersRef, where("title", "==", customerName));
  const querySnapshot = await getDocs(q);
  if (querySnapshot && querySnapshot.size > 0 && (createInProgress || (editInProgress && oldTitleInEdit != customerName))) {
    return true;
  }
  return false;
}

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `show ${type}`;

  setTimeout(() => {
    toast.className = toast.className.replace("show", "");
  }, 6000);
}

// Initialize the database
initDB();

// ===== Dark Mode =====
const darkToggle = document.getElementById("darkModeToggle");

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

darkToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
});
