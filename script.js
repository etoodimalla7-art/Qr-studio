const state = {
  type: "url",
  data: "",
  qr: null,
  imageData: null
};

const fields = document.getElementById("fields");
const qrcode = document.getElementById("qrcode");
const qrCard = document.querySelector(".qr-card");
const emptyState = document.getElementById("emptyState");
const downloadBtn = document.getElementById("downloadBtn");
const copyBtn = document.getElementById("copyBtn");
const previewTitle = document.getElementById("previewTitle");
const previewDescription = document.getElementById("previewDescription");
const fgColor = document.getElementById("fgColor");
const bgColor = document.getElementById("bgColor");
const qrSize = document.getElementById("qrSize");
const qrMargin = document.getElementById("qrMargin");
const toast = document.getElementById("toast");

const typeNames = {
  url: "Website QR",
  text: "Text QR",
  email: "Email QR",
  phone: "Phone QR",
  wifi: "Wi-Fi QR",
  location: "Location QR",
  image: "Image QR"
};

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[c]));
}

function renderFields() {
  const common = {
    url: `
      <div class="field">
        <label for="url">Website URL</label>
        <input id="url" type="url" placeholder="https://example.com" autofocus>
      </div>`,
    text: `
      <div class="field">
        <label for="text">Your information</label>
        <textarea id="text" placeholder="Write any text, message, address, note, code or information..."></textarea>
      </div>`,
    email: `
      <div class="field">
        <label for="email">Email address</label>
        <input id="email" type="email" placeholder="hello@example.com">
      </div>
      <div class="field">
        <label for="subject">Subject <span class="optional">(optional)</span></label>
        <input id="subject" type="text" placeholder="Hello from QR Studio">
      </div>
      <div class="field">
        <label for="emailBody">Message <span class="optional">(optional)</span></label>
        <textarea id="emailBody" placeholder="Your email message..."></textarea>
      </div>`,
    phone: `
      <div class="field">
        <label for="phone">Phone number</label>
        <input id="phone" type="tel" placeholder="+91 98765 43210">
      </div>`,
    wifi: `
      <div class="two-col">
        <div class="field"><label for="ssid">Network name (SSID)</label><input id="ssid" placeholder="My Wi-Fi"></div>
        <div class="field"><label for="wifiPassword">Password</label><input id="wifiPassword" type="password" placeholder="••••••••"></div>
      </div>
      <div class="field">
        <label for="encryption">Security</label>
        <select id="encryption"><option value="WPA">WPA / WPA2 / WPA3</option><option value="WEP">WEP</option><option value="nopass">No password</option></select>
      </div>
      <div class="field"><label><input id="hiddenNetwork" type="checkbox" style="width:auto;margin-right:8px"> Hidden network</label></div>`,
    location: `
      <div class="two-col">
        <div class="field"><label for="latitude">Latitude</label><input id="latitude" type="number" step="any" placeholder="28.6139"></div>
        <div class="field"><label for="longitude">Longitude</label><input id="longitude" type="number" step="any" placeholder="77.2090"></div>
      </div>
      <div class="field"><label for="place">Place name <span class="optional">(optional)</span></label><input id="place" placeholder="New Delhi"></div>`,
    image: `
      <div class="file-drop" id="fileDrop">
        <input id="imageFile" type="file" accept="image/png,image/jpeg,image/webp">
        <strong>Choose a small image</strong>
        <span>PNG, JPG or WebP · Small images work best</span>
        <div class="file-name" id="fileName">No image selected</div>
      </div>
      <p style="font-size:10px;color:#999;line-height:1.5;margin-top:10px">
        Note: a QR code stores data, not unlimited file storage. Large images may exceed QR capacity.
      </p>`
  };

  fields.innerHTML = common[state.type];
  attachFieldListeners();

  if (state.type === "image") {
    const drop = document.getElementById("fileDrop");
    const input = document.getElementById("imageFile");
    drop.addEventListener("click", () => input.click());
    input.addEventListener("change", handleImage);
  }
}

function attachFieldListeners() {
  fields.querySelectorAll("input, textarea, select").forEach(el => {
    el.addEventListener("input", generate);
    el.addEventListener("change", generate);
  });
}

