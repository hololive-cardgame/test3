//
// 取得所有的篩選選單元素
const attributeSelect = document.getElementById("attribute");  // 屬性
const setSelect = document.getElementById("set");  // 卡包
const clearFiltersBtn = document.getElementById("clear-filters");  // 清除篩選條件按鈕
const cardContainer = document.getElementById("card-container");  // 卡牌展示區

let cardsData = [];  // 所有卡牌資料
let filteredCards = [];  // 篩選後的卡牌資料
let currentIndex = -1;  // 當前顯示的卡牌索引

const cardsPerPage = 10;  // 設置每頁顯示的卡牌數量
let currentPage = 0;  // 初始頁面是第一頁

// 使用 fetch 從 JSON 檔案載入資料
fetch("cards.json")
    .then(response => response.json())  // 解析 JSON 資料
    .then(data => {
        cardsData = data;
        filteredCards = data;  // 初始化 filteredCards 與 cardsData 保持一致
        console.log(cardsData);  // Log the loaded card data to verify
        generateFilterOptions();  // 生成篩選選項
        displayCards(cardsData);  // 顯示所有卡牌
    })
    .catch(error => {
        console.error("Error loading the card data:", error);
    });

// 根據 JSON 資料生成篩選選項
function generateFilterOptions() {
    const keywords = new Set();
    const types = new Set();
    const attributes = new Set();
    const tags = new Set();
    const sets = {
        "起始牌組": new Set(),
        "補充包": new Set(),
        "其他": new Set()
    };

    // 這是用來儲存卡牌名稱的集合
    cardsData.forEach(card => {
        keywords.add(card.name);
        types.add(card.type);
        attributes.add(card.attribute);
        /*
        if (card.attribute) {
            card.attribute.split(" / ").forEach(attr => attributes.add(attr));
        }
        */
        if (card.tag) {
            card.tag.split(" / ").forEach(tag => tags.add(tag));
        }
        if (card.set) {
            const cardSets = Array.isArray(card.set) ? card.set : [card.set];
            cardSets.forEach(setItem => {
                if (setItem.includes("起始牌組")) {
                    const setName = setItem.replace("起始牌組","").replace(/[「」]/g,"").trim();
                    sets["起始牌組"].add(setName);
                }else if (setItem.includes("補充包")) {
                    sets["補充包"].add(setItem);
                }else if (setItem === "配件" || setItem === "PR卡"){
                    sets["其他"].add(setItem);
                }
            });
        }
    });

    // 填充關鍵字選項
    keywords.forEach(keyword => {
        if (keyword) {
            const option = document.createElement("option");
            option.value = keyword;
            option.textContent = keyword;
            $("#keyword").append(option);
          }
    });

    // 初始化類型
    $("#type").select2({
        minimumResultsForSearch: Infinity,
        width: "100%"
    });
    $("#type").on("select2:select", function() {
        filterCards();
    });
    // 填充類型選項
    const allOption = new Option("全部","allOption");
    $("#type").append(allOption);
    types.forEach(type => {
        if (type) {
            const option = document.createElement("option");
            option.value = type;
            option.textContent = type;
            $("#type").append(option);
        }
    });
    // 觸發更新
    $("#type").trigger("change");

    
    /*
    // 清空屬性、多選框
    attributeSelect.innerHTML = "";
    attributes.forEach(attr => {
        if (attr) {
            const label = document.createElement("label");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = attr;
            checkbox.name = "attribute";
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(attr));
            attributeSelect.appendChild(label);
        }
    });
    */
    // 填充屬性選項（測試多選下拉選單）
    attributes.forEach(attribute => {
        if (attribute) {
            const option = document.createElement("option");
            option.value = attribute;
            option.textContent = attribute;
            $("#attribute").append(option);
          }
    });

    // 將 Set 轉換為數組，並進行排序
    const sortedTags = Array.from(tags).sort();
    // 填充標籤選項
        sortedTags.forEach(tag => {
            if (tag) {
                const option = document.createElement("option");
                option.value = tag;
                option.textContent = tag;
                $("#tag").append(option);
            }
        });

    // 填充卡包選項
    Object.keys(sets).forEach(category => {
        const optgroup = document.createElement("optgroup");
        optgroup.label = category; // 設置分組標籤

        // 提取出每個卡包名稱並進行排序
        const sortedSets = Array.from(sets[category]).sort((a, b) => {
            // 正則表達式提取卡包中的編號（如「hSD01」「hBP01」）
            const matchA = a.match(/【(h\w\d+)】/);
            const matchB = b.match(/【(h\w\d+)】/);
    
            if (matchA && matchB) {
              // 比較提取出來的編號部分進行排序
              return matchA[1].localeCompare(matchB[1]);
            }
                return 0;  // 如果無法匹配，保持原順序
            });
        
        // 添加該分類下的所有卡包選項
        sortedSets.forEach(set => {
            const option = document.createElement("option");
            option.value = set;
            option.textContent = set;
            optgroup.appendChild(option);
        });

        // 把分組添加到 select 元素中
        setSelect.appendChild(optgroup);
    });
    // 設定預設為空值（選單本身保持空）
    setSelect.value = "";

    // 初始化 Select2
    $(document).ready(function() {

        let isInitialized = false;  // 标志变量，确保初始化时不触发筛选
        
        // 初始化關鍵字
        $("#keyword").select2({
            placeholder: "",
            minimumResultsForSearch: Infinity,
            width: "100%"
        });

        // 初始化類型（在上方）

        // 初始化屬性
        $("#attribute").select2({
            placeholder: "",
            minimumResultsForSearch: Infinity,
            width: "100%"
        });

        // 初始化標籤
        $("#tag").select2({
            placeholder: "",
            minimumResultsForSearch: Infinity,
            width: "100%"
        });

        // 初始化卡包
        $("#set").select2({
            placeholder: "",
            minimumResultsForSearch: Infinity,
            width: "100%"
        });

        // Function to set the value without triggering the change event
    function setSelect2ValueWithoutChange(selector, value) {
        const Select2 = $.fn.select2.amd.require('select2/core');
        const $element = $(selector);
        const instance = $element.data('select2');

        if (instance) {
            instance.triggerChange = false; // Disable triggering change event
            $element.val(value).trigger('change');
            instance.triggerChange = true; // Re-enable triggering change event
        } else {
            $element.val(value).trigger('change', { triggerChange: false });
        }
    }

        // Initialize the filter options
    function initializeFilterOptions() {
        setSelect2ValueWithoutChange("#keyword", "");
        setSelect2ValueWithoutChange("#type", "allOption");
        setSelect2ValueWithoutChange("#attribute", "");
        setSelect2ValueWithoutChange("#tag", "");
        setSelect2ValueWithoutChange("#set", "");
    }

    // Call this function to set initial values without triggering change events
    initializeFilterOptions();

        $('#attribute').on('change', function() {
        // 调用 filterCards 函数来更新筛选结果
        if (isInitialized) filterCards();  // Only call filterCards after initialization
        });

        // 監聽篩選條件變動，觸發篩選
        $("#keyword").on("select2:select", function() {
            if (isInitialized) filterCards();  // Only call filterCards after initialization
        });

        // 監聽篩選條件變動，觸發篩選
        $("#attribute").on("select2:select", function() {
            if (isInitialized) filterCards();  // Only call filterCards after initialization
        });

        // 監聽篩選條件變動，觸發篩選
        $("#tag").on("select2:select", function() {
            if (isInitialized) filterCards();  // Only call filterCards after initialization
        });

        // 監聽篩選條件變動，觸發篩選
        $("#set").on("select2:select", function() {
            if (isInitialized) filterCards();  // Only call filterCards after initialization
        });

        // 監聽 Select2 的變更事件，當選擇框有值時顯示自定義的清除按鈕
        $("#keyword").on("select2:select", function (e) {
            $("#clear-keyword").show();  // 顯示自定義清除按鈕
        });
        $("#attribute").on("select2:select", function (e) {
            $("#clear-tag").show();
        });
        $("#tag").on("select2:select", function (e) {
            $("#clear-tag").show();
        });
        $("#set").on("select2:select", function (e) {
            $("#clear-set").show();
        });

        // 監聽 Select2 的清除事件，當選擇框清除選項時隱藏自定義的清除按鈕
        $("#keyword").on("select2:clear", function (e) {
            $("#clear-keyword").hide();  // 隱藏自定義清除按鈕
        });
        $("#attribute").on("select2:clear", function (e) {
            $("#clear-tag").hide();
        });
        $("#tag").on("select2:clear", function (e) {
            $("#clear-tag").hide();
        });
        $("#set").on("select2:clear", function (e) {
            $("#clear-set").hide();
        });

        // 當自定義的清除按鈕被點擊時，清除選擇框的值並手動關閉下拉選單
        $("#clear-keyword").on("click", function() {
            // 清空選擇框的值並觸發更新
            $("#keyword").val("").trigger("change");
        
            // 手動關閉下拉選單
            $("#keyword").select2("close");
        
            // 隱藏清除按鈕
            $(this).hide();

            filterCards();
        });

        $("#clear-attribute").on("click", function() {
            // 清空選擇框的值並觸發更新
            $("#attribute").val("").trigger("change");
        
            // 手動關閉下拉選單
            $("#attribute").select2("close");
        
            // 隱藏清除按鈕
            $(this).hide();

            filterCards();
        });
        
        $("#clear-tag").on("click", function() {
            // 清空選擇框的值並觸發更新
            $("#tag").val("").trigger("change");
        
            // 手動關閉下拉選單
            $("#tag").select2("close");
        
            // 隱藏清除按鈕
            $(this).hide();

            filterCards();
        });

        $("#clear-set").on("click", function() {
            // 清空選擇框的值並觸發更新
            $("#set").val("").trigger("change");
        
            // 手動關閉下拉選單
            $("#set").select2("close");
        
            // 隱藏清除按鈕
            $(this).hide();

            filterCards();
        });

        // 初始化清除按鈕狀態
        if ($("#keyword").val() === "") {
            $("#clear-keyword").hide(); // 當沒有選擇任何項目時，隱藏清除按鈕
        }
        if ($("#attribute").val() === "") {
            $("#clear-attribute").hide(); // 當沒有選擇任何項目時，隱藏清除按鈕
        }
        if ($("#tag").val() === "") {
            $("#clear-tag").hide(); // 當沒有選擇任何項目時，隱藏清除按鈕
        }
        if ($("#set").val() === "") {
            $("#clear-set").hide(); // 當沒有選擇任何項目時，隱藏清除按鈕
        }

        // Enable change events after initialization
    isInitialized = true;
        /*
        // 清空選擇框的值，並觸發更新
        $("#keyword").val("").trigger("change");
        $("#attribute").val("").trigger("change");
        $("#tag").val("").trigger("change");
        $("#set").val("").trigger("change");
        */
    });
    
}

