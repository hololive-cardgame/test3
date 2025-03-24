// 取得所有的篩選選單元素
const attributeSelect = document.getElementById("attribute");  // 屬性
const setSelect = document.getElementById("set");  // 卡包
const clearFiltersBtn = document.getElementById("clear-filters");  // 清除篩選條件按鈕

let filteredCards = [];  // 篩選後的卡牌資料

// 使用 fetch 從 JSON 檔案載入資料
fetch("cards.json")
    .then(response => response.json())  // 解析 JSON 資料
    .then(data => {
        cardsData = data;
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
        if (card.tag) {
            card.tag.split(" / ").forEach(tag => tags.add(tag));
        }
        if (card.set) {
            if (card.set.includes("起始牌組")) {
                sets["起始牌組"].add(card.set);
            }else if (card.set.includes("補充包")) {
                sets["補充包"].add(card.set);
            }else if (card.set === "配件" || card.set === "PR卡"){
                sets["其他"].add(card.set);
            }
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
        
        // 添加該分類下的所有卡包選項
        sets[category].forEach(set => {
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
        // 初始化關鍵字
        $("#keyword").select2({
            placeholder: "",
            minimumResultsForSearch: Infinity,
            width: "100%"
        });

        // 初始化類型（在上方）

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

        // 監聽 Select2 的變更事件，當選擇框有值時顯示自定義的清除按鈕
        $("#keyword").on("select2:select", function (e) {
            $("#clear-keyword").show();  // 顯示自定義清除按鈕
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
        });
        
        $("#clear-tag").on("click", function() {
            // 清空選擇框的值並觸發更新
            $("#tag").val("").trigger("change");
        
            // 手動關閉下拉選單
            $("#tag").select2("close");
        
            // 隱藏清除按鈕
            $(this).hide();
        });

        $("#clear-set").on("click", function() {
            // 清空選擇框的值並觸發更新
            $("#set").val("").trigger("change");
        
            // 手動關閉下拉選單
            $("#set").select2("close");
        
            // 隱藏清除按鈕
            $(this).hide();
        });

        // 初始化清除按鈕狀態
        if ($("#keyword").val() === "") {
            $("#clear-keyword").hide(); // 當沒有選擇任何項目時，隱藏清除按鈕
        }
        if ($("#tag").val() === "") {
            $("#clear-tag").hide(); // 當沒有選擇任何項目時，隱藏清除按鈕
        }
        if ($("#set").val() === "") {
            $("#clear-set").hide(); // 當沒有選擇任何項目時，隱藏清除按鈕
        }
        
        // 清空選擇框的值，並觸發更新
        $("#keyword").val("").trigger("change");
        $("#tag").val("").trigger("change");
        $("#set").val("").trigger("change");
    });
    
}

// 清除篩選條件按鈕
clearFiltersBtn.addEventListener("click", () => {
    // 檢查是否有任何篩選條件被選擇
    const isAnyFilterSelected = $("#keyword").val() ||
                                $("#type").val() ||
                                Array.from(document.querySelectorAll('input[name="attribute"]')).some(checkbox => checkbox.checked) ||
                                $("#tag").val() ||
                                $("#set").val();
    if (isAnyFilterSelected) {
        // 如果有篩選條件被選擇，則清除所有篩選條件
        $("#keyword").val("").trigger("change");
        $("#type").val("allOption").trigger("change");
        $("#tag").val("").trigger("change");
        $("#set").val("").trigger("change");
        
        // 清除所有屬性篩選框的選擇
        const attributeCheckboxes = document.querySelectorAll('input[name="attribute"]');
        attributeCheckboxes.forEach(checkbox => {
            checkbox.checked = false;  // 取消選中所有 checkbox
        });

        // 初始化清除按鈕狀態
        $("#clear-keyword").hide(); // 隱藏 "X"
        $("#clear-tag").hide();
        $("#clear-set").hide();

        // 顯示所有卡牌
        displayCards(cardsData);
    }
});

