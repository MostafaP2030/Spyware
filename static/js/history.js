{
let currentPage = 1;
let isLoading = false;

// تابع کمکی برای فرمت تاریخ به شمسی
function formatPersianDate(timestamp) {
    if (!timestamp) return '';
    // پایتون time.time() ثانیه می‌دهد، جاوااسکریپت میلی‌ثانیه می‌خواهد (ضرب در 1000)
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

    fetch(`/api/history-log?page=${page}`)
        .then(response => response.json())
        .then(data => {
            spinner.style.display = 'none';
            isLoading = false;

            if (data.items.length === 0 && page === 1) {
                noDataMsg.style.display = 'block';
                return;
            }

            // اگر صفحه ۱ است، لیست قبلی را پاک کن (برای جلوگیری از تکرار هنگام رفت و برگشت)
            if (page === 1) {
                listContainer.innerHTML = '';
            }

            data.items.forEach(item => {
                const li = document.createElement('li');
                li.className = 'history-item';
                
                // تعیین رنگ بر اساس نوع دستور (اختیاری)
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
        currentPage = 1;
        loadHistory(1);
        
        // تنظیم دکمه
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            // استفاده از onclick برای جلوگیری از چندبار ایونت خوردن
            loadMoreBtn.onclick = function() {
                if (!isLoading) loadHistory(currentPage + 1);
            };
        }
    }
}
initHistoryPage();
document.addEventListener("pageContentLoaded", initHistoryPage);





}