// 清除篩選條件按鈕
clearFiltersBtn.addEventListener("click", () => {
    // 檢查是否有任何篩選條件被選擇
    const isAnyFilterSelected = $("#keyword").val() ||
                                $("#type").val() !== "allOption" ||
                                // Array.from(document.querySelectorAll('input[name="attribute"]')).some(checkbox => checkbox.checked) ||
                                $("#attribute").val() ||
                                $("#tag").val() ||
                                $("#set").val();
    if (isAnyFilterSelected) {
        // 如果有篩選條件被選擇，則清除所有篩選條件
        $("#keyword").val("").trigger("change");
        $("#type").val("allOption").trigger("change");
        $("#attribute").val("").trigger("change");
        $("#tag").val("").trigger("change");
        $("#set").val("").trigger("change");

        /*
        // 清除所有屬性篩選框的選擇
        const attributeCheckboxes = document.querySelectorAll('input[name="attribute"]');
        attributeCheckboxes.forEach(checkbox => {
            checkbox.checked = false;  // 取消選中所有 checkbox
        });
        */

        // 初始化清除按鈕狀態
        $("#clear-keyword").hide(); // 隱藏 "X"
        $("#clear-attribute").hide();
        $("#clear-tag").hide();
        $("#clear-set").hide();

        // 顯示所有卡牌
        displayCards(cardsData);
    }
});

