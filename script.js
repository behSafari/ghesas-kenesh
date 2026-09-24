const countEl = document.getElementById("count");
const statusEl = document.getElementById("status");
const overlay = document.getElementById("overlay");
const nameEl = document.getElementById("name");
const messageEl = document.getElementById("message");
const submitBtn = document.getElementById("submit");

const configured =
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes("YOUR_") &&
  !SUPABASE_ANON_KEY.includes("YOUR_");

const db = configured
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

function setMessage(text, ok = false) {
  messageEl.textContent = text;
  messageEl.style.color = ok ? "#315b43" : "#8a4a4a";
}

async function loadCount() {
  if (!db) {
    countEl.textContent = "—";
    statusEl.textContent = "ابتدا اتصال پایگاه داده را در config.js تنظیم کنید.";
    return;
  }

  const { count, error } = await db
    .from("signatures")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error(error);
    countEl.textContent = "—";
    statusEl.textContent = "خطا در دریافت تعداد امضاها.";
    return;
  }

  countEl.textContent = count.toLocaleString("fa-IR");
}

function openModal() {
  overlay.classList.add("active");
  overlay.setAttribute("aria-hidden", "false");
  nameEl.focus();
}

function closeModal() {
  overlay.classList.remove("active");
  overlay.setAttribute("aria-hidden", "true");
  nameEl.value = "";
  setMessage("");
}

document.getElementById("openModal").addEventListener("click", openModal);
document.getElementById("closeModal").addEventListener("click", closeModal);

overlay.addEventListener("click", e => {
  if (e.target === overlay) closeModal();
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeModal();
});

submitBtn.addEventListener("click", async () => {
  if (!db) {
    setMessage("اتصال پایگاه داده هنوز تنظیم نشده است.");
    return;
  }

  const name = nameEl.value.trim();

  if (!name) {
    setMessage("لطفاً نام خود را وارد کنید.");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "در حال ثبت…";

  const { error } = await db
    .from("signatures")
    .insert({ name });

  submitBtn.disabled = false;
  submitBtn.textContent = "ثبت امضا";

  if (error) {
    console.error(error);
    setMessage("ثبت امضا انجام نشد. دوباره تلاش کنید.");
    return;
  }

  setMessage("امضای شما با موفقیت ثبت شد.", true);
  nameEl.value = "";
  await loadCount();
});

// بارگذاری اولیه
loadCount();

// به‌روزرسانی خودکار تعداد هر ۱۰ ثانیه
setInterval(loadCount, 10000);
