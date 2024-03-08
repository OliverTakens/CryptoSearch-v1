"use strict"

// Init all DOM Elements
// Buttons and Input in the Navigation
const navigationInput = document.getElementById("navigationSearch");
const navigationButton = document.getElementById("navigationSearchButton");

// Button and Input in the MarketSearch area 
const marketInput = document.getElementById("marketInput");
const marketButton = document.getElementById("marketButton");




// Adding Functionality to the DOM

/**
 * Coins in the Header will be updated on First Website load
 */
async function updateHeaderCoins() {
    const coinList = document.querySelector(".headerCoins");
    const top10Cryptos = await fetchTop10Cryptos();

    if(top10Cryptos){
        for(let i = 0; i < 4; i++){
            let headerCoin = createHeaderCoinHTML(top10Cryptos[i]);
            coinList.innerHTML += headerCoin;
        }
    }

    createTop10List(top10Cryptos)
    checkTrend();
}
updateHeaderCoins()

/**
 * Create a list of Top 10 Cryptos in the #Market area
 */
async function createTop10List(top10Cryptos) {
    const tBodyElement = document.getElementById("marketTableContent");

    // Create the TR Element for every Coin of API Request
    for(let i = 0; i < 10; i++){
        let trElement = createTrHTML(top10Cryptos[i]);
        tBodyElement.innerHTML += trElement;
    }

    checkTrend();
}

/**
 * Check if a Token Price goes up or down in last 24h and update the Text color
 */
function checkTrend() {
    let trendElements = document.querySelectorAll(".trend");
    trendElements.forEach((element) => {
        let elementNumber = parseFloat(element.innerText.replace(/[^0-9.-]/g, ''));

        if(elementNumber >= 0){
            element.classList.add("up-trend");
            element.classList.remove("down-trend");
        } else {
            element.classList.add("down-trend");
            element.classList.remove("up-trend");
        }
    })
}

/**
 * Create a Popup with a Return Function and set the Data of a API Fetch
 * @param {string} coin 
 */
async function openPopup(coin) {
    try {
        let data = await fetchAPI(coin);
        if(data){
            let popUp = createPopupHTML(data[0]);
            let body = document.body;
            body.insertAdjacentHTML("beforeend", popUp);
        }
    
        popupEventListener();
    } catch (error) {
        console.error("Fehler beim Abrufen der API-Daten:", error);
        alert("Anfragen Limit Überschritten oder Inkorrekter Coinname");
    }
}




// Adding Event Listener

/**
 * Set Eventlistener to the Popup Modul
 */
function popupEventListener() {
    // Close Popup on close Button
    document.querySelectorAll(".overlay .closeButton").forEach(closeButton => {
        closeButton.addEventListener("click", () => {
            closeButton.closest(".overlay").remove();
        });
    })

    //Close popup if you click outside the Popup
    document.querySelectorAll(".overlay").forEach((overlay) => {
        overlay.addEventListener("click", () => {
            overlay.remove();
        });
    })
}

/**
 * Open Popup on click in Top 10 Crypto List of #Market
 */
document.addEventListener("click", (event) => {
    let trElement = event.target.closest("tr");
    if(trElement){
        openPopup(trElement.id.toLowerCase());
    }
})

/**
 * Search a Coin in navigation and create a Popup with API Infos
 */
navigationButton.addEventListener("click", () => {
    const coinValue = navigationInput.value.toLowerCase().trim();
    const overlay = document.querySelector(".overlay");

    if(!overlay){
        openPopup(coinValue);
        navigationInput.value = "";
    } else {
        overlay.remove();
        openPopup(coinValue);
        navigationInput.value = "";
    }
})

/**
 * Search a Coin in #Market and create a Popup with API Infos
 */
marketButton.addEventListener("click", () => {
    const coinValue = marketInput.value.toLowerCase().trim();
    const overlay = document.querySelector(".overlay");

    if(!overlay){
        openPopup(coinValue);
        marketInput.value = "";
    } else {
        overlay.remove();
        openPopup(coinValue);
        marketInput.value = "";
    }
})

marketInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        
        const coinValue = this.value.toLowerCase().trim();
        openPopup(coinValue);
        
        this.value = "";
    }
});

navigationInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        
        const coinValue = this.value.toLowerCase().trim();
        openPopup(coinValue);
        
        this.value = "";
    }
});




// API Request

/**
 * Fetching API Data with the selected coin
 * @param {string} coin 
 * @returns API Data (Data of the Crypto Token you will request)
 */