// 顯示卡牌
function displayCards(cards) {
    cardContainer.innerHTML = ""; // 清空現有卡牌

    // Calculate the start and end index for the current page
    const startIndex = currentPage * cardsPerPage;
    const endIndex = Math.min(startIndex + cardsPerPage, cards.length);

    // 如果沒有卡牌，顯示提示訊息
    if (cards.length === 0) {
        cardContainer.innerHTML = '<p>沒有符合的卡牌。</p>';
        return;
    }

    for (let i = startIndex; i < endIndex; i++) {
        const card = cards[i];
        console.log(card);  // Log the card object to inspect its properties
        if (!card.image) {
            console.error(`Card at index ${i} is missing an image property`);
            return;
        }

        const cardElement = document.createElement("div");
        cardElement.classList.add("card");
        cardElement.innerHTML = `
            <img src="${card.image}" alt="${card.name}">
        `;

        // 點擊卡牌展示詳細資訊
        cardElement.addEventListener("click", () => {
            currentIndex = i;  // Update the current index
            showPopup(card, currentIndex);
        });
        cardContainer.appendChild(cardElement);
    }
    // Generate pagination controls
    generatePaginationControls(cards.length);
}

// Function to generate pagination controls
function generatePaginationControls(totalCards) {
    const totalPages = Math.ceil(totalCards / cardsPerPage);
    const paginationContainer = document.getElementById("pagination");
    paginationContainer.innerHTML = ""; // Clear existing pagination controls

    const maxPageButtons = 5;  // 最多顯示的頁碼數量（不包括省略號）

    // 計算顯示頁碼的範圍
    let startPage, endPage;

    if (totalPages <= maxPageButtons) {
        // 如果頁碼總數小於最大頁碼顯示數量，顯示所有頁碼
        startPage = 0;
        endPage = totalPages;
    } else {
        // 如果頁碼總數大於最大頁碼顯示數量，顯示目前頁碼附近的頁碼
        if (currentPage < maxPageButtons - 2) {
            // 當前頁處於前面，顯示前幾頁+省略號
            startPage = 0;
            endPage = maxPageButtons;
        } else if (currentPage > totalPages - maxPageButtons + 2) {
            // 當前頁處於後面，顯示後幾頁+省略號
            startPage = totalPages - maxPageButtons;
            endPage = totalPages;
        } else {
            // 中間部分，顯示前後各兩頁，並加上省略號
            startPage = currentPage - 2;
            endPage = currentPage + 3;
        }
    }

    // Add left arrow even on the first page
        const leftArrow = document.createElement("div");
        leftArrow.classList.add("pagination-arrow");
        leftArrow.innerHTML = `
    <svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium css-vubbuv" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="ArrowBackIosRoundedIcon">
           <path d="M16.62 2.99c-.49-.49-1.28-.49-1.77 0L6.54 11.3c-.39.39-.39 1.02 0 1.41l8.31 8.31c.49.49 1.28.49 1.77 0s.49-1.28 0-1.77L9.38 12l7.25-7.25c.48-.48.48-1.28-.01-1.76z"></path>
         </svg>
`;
    if (currentPage > 0) {
        leftArrow.addEventListener("click", () => {
                currentPage--;
                displayCards(filteredCards); // Update the displayed cards
        });
    } else{
        leftArrow.classList.add("disabled"); // Add a class to indicate it's disabled
    }
        paginationContainer.appendChild(leftArrow);
    
    // CSS to visually indicate the arrow is disabled
const style = document.createElement('style');
style.innerHTML = `
.pagination-arrow.disabled {
    pointer-events: none;
    opacity: 0.5;
}
`;
document.head.appendChild(style);

    // 如果沒有顯示第一頁和省略號，添加省略號
    if (startPage > 1) {
        const ellipsisButton = document.createElement("span");
        ellipsisButton.textContent = "...";
        paginationContainer.appendChild(ellipsisButton);
    }

    // Create pagination buttons
    for (let i = startPage; i < endPage; i++) {
        const pageButton = document.createElement("div");
        pageButton.textContent = i + 1;
        pageButton.classList.add("pagination-button");
        if (i === currentPage) {
            pageButton.classList.add("active");
        }
        pageButton.addEventListener("click", () => {
            currentPage = i;
            displayCards(filteredCards); // Update the displayed cards when a page button is clicked
        });
        paginationContainer.appendChild(pageButton);
    }

    // 如果沒有顯示最後一頁和省略號，添加省略號
    if (endPage < totalPages) {
        const ellipsisButton = document.createElement("span");
        ellipsisButton.textContent = "...";
        paginationContainer.appendChild(ellipsisButton);
    }

    // Add right arrow even on the last page

        const rightArrow = document.createElement("div");
        rightArrow.classList.add("pagination-arrow");
        rightArrow.innerHTML = `
    <svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium css-vubbuv" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="ArrowForwardIosRoundedIcon">
          <path d="M7.38 21.01c.49.49 1.28.49 1.77 0L17.46 12.7c.39-.39.39-1.02 0-1.41l-8.31-8.31c-.49-.49-1.28-.49-1.77 0s-.49 1.28 0 1.77L14.62 12l-7.25 7.25c-.48.48-.48 1.28.01 1.76z"></path>
        </svg>
`;
    if (currentPage < totalPages - 1) {
        rightArrow.addEventListener("click", () => {
                currentPage++;
                displayCards(filteredCards); // Update the displayed cards
        });
        } else {
        rightArrow.classList.add("disabled"); // Add a class to indicate it's disabled
        }
        paginationContainer.appendChild(rightArrow);
    
}

// 根據篩選條件顯示卡牌
function filterCards() {
    // 獲取篩選條件
    const keyword = $("#keyword").val();  // 關鍵字
    const type = $("#type").val();  // 類型
    // const selectedAttributes = Array.from(document.querySelectorAll('input[name="attribute"]:checked')).map(checkbox => checkbox.value);  // 屬性篩選
    const selectedAttributes = $("#attribute").val() || [];  // 使用 Select2 获取多选属性值
    const tag = $("#tag").val();  // 標籤篩選
    const set = $("#set").val();  // 卡包篩選

    console.log('篩選條件:');
    console.log('關鍵字:', keyword);
    console.log('類型:', type);
    console.log('屬性:', selectedAttributes);
    console.log('標籤:', tag);
    console.log('卡包:', set);

    // 根據篩選條件篩選卡牌
    filteredCards = cardsData.filter(card => {
        // 逐個條件篩選
        const matchesKeyword = keyword ? card.name.toLowerCase().includes(keyword.toLowerCase()) : true;  // 如果 keyword 不為空，則篩選符合關鍵字的卡牌
        const matchesType = type && type !== "allOption" ? card.type === type : true;  // 類型選擇框預設為 "allOption"，如果不為空則篩選
        // const matchesAttribute = selectedAttributes.length === 0 || selectedAttributes.some(attr => card.attribute.split(' / ').includes(attr));
        // const matchesAttribute = selectedAttributes.length === 0 || selectedAttributes.includes(card.attribute);  // 如果屬性未選擇，則不篩選屬性
        const matchesAttribute = selectedAttributes.length === 0 || selectedAttributes.some(attr => card.attribute.split(' / ').includes(attr));
        // const matchesLevel = level ? card.level && card.level.includes(level) : true;
        const matchesTag = tag ? card.tag && card.tag.split(' / ').includes(tag) : true;  // 標籤篩選
        // const matchesSet = set ? card.set.includes(set) : true;  // 卡包篩選
        // const matchesSet = set ? (card.set && Array.isArray(card.set) && card.set.includes(set)) : true;  // 卡包篩選
        // const matchesSet = set ? (card.set && Array.isArray(card.set) ? card.set.includes(set) : card.set === set) : true;  // 卡包篩選
        const matchesSet = set ? (card.set && Array.isArray(card.set) ? card.set.some(s => s.includes(set)) : card.set.includes(set)) : true;  // 卡包篩選

        // 返回符合所有條件的卡牌
        return matchesKeyword && matchesType && matchesAttribute && matchesTag && matchesSet; // matchesLevel
    });

    // 去重邏輯：基於卡牌的所有篩選條件去重
    const uniqueCards = removeDuplicates(filteredCards);

    filteredCards = uniqueCards;

    currentPage = 0;
    
    displayCards(filteredCards);
}

