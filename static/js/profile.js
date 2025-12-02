// static/js/profile.js

console.log("profile.js لود شد");

// تابع کپی URL (همون قبلی که کار می‌کرد)
function initProfileCopy() {
    const urlBox = document.getElementById("urlBox");
    if (!urlBox) return;

    const urlTextEl = urlBox.querySelector(".url-text");
    if (!urlTextEl) return;

    const textToCopy = urlTextEl.textContent.trim();
    if (!textToCopy || textToCopy === "-" || textToCopy === "") return;

    const copyBtn = urlBox.querySelector(".copy-btn");

    async function doCopy(e) {
        if (e && e.target.closest(".copy-btn")) {
            e.stopPropagation();
        }

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(textToCopy);
            } else {
                // fallback برای HTTP
                const textarea = document.createElement("textarea");
                textarea.value = textToCopy;
                textarea.style.position = "fixed";
                textarea.style.opacity = "0";
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand("copy");
                document.body.removeChild(textarea);
            }
            urlBox.classList.add("copied");
            setTimeout(() => urlBox.classList.remove("copied"), 2000);
        } catch (err) {
            prompt("لطفاً دستی کپی کنید:", textToCopy);
        }
    }

    urlBox.onclick = null;
    if (copyBtn) copyBtn.replaceWith(copyBtn.cloneNode(true));

    urlBox.addEventListener("click", doCopy);
    urlBox.querySelector(".copy-btn")?.addEventListener("click", doCopy);
}

// تابع ویرایش پروفایل
function initProfileEdit() {
    const editBtn = document.getElementById("editBtn");
    const saveBtn = document.getElementById("saveBtn");
    const cancelBtn = document.getElementById("cancelBtn");
    const inputs = document.querySelectorAll(".editable-input");

    if (!editBtn || !saveBtn || !cancelBtn || inputs.length === 0) {
        console.log("یکی از المنت‌های ویرایش پیدا نشد:", { editBtn, saveBtn, cancelBtn, inputs });
        return;
    }

    let original = {};

    editBtn.addEventListener("click", () => {
        console.log("دکمه ویرایش کلیک شد");
        inputs.forEach(inp => {
            original[inp.type || inp.name] = inp.value;
            inp.removeAttribute("readonly");
        });
        editBtn.style.display = "none";
        saveBtn.style.display = "inline-flex";
        cancelBtn.style.display = "inline-flex";
        inputs[0].focus();
    });

    cancelBtn.addEventListener("click", () => {
        inputs.forEach(inp => {
            inp.value = original[inp.type || inp.name] || "";
            inp.setAttribute("readonly", "");
        });
        saveBtn.style.display = "none";
        cancelBtn.style.display = "none";
        editBtn.style.display = "inline-flex";
    });

    saveBtn.addEventListener("click", () => {
        alert("ذخیره شد! (فعلاً فقط تست — بعداً به سرور وصل می‌کنیم)");
        inputs.forEach(inp => inp.setAttribute("readonly", ""));
        saveBtn.style.display = "none";
        cancelBtn.style.display = "none";
        editBtn.style.display = "inline-flex";
    });
}

// اجرا فقط وقتی محتوا لود شد
function runProfileScripts() {
    console.log("اجرای اسکریپت‌های پروفایل...");
    initProfileCopy();
    initProfileEdit();
}

// این دو خط حیاتی هستن
document.addEventListener("pageContentLoaded", runProfileScripts);
document.addEventListener("DOMContentLoaded", runProfileScripts);

// بک‌آپ نهایی (در صورت نیاز)
setTimeout(runProfileScripts, 500);