// 取得所有的篩選選單元素
// const keywordSelect = document.getElementById("keyword");  // 關鍵字

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

    // 初始化 Select2
    $(document).ready(function() {
        // 關鍵字
        $("#keyword").select2({
            placeholder: "",
            minimumResultsForSearch: Infinity,
            width: "100%"
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

        // 在 Select2 的容器內插入自定義清除按鈕
        $('#keyword').on('select2:open', function() {
            var select2Container = $(".select2-container");
            select2Container.find('.select2-selection').append($('#clear-keyword'));  // 把清除按鈕移動到容器內
        });

        // 監聽 Select2 的變更事件，當選擇框有值時顯示自定義的清除按鈕
        $("#keyword").on("select2:select", function (e) {
            $("#clear-keyword").show();  // 顯示自定義清除按鈕
        });

        // 監聽 Select2 的清除事件，當選擇框清除選項時隱藏自定義的清除按鈕
        $("#keyword").on("select2:clear", function (e) {
            $("#clear-keyword").hide();  // 隱藏自定義清除按鈕
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

        // 初始化清除按鈕狀態
        if ($("#keyword").val() === "") {
            $("#clear-keyword").hide(); // 當沒有選擇任何項目時，隱藏清除按鈕
        }
        
        // 清空選擇框的值，並觸發更新
        $("#keyword").val("").trigger("change");
    });
    
}