// 去重函數，根據所有篩選條件（名稱、類型、屬性、標籤、卡包）進行去重
function removeDuplicates(cards) {
    const seen = new Set();
    const uniqueCards = [];

    cards.forEach(card => {
        // 使用一個唯一的識別符來檢查是否已經處理過該卡牌
        const uniqueKey = `${card.name}-${card.type}-${card.attribute}-${card.tag}-${card.set}`;
        
        if (!seen.has(uniqueKey)) {
            seen.add(uniqueKey);
            uniqueCards.push(card);
        }
    });

    return uniqueCards;
}

// 顯示卡牌的詳細資訊
function showPopup(card, index) {

    console.log(card);  // Log the card object to verify its properties
    
    if (!card || !card.image) {
        console.error("Card or card image is undefined.");
        return;
    }
    
    document.body.style.overflow = "hidden";  // 禁用背景滾動
    // 獲取彈窗內容區域
    const popupcontent = document.querySelector('.popup-content');
    // const popupleft = document.querySelector('.popup-left');
    // const popupright = document.querySelector('.popup-right');
    const closeButton = document.getElementById('closePopup');
    const popupright = document.getElementById('popupr');
    const popupleft = document.getElementById('popupl');

    // Check if elements exist
    if (!popupr || !popupl) {
        console.error("Popup elements are not found in the DOM.");
        return;
    }
    
    popupright.innerHTML = '';
    popupleft.innerHTML = '';

    // 創建左側區域 (顯示卡牌圖片)
    const leftContent = document.createElement('div');
    leftContent.className = 'popup-left';
    leftContent.innerHTML = `
        <img id="popupImage" src="${card.image}" alt="${card.name}">
    `;

    // 填充右側詳細資料
    const rightContent = document.createElement('div');
    rightContent.className = 'popup-right';
    rightContent.innerHTML = `
        <h2>${card.name}</h2>
        <p><strong><span class="label">屬性</span></strong> ${card.attribute}</p>
    `;

    if (card.type === "主推") {
        rightContent.innerHTML += `
        <div id="popupOshiType">
            <p><strong><span class="label">生命值</span></strong> ${card.life}</p>
            <p><strong><span class="label skill">主推技能</span></strong> ${card.skill}</p>
            // <p><strong><span class="label spSkill">SP主推技能</span></strong> ${card.spSkill}</p>
            ${card.spSkill ? `
          <p>
            <strong><span class="label spSkill">SP主推技能</span></strong>
            <div style="display: flex; flex-direction: row; gap: 3px; align-items: center; white-space: nowrap;">
              ${card.spSkill.images.map(image => `
                <img src="${image}" alt="Skill Image" style="width: 15%; max-height: 24px; object-fit: contain;">
              `).join('')}
            </div>
            <div>
              <span>${card.spSkill.description}</span>
            </div>
          </p>
        ` : ''}
            <p><strong><span class="label id">卡牌編號</span></strong> ${card.id}</p>
            <p><strong><span class="label">卡包</span></strong> ${card.set}</p>
        </div>`;
    }

    popupleft.appendChild(leftContent);
    popupright.appendChild(rightContent);
    
    document.getElementById('popup').style.display = 'flex';

    // 設置左右箭頭的事件，基於篩選後的cards
    document.getElementById('arrowLeft').onclick = () => {
    const previousIndex = (currentIndex - 1 + filteredCards.length) % filteredCards.length;  // 處理循環
        currentIndex = previousIndex;  // Update the current index
    showPopup(filteredCards[previousIndex], previousIndex);  // 顯示上一張卡牌
};

document.getElementById('arrowRight').onclick = () => {
    const nextIndex = (currentIndex + 1) % filteredCards.length;  // 處理循環
    currentIndex = nextIndex;  // Update the current index
    showPopup(filteredCards[nextIndex], nextIndex);  // 顯示下一張卡牌
};

}

    document.getElementById('closePopup').addEventListener('click', function() {
        const popup = document.getElementById('popup');
        popup.style.display = 'none'; // 隱藏彈窗
        document.body.style.overflow = "auto";  // 恢復背景滾動
    });


// 監聽篩選條件變動，觸發篩選
// attributeSelect.addEventListener("change", filterCards);