async function fetchAPI(coin){
    try{
        let response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coin}&order=market_cap_desc&per_page=1&page=1&sparkline=true&price_change_percentage=24h%2C7d%2C30d&locale=en`);

        if(!response.ok){
            throw new Error("API abfrage schiefgelaufen");
        }

        let data = await response.json();
        return data;
    } 
    catch(err){
        console.log(err)
    }
}

/**
 * Fetches data for the top 10 cryptocurrencies from the Coingecko API
 * @returns {Promise<Array>} An array of objects, each containing data for a top cryptocurrency
 */
async function fetchTop10Cryptos() {
    try {
        const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false';

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("API-Anfrage schiefgelaufen");
        }

        const data = await response.json();

        // Extrahieren und Umformen der notwendigen Daten
        const top10Cryptos = data.map(coin => ({
            name: coin.name,
            symbol: coin.symbol,
            logo: coin.image,
            current_price: coin.current_price,
            market_cap: coin.market_cap,
            price_change_percentage_24h: coin.price_change_percentage_24h
        }));
        return top10Cryptos;
    } catch (err) {
        console.error(err);
        return [];
    }
}




// Creating HTML Functions

/**
 * Create the Header Coin Info
 * @param {Array} data 
 * @returns Html String
 */
function createHeaderCoinHTML(data) {
    return `<div class="headerCoin">
    <span class="headerCoinName">${data.name}</span> <span class="headerDailyChange trend">${data.price_change_percentage_24h.toFixed(2)} %</span> <br>
    <span class="headerCoinPrice trend">${data.current_price} $</span>
</div>`
}

/**
 * Create a TR HTML Element
 * @param {Array} data 
 * @returns HTML String
 */
function createTrHTML(data) {
    return `<tr id="${data.name}">
    <td>${data.name}</td>
    <td><img class="marketImage" src="${data.logo}" alt=""></td>
    <td>${data.current_price} $</td>
    <td>${data.market_cap} $</td>
    <td class="trend">${data.price_change_percentage_24h.toFixed(2)} %</td>
</tr>`
}

/**
 * Create a Popup Modul with API Infos
 * @param {Array} data 
 * @returns HTML String of Popup
 */
function createPopupHTML(data) {
    return `<div class="overlay">
    <div class="popup">
        <i class='bx bx-x closeButton'></i>
        <h2 class="popupHeading">${data.name}</h2>
        <div class="cryptoContainer">
            <div class="cryptoPrice">
                <span class="priceValue">${data.current_price} $</span>
                <div class="priceChanges">
                    <span class="change daily">TAG ${data.price_change_percentage_24h.toFixed(2)} %</span>
                    <span class="change weekly">WOCHE ${data.price_change_percentage_7d_in_currency.toFixed(2)} %</span>
                    <span class="change monthly">MONAT ${data.price_change_percentage_30d_in_currency.toFixed(2)} %</span>
                </div>
            </div>
            <div class="cryptoDetails">
                <div class="detailItem">
                    <span class="detailTitle">Place</span>
                    <span class="detailValue">${data.market_cap_rank}</span>
                </div>
                <div class="detailItem">
                    <span class="detailTitle">High 24 hours</span>
                    <span class="detailValue">${data.high_24h} $</span>
                </div>
                <div class="detailItem">
                    <span class="detailTitle">Low 24 hours</span>
                    <span class="detailValue">${data.low_24h} $</span>
                </div>
                <div class="detailItem">
                    <span class="detailTitle">All-time high</span>
                    <span class="detailValue">${data.ath} $</span>
                </div>
                <div class="detailItem">
                    <span class="detailTitle">Volume 24 hours</span>
                    <span class="detailValue">${data.total_volume} $</span>
                </div>
                <div class="detailItem">
                    <span class="detailTitle">Maximum supply</span>
                    <span class="detailValue">${data.max_supply}</span>
                </div>
                <div class="detailItem">
                    <span class="detailTitle">Tradable coins</span>
                    <span class="detailValue">${data.circulating_supply}</span>
                </div>
                <div class="detailItem">
                    <span class="detailTitle">Market capitalization</span>
                    <span class="detailValue">${data.market_cap} $</span>
                </div>
                <div class="detailItem">
                    <span class="detailTitle">24 hours change</span>
                    <span class="detailValue">${data.price_change_percentage_24h} %</span>
                </div>
            </div>
        </div>             
    </div>
</div>`
}