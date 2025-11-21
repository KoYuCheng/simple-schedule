/*import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.js'

document.querySelector('#app').innerHTML = `
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
      <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
    </a>
    <h1>Hello Vite!</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite logo to learn more
    </p>
  </div>
`

setupCounter(document.querySelector('#counter'))*/

// main.js

// 1. 核心數據結構：用來儲存排班
// 資料會自動從瀏覽器的 Local Storage 載入
let scheduleData = JSON.parse(localStorage.getItem('scheduleData')) || {};
let currentMonday = getStartOfWeek(new Date()); // 定義當前週一的日期

const tableBody = document.querySelector('#schedule-table tbody');
const currentPeriod = document.getElementById('current-period');

// 輔助函數：取得當週的星期一 
function getStartOfWeek(date) {
  const day = date.getDay();
  // 調整至本週一 (getDay() 0=週日, 1=週一... 需調整計算)
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0); // 清除時間，確保是日期開頭
  return monday;
}

// 輔助函數：將日期格式化為 YYYY-MM-DD
function formatDate(date) {
  const year = date.getFullYear();
  // month + 1 因為月份是從 0 開始
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 核心渲染函數
function renderSchedule() {
  tableBody.innerHTML = ''; // 清空表格
  const days = ['日', '一', '二', '三', '四', '五', '六'];

  // 顯示當前週期的日期範圍
  const nextSunday = new Date(currentMonday.getTime() + 6 * 24 * 60 * 60 * 1000);
  currentPeriod.textContent = `${formatDate(currentMonday)} ~ ${formatDate(nextSunday)}`;

  for (let i = 0; i < 7; i++) {
    const date = new Date(currentMonday.getTime() + i * 24 * 60 * 60 * 1000);
    const dateKey = formatDate(date);
    const shiftInfo = scheduleData[dateKey] || '點擊排班'; // 取得排班資訊或預設文字

    const row = tableBody.insertRow();
    row.insertCell().textContent = dateKey;
    row.insertCell().textContent = '週' + days[date.getDay()];

    const shiftCell = row.insertCell();
    shiftCell.textContent = shiftInfo;
    shiftCell.dataset.date = dateKey; // 用於點擊事件

    // 簡易樣式：根據內容顯示顏色 (如果需要)
    // if (shiftInfo.includes('早班')) {
    //     shiftCell.style.backgroundColor = '#e6ffe6';
    // } else if (shiftInfo.includes('晚班')) {
    //     shiftCell.style.backgroundColor = '#ffe6e6';
    // }

    // 設定點擊事件：簡易排班邏輯
    shiftCell.addEventListener('click', handleShiftClick);
  }
}

// 處理排班點擊事件
function handleShiftClick(event) {
  const dateKey = event.target.dataset.date;

  // 提示用戶輸入員工姓名
  const staffName = prompt(`請輸入 ${dateKey} 的排班人員姓名 (留空則清除排班):`);

  if (staffName === null) return; // 取消操作

  if (staffName.trim() === '') {
    // 清除排班
    delete scheduleData[dateKey];
  } else {
    // 提示用戶輸入班次類型
    const shiftType = prompt('請輸入班次類型 (例如: 早班, 晚班, 備勤):');
    if (shiftType === null) return;

    scheduleData[dateKey] = `${shiftType.trim()} - ${staffName.trim()}`;
  }

  // 儲存到 Local Storage
  localStorage.setItem('scheduleData', JSON.stringify(scheduleData));
  renderSchedule(); // 重新渲染表格
}

// 事件監聽器：切換週數
document.getElementById('prev-week').addEventListener('click', () => {
  // 減去 7 天
  currentMonday.setDate(currentMonday.getDate() - 7);
  renderSchedule();
});
document.getElementById('next-week').addEventListener('click', () => {
  // 加上 7 天
  currentMonday.setDate(currentMonday.getDate() + 7);
  renderSchedule();
});

// 事件監聽器：匯出數據 (JSON 檔案)
document.getElementById('export-data').addEventListener('click', () => {
  const dataStr = JSON.stringify(scheduleData, null, 2);
  // 建立 Blob 檔案
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  let linkElement = document.createElement('a');
  linkElement.setAttribute('href', url);
  linkElement.setAttribute('download', 'schedule_data_' + formatDate(new Date()) + '.json');

  // 模擬點擊下載
  document.body.appendChild(linkElement);
  linkElement.click();
  document.body.removeChild(linkElement);
  URL.revokeObjectURL(url); // 釋放 URL 物件
});

// 事件監聽器：匯入數據 (JSON 檔案)
document.getElementById('import-data').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const importedData = JSON.parse(e.target.result);
      if (typeof importedData === 'object' && importedData !== null) {
        // 將匯入數據合併到現有數據中 (如果有需要)
        scheduleData = importedData;
        localStorage.setItem('scheduleData', JSON.stringify(scheduleData));
        alert('排班數據匯入成功！');
        renderSchedule();
      } else {
        alert('匯入失敗：檔案格式錯誤。');
      }
    } catch (error) {
      alert('匯入失敗：無法解析 JSON 檔案。');
    }
  };
  reader.readAsText(file);
});


// 初始化系統
renderSchedule();