function value(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

function buildPayload() {
  switch (state.type) {
    case "url":
      return value("url");
    case "text":
      return value("text");
    case "email": {
      const email = value("email");
      if (!email) return "";
      const subject = value("subject");
      const body = value("emailBody");
      return `mailto:${email}${subject || body ? `?${new URLSearchParams({...(subject ? {subject} : {}), ...(body ? {body} : {})})}` : ""}`;
    }
    case "phone":
      return value("phone") ? `tel:${value("phone")}` : "";
    case "wifi": {
      const ssid = value("ssid");
      if (!ssid) return "";
      const pass = value("wifiPassword");
      const enc = value("encryption");
      const hidden = document.getElementById("hiddenNetwork")?.checked ? "true" : "false";
      return `WIFI:T:${enc};S:${escapeWifi(ssid)};P:${escapeWifi(pass)};H:${hidden};;`;
    }
    case "location": {
      const lat = value("latitude");
      const lon = value("longitude");
      if (!lat || !lon) return "";
      const place = value("place");
      return `geo:${lat},${lon}${place ? `?q=${encodeURIComponent(place)}` : ""}`;
    }
    case "image":
      return state.imageData || "";
  }
}

function escapeWifi(s) {
  return String(s).replace(/([\\;,:"])/g, "\\$1");
}

function generate() {
  const payload = buildPayload();
  state.data = payload;

  qrcode.innerHTML = "";
  state.qr = null;

  if (!payload) {
    qrCard.style.display = "none";
    emptyState.style.display = "block";
    downloadBtn.disabled = true;
    copyBtn.disabled = true;
    previewTitle.textContent = typeNames[state.type];
    previewDescription.textContent = "Ready to generate";
    return;
  }

  try {
    state.qr = new QRCode(qrcode, {
      text: payload,
      width: Number(qrSize.value),
      height: Number(qrSize.value),
      colorDark: fgColor.value,
      colorLight: bgColor.value,
      correctLevel: QRCode.CorrectLevel.M
    });

    qrCard.style.display = "block";
    emptyState.style.display = "none";
    downloadBtn.disabled = false;
    copyBtn.disabled = false;
    previewTitle.textContent = typeNames[state.type];
    previewDescription.textContent = shortPreview(payload);

    setTimeout(() => {
      const img = qrcode.querySelector("img");
      const canvas = qrcode.querySelector("canvas");
      if (img) {
        img.style.width = "100%";
        img.style.height = "auto";
      }
      if (canvas) {
        canvas.style.width = "100%";
        canvas.style.height = "auto";
      }
    }, 0);
  } catch (err) {
    qrCard.style.display = "none";
    emptyState.style.display = "block";
    emptyState.querySelector("p").innerHTML = "This content is too large<br>for a QR code. Try less data.";
    downloadBtn.disabled = true;
    copyBtn.disabled = true;
  }
}

function shortPreview(text) {
  if (state.type === "image") return "Embedded image data";
  return text.length > 45 ? text.slice(0, 45) + "…" : text;
}

async function handleImage(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  const name = document.getElementById("fileName");
  name.textContent = file.name;

  if (file.size > 100 * 1024) {
    showToast("That image is large. Try one under 100 KB.");
  }

  const reader = new FileReader();
  reader.onload = () => {
    state.imageData = reader.result;
    generate();
  };
  reader.readAsDataURL(file);
}

function downloadPNG() {
  const canvas = qrcode.querySelector("canvas");
  const img = qrcode.querySelector("img");
  let source = canvas;

  if (!source && img) {
    const c = document.createElement("canvas");
    c.width = img.naturalWidth || Number(qrSize.value);
    c.height = img.naturalHeight || Number(qrSize.value);
    const ctx = c.getContext("2d");
    ctx.drawImage(img, 0, 0);
    source = c;
  }

  if (!source) return;

  const margin = Number(qrMargin.value) * 10;
  const finalCanvas = document.createElement("canvas");
  finalCanvas.width = source.width + margin * 2;
  finalCanvas.height = source.height + margin * 2;

  const ctx = finalCanvas.getContext("2d");
  ctx.fillStyle = bgColor.value;
  ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
  ctx.drawImage(source, margin, margin);

  const link = document.createElement("a");
  link.download = `qr-studio-${state.type}-${Date.now()}.png`;
  link.href = finalCanvas.toDataURL("image/png");
  link.click();
  showToast("QR code downloaded");
}

async function copyQR() {
  const canvas = qrcode.querySelector("canvas");
  if (!canvas) return;

  try {
    canvas.toBlob(async blob => {
      await navigator.clipboard.write([new ClipboardItem({"image/png": blob})]);
      showToast("QR code copied to clipboard");
    }, "image/png");
  } catch {
    showToast("Copy isn't supported here — use Download PNG");
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
}

document.querySelectorAll(".type-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".type-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    state.type = btn.dataset.type;
    state.imageData = null;
    renderFields();
    previewTitle.textContent = typeNames[state.type];
    previewDescription.textContent = "Ready to generate";
    generate();
  });
});

[fgColor, bgColor, qrSize, qrMargin].forEach(el => el.addEventListener("input", generate));
downloadBtn.addEventListener("click", downloadPNG);
copyBtn.addEventListener("click", copyQR);

renderFields();
