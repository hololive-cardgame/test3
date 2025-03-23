const keywordSelect = document.getElementById('keyword');  // 關鍵字

let filteredCards = [];  // 篩選後的卡牌資料

// 使用 fetch 從 JSON 檔案載入資料
fetch('cards.json')
    .then(response => response.json())  // 解析 JSON 資料
    .then(data => {
        cardsData = data;
        generateFilterOptions();  // 生成篩選選項
        displayCards(cardsData);  // 顯示所有卡牌
    })
    .catch(error => {
        console.error('Error loading the card data:', error);
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
            card.tag.split(' / ').forEach(tag => tags.add(tag));
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
            const option = document.createElement('option');
            option.value = keyword;
            option.textContent = keyword;
            keywordSelect.appendChild(option);
        }
    });
    
    // 初始化關鍵字 Select2
    $(document).ready(function() {
        $('#keyword').select2({
            placeholder: '',
            allowClear: true,
            minimumResultsForSearch: Infinity
        });
    });
}
