{
let currentPage = 1;
let isLoading = false;
let currentSearchQuery = ""; // متغیر برای ذخیره متن جستجو
let searchDebounceTimer; // تایمر برای بهینه‌سازی جستجو

// تابع کمکی برای فرمت تاریخ به شمسی
function formatPersianDate(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('fa-IR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// تابع اصلی بارگذاری
function loadHistory(page) {
    const listContainer = document.getElementById('history-list');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const spinner = document.getElementById('loading-spinner');
    const noDataMsg = document.getElementById('no-data-msg');

    if (!listContainer) return;

    isLoading = true;
    spinner.style.display = 'block';
    if (loadMoreBtn) loadMoreBtn.style.display = 'none';
    
    // اگر جستجو جدید است یا صفحه ۱ است و لیست خالی نیست، پیام خالی بودن را مخفی کن
    if (page === 1) {
            noDataMsg.style.display = 'none';
    }

    // اضافه کردن کوئری جستجو به URL
    const url = `/api/history-log?page=${page}&q=${encodeURIComponent(currentSearchQuery)}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            spinner.style.display = 'none';
            isLoading = false;

            // پاک کردن لیست فقط اگر صفحه ۱ باشد
            if (page === 1) {
                listContainer.innerHTML = '';
            }

            if (data.items.length === 0 && page === 1) {
                noDataMsg.innerText = currentSearchQuery ? "No results found 🔍" : "History is empty 🔍";
                noDataMsg.style.display = 'block';
                // اگر دکمه لود بیشتر وجود داشت مخفی شود
                if (loadMoreBtn) loadMoreBtn.style.display = 'none';
                return;
            }

            data.items.forEach(item => {
                const li = document.createElement('li');
                li.className = 'history-item';
                
                let typeClass = 'type-default';
                if (item.type === 'cmd') typeClass = 'type-cmd';
                else if (item.type === 'ps') typeClass = 'type-ps';
                else if (item.type === 'dll') typeClass = 'type-dll';
                else if (item.type === 'pic') typeClass = 'type-pic';
                else if (item.type === 'say') typeClass = 'type-say';

                const timeStr = formatPersianDate(item.timestamp);
                const infoText = item.info ? item.info : '<span class="text-muted">No Output</span>';

                li.innerHTML = `
                    <div class="history-header">
                        <span class="badge ${typeClass}">${item.type || 'General'}</span>
                        <span class="timestamp" dir="ltr">${timeStr}</span>
                    </div>
                    
                    <div class="history-body">
                        <div class="row">
                            <span class="label">command:</span>
                            <code class="command-text">${item.msg || '---'}</code>
                        </div>
                        <div class="row mt-2">
                            <span class="label">result:</span>
                            <div class="info-text">${infoText}</div>
                        </div>
                    </div>
                `;
                
                listContainer.appendChild(li);
            });

            currentPage = page;

            if (loadMoreBtn) {
                // حذف پیام پایان قبلی اگر وجود دارد
                const oldEndMsg = listContainer.querySelector('.end-message');
                if(oldEndMsg) oldEndMsg.remove();

                if (data.has_more) {
                    loadMoreBtn.style.display = 'block';
                } else {
                    loadMoreBtn.style.display = 'none';
                    if (listContainer.children.length > 0) {
                        const endMsg = document.createElement('div');
                        endMsg.className = 'end-message';
                        endMsg.innerText = 'End History ✅';
                        listContainer.appendChild(endMsg);
                    }
                }
            }
        })
        .catch(err => {
            console.error('Error:', err);
            spinner.style.display = 'none';
            isLoading = false;
        });
}

function initHistoryPage() {
    const list = document.getElementById('history-list');
    
    if (list) {
        // ریست کردن متغیرها هنگام ورود به صفحه
        currentPage = 1;
        currentSearchQuery = "";
        
        const searchInput = document.querySelector('#search input');
        
        if (searchInput) {
            searchInput.value = "";
            
            // حذف ایونت‌های قبلی (برای جلوگیری از تکرار)
            const newSearchInput = searchInput.cloneNode(true);
            searchInput.parentNode.replaceChild(newSearchInput, searchInput);

            // اضافه کردن لیسنر جدید
            newSearchInput.addEventListener('input', function(e) {
                const val = e.target.value.trim();
                
                // استفاده از Debounce برای جلوگیری از درخواست‌های رگباری
                clearTimeout(searchDebounceTimer);
                searchDebounceTimer = setTimeout(() => {
                    currentSearchQuery = val;
                    currentPage = 1;
                    loadHistory(1);
                }, 500);
            });
            
            // اگر کاربر Enter زد، فوری جستجو کن
            newSearchInput.addEventListener('keydown', function(e){
                    if(e.key === 'Enter'){
                    clearTimeout(searchDebounceTimer);
                    currentSearchQuery = e.target.value.trim();
                    currentPage = 1;
                    loadHistory(1);
                    }
            });
        }

        loadHistory(1);
        
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.onclick = function() {
                if (!isLoading) loadHistory(currentPage + 1);
            };
        }
    }
}

initHistoryPage();
document.addEventListener("pageContentLoaded", initHistoryPage);


}