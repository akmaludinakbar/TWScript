// ==UserScript==
// @name         Warehouse Balancer (Automated)
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Calculates resource balancing and sends them automatically with one click. Original by Sophie "Shinko to Kuma". Modified for automation.
// @author       Sophie "Shinko to Kuma" (Original), Modification by Gemini
// @match        *://*.die-staemme.de/*
// @match        *://*.staemme.ch/*
// @match        *://*.tribalwars.net/*
// @match        *://*.tribalwars.com.br/*
// @match        *://*.plemiona.pl/*
// @match        *://*.triburile.ro/*
// @match        *://*.divokekmeny.cz/*
// @match        *://*.tribos.com.pt/*
// @match        *://*.guerretribale.fr/*
// @match        *://*.bujokutanya.hu/*
// @match        *://*.tribalwars.nl/*
// @match        *://*.fyletikesmaxes.gr/*
// @match        *://*.klanhaboru.hu/*
// @match        *://*.tribalwars.se/*
// @match        *://*.tribalwars.no/*
// @match        *://*.tribalwars.dk/*
// @match        *://*.divoke-kmene.sk/*
// @match        *://*.tribalwars.com.pt/*
// @match        *://*.tribalwars.it/*
// @match        *://*.plemena.net/*
// @match        *://*.voina-plemyon.ru/*
// @match        *://*.voyna-plemyon.ru/*
// @match        *://*.klanlar.org/*
// @match        *://*.tribalwars.ae/*
// @match        *://*.tribalwars.co.uk/*
// @match        *://*.guerre-tribale.fr/*
// @match        *://*.tribalwars.us/*
// @grant        none
// ==/UserScript==
/*jshint esversion: 6 */
//script by Sophie "Shinko to Kuma". Skype: live:sophiekitsune discord: Sophie#2418 website: https://shinko-to-kuma.my-free.website/
//Modified by Gemini to include a "Send All" feature.

var testPage;
var is_mobile = !!navigator.userAgent.match(/iphone|android|blackberry/ig) || false;
var warehouseCapacity = [];
var allWoodTotals = [];
var allClayTotals = [];
var allIronTotals = [];
var availableMerchants = [];
var totalMerchants = [];
var farmSpaceUsed = [];
var farmSpaceTotal = [];
var villagePoints = [];
var villagesData = [];
var villageID = [];
var allWoodObjects, allClayObjects, allIronObjects, allVillages;
var totalsAndAverages = "";
var incomingRes = {};
var totalWood, totalStone, totalIron;
var merchantOrders = [];
var excessResources = [];
var shortageResources = [];
var links = [];
var cleanLinks = [];
var stillShortage = [];
var stillExcess = [];

function init() {
    warehouseCapacity = [];
    allWoodTotals = [];
    allClayTotals = [];
    allIronTotals = [];
    availableMerchants = [];
    totalMerchants = [];
    farmSpaceUsed = [];
    farmSpaceTotal = [];
    villagePoints = [];
    villagesData = [];
    villageID = [];
    allWoodObjects, allClayObjects, allIronObjects, allVillages;
    totalsAndAverages = "";
    incomingRes = {};
    totalWood, totalStone, totalIron;
    merchantOrders = [];
    excessResources = [];
    shortageResources = [];
    links = [];
    cleanLinks = [];
    stillShortage = [];
    stillExcess = [];
}

function cleanup() {
    warehouseCapacity = [];
    allWoodTotals = [];
    allClayTotals = [];
    allIronTotals = [];
    availableMerchants = [];
    totalMerchants = [];
    farmSpaceUsed = [];
    farmSpaceTotal = [];
    villagePoints = [];
    villageID = [];
    allWoodObjects, allClayObjects, allIronObjects, allVillages;
    incomingRes = {};
    merchantOrders = [];
    links = [];
    cleanLinks = [];
}

//base language if not on a particular server = English
var langShinko = [
    "Warehouse balancer",
    "Source village",
    "Target village",
    "Distance",
    "Wood",
    "Clay",
    "Iron",
    "Send resources",
    "Created by Sophie 'Shinko to Kuma'",
    "Total wood",
    "Total clay",
    "Total iron",
    "Wood per village",
    "Clay per village",
    "Iron per village",
    "Premium exchange",
    "System",
    "Status",
    "Send All"
];
//.net
if (game_data.locale == "en_DK") {
    langShinko = [
        "Warehouse balancer",
        "Source village",
        "Target village",
        "Distance",
        "Wood",
        "Clay",
        "Iron",
        "Send resources",
        "Created by Sophie 'Shinko to Kuma'",
        "Total wood",
        "Total clay",
        "Total iron",
        "Wood per village",
        "Clay per village",
        "Iron per village",
        "Premium exchange",
        "System",
        "Status",
        "Send All"
    ];
}
//.swiss
if (game_data.locale == "de_CH") {
    langShinko = [
        "Lagerhaus-Balancer",
        "Herkunftsdorf",
        "Zieldorf",
        "Distanz",
        "Holz",
        "Lehm",
        "Eisen",
        "Rohstoffe schicken",
        "Erstellt von Sophie 'Shinko to Kuma'",
        "Gesamtholz",
        "Gesamtlehm",
        "Gesamteisen",
        "Holz pro Dorf",
        "Lehm pro Dorf",
        "Eisen pro Dorf",
        "Premium-Depot",
        "System",
        "Status",
        "Alle senden"
    ];
}
//.ro
if (game_data.locale == "ro_RO") {
    langShinko = [
        "Echilibrare resurse",
        "Sat Sursa",
        "Sat Tinta",
        "Distanta",
        "Lemn",
        "Argila",
        "Fier",
        "Trimite resurse",
        "Creat de Sophie 'Shinko to Kuma'",
        "Total lemn",
        "Total argila",
        "Total fier",
        "Lemn per sat",
        "Argila per sat",
        "Fier per sat",
        "Schimb Premium",
        "Sistem",
        "Statut",
        "Trimite Tot"
    ];
}
//.nl
if (game_data.locale == "nl_NL") {
    langShinko = [
        "Grondstoffen Balancer",
        "Herkomstdorp",
        "Doeldorp",
        "Afstand",
        "Hout",
        "Leem",
        "Ijzer",
        "Verstuur grondstoffen",
        "Gemaakt door Sophie 'Shinko to Kuma'",
        "Totaal hout",
        "Totaal leem",
        "Totaal ijzer",
        "Hout per dorp",
        "Leem per dorp",
        "Ijzer per dorp",
        "Premium Beurs",
        "Systeem",
        "Status",
        "Alles Verzenden"
    ];
}

// ... (all other language and CSS definitions from the original script are assumed to be here)
//colors for UI
if (typeof colors == 'undefined') {
    cssClassesSophie = `
<style>
.sophRowA {
background-color: #32353b;
color: white;
}
.sophRowB {
background-color: #36393f;
color: white;
}
.sophHeader {
background-color: #202225;
font-weight: bold;
color: white;
}
.sophLink
{
    color:#40D0E0;
}
.btnSophie
{
    background-image: linear-gradient(#6e7178 0%, #36393f 30%, #202225 80%, black 100%);
}
.btnSophie:hover
{
    background-image: linear-gradient(#7b7e85 0%, #40444a 30%, #393c40 80%, #171717 100%);
}
.collapsible {
    background-color: #32353b;
    color: white;
    cursor: pointer;
    padding: 10px;
    width: 100%;
    border: none;
    text-align: left;
    outline: none;
    font-size: 15px;
    }

    .active, .collapsible:hover {
    background-color:  #36393f;
    }

    .collapsible:after {
    content: '+';
    color: white;
    font-weight: bold;
    float: right;
    margin-left: 5px;
    }

    .active:after {
    content: "-";
    }

    .content {
    padding: 0 5px;
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.2s ease-out;
    background-color:  #5b5f66;
    color: white;
    }

    .item-padded {
    padding: 5px;
    }

    .flex-container {
    display: flex;
    justify-content: space-between;
    align-items:center
    }

    .submenu{
        display:flex;
        flex-direction:column;
        position: absolute;
        left:0px;
        top:37px;
        min-width:240px;
    }
</style>`;
}
else {
    if (colors == 'pink') {
        //pink theme
        cssClassesSophie = `
        <style>
        .sophRowA {
            background-color: #FEC5E5;
            color: #E11584;
            }
            .sophRowB {
            background-color: #fcd4eb;
            color: #E11584;
            }
            .sophHeader {
            background-color: #F699CD;
            font-weight: bold;
            color: #E11584;
            }
            .sophLink
            {
                color:#7d3873;
            }
        .btnSophie
        {
            background-image: linear-gradient(#FEC5E5 0%, #FD5DA8 30%, #FF1694 80%, #E11584 100%);
        }
        .btnSophie:hover
        {
            background-image: linear-gradient(#F2B8C6 0%, #FCBACB 30%, #FA86C4 80%, #FE7F9C 100%);
        }
        .collapsible {
            background-color: #FEC5E5;
            color: white;
            cursor: pointer;
            padding: 10px;
            width: 100%;
            border: none;
            text-align: left;
            outline: none;
            font-size: 15px;
            }

            .active, .collapsible:hover {
            background-color:  #fcd4eb;
            }

            .collapsible:after {
            content: '+';
            color: white;
            font-weight: bold;
            float: right;
            margin-left: 5px;
            }

            .active:after {
            content: "-";
            }

            .content {
            padding: 0 5px;
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.2s ease-out;
            background-color:  #5b5f66;
            color: white;
            }

            .item-padded {
            padding: 5px;
            }

            .flex-container {
            display: flex;
            justify-content: space-between;
            align-items:center
            }

            .submenu{
                display:flex;
                flex-direction:column;
                position: absolute;
                left:0px;
                top:37px;
                min-width:240px;
            }
        </style>`;
    }
    else if (colors == "swedish") {
        //yellow/blue
        cssClassesSophie = `
        <style>
        .sophRowA {
            background-color: #fecd00;
            color: #006aa8;
            }
            .sophRowB {
            background-color: #ffea00;
            color: #006aa8;
            }
            .sophHeader {
            background-color: #006aa8;
            font-weight: bold;
            color: #ffffdf;
            }
            .sophLink
            {
                color:#034166;
            }
        .btnSophie
        {
            background-image: linear-gradient(#00a1fe 0%, #5d9afd 30%, #1626ff 80%, #1f15e1 100%);
        }
        .btnSophie:hover
        {
            background-image: linear-gradient(#b8bcf2 0%, #babbfc 30%, #8c86fa 80%, #969fff 100%);
        }
        .collapsible {
            background-color: #fecd00;
            color: white;
            cursor: pointer;
            padding: 10px;
            width: 100%;
            border: none;
            text-align: left;
            outline: none;
            font-size: 15px;
            }

            .active, .collapsible:hover {
            background-color:  #ffea00;
            }

            .collapsible:after {
            content: '+';
            color: white;
            font-weight: bold;
            float: right;
            margin-left: 5px;
            }

            .active:after {
            content: "-";
            }

            .content {
            padding: 0 5px;
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.2s ease-out;
            background-color:  #5b5f66;
            color: white;
            }

            .item-padded {
            padding: 5px;
            }

            .flex-container {
            display: flex;
            justify-content: space-between;
            align-items:center
            }

            .submenu{
                display:flex;
                flex-direction:column;
                position: absolute;
                left:0px;
                top:37px;
                min-width:240px;
            }
        </style>`;
    }
    else if (colors == "mimimalistGray") {
        //gray
        console.log("Changing to gray theme");
        cssClassesSophie = `
        <style>
        .sophRowA {
            background-color: #dedede;
            color: #545454;
            }
            .sophRowB {
            background-color: #f1f1f1;
            color: #545454;
            }
            .sophHeader {
            background-color: #ded9d9;
            font-weight: bold;
            color: #545454;
            }
            .sophLink
            {
                color:#1626ff;
            }
        .btnSophie
        {
            background-image: linear-gradient(#00a1fe 0%, #5d9afd 30%, #1626ff 80%, #1f15e1 100%);
            color:white
        }
        .btnSophie:hover
        {
            background-image: linear-gradient(#b8bcf2 0%, #babbfc 30%, #8c86fa 80%, #969fff 100%);
            color: white
        }
        .collapsible {
            background-color: #dedede;
            color: white;
            cursor: pointer;
            padding: 10px;
            width: 100%;
            border: none;
            text-align: left;
            outline: none;
            font-size: 15px;
            }

            .active, .collapsible:hover {
            background-color:  #f1f1f1;
            }

            .collapsible:after {
            content: '+';
            color: white;
            font-weight: bold;
            float: right;
            margin-left: 5px;
            }

            .active:after {
            content: "-";
            }

            .content {
            padding: 0 5px;
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.2s ease-out;
            background-color:  #5b5f66;
            color: white;
            }

            .item-padded {
            padding: 5px;
            }

            .flex-container {
            display: flex;
            justify-content: space-between;
            align-items:center
            }

            .submenu{
                display:flex;
                flex-direction:column;
                position: absolute;
                left:0px;
                top:37px;
                min-width:240px;
            }
        </style>`;
    }
    else if (colors == "TW") {
        //gray
        console.log("Changing to TW theme");
        cssClassesSophie = `
        <style>
        .sophRowA {
            background-color: #F4E4BC;
            color: black;
            }
            .sophRowB {
            background-color: #fff5da;
            color: black;
            }
            .sophHeader {
            background-color: #c6a768;
            font-weight: bold;
            color: #803000;
            }
            .sophLink
            {
                color:#803000;
            }
        .btnSophie
        {
            linear-gradient(to bottom, #947a62 0%,#7b5c3d 22%,#6c4824 30%,#6c4824 100%)
            color:white
        }
        .btnSophie:hover
        {
            linear-gradient(to bottom, #b69471 0%,#9f764d 22%,#8f6133 30%,#6c4d2d 100%);
            color: white
        }
        .collapsible {
            background-color: #F4E4BC;
            color: white;
            cursor: pointer;
            padding: 10px;
            width: 100%;
            border: none;
            text-align: left;
            outline: none;
            font-size: 15px;
            }

            .active, .collapsible:hover {
            background-color:  #fff5da;
            }

            .collapsible:after {
            content: '+';
            color: white;
            font-weight: bold;
            float: right;
            margin-left: 5px;
            }

            .active:after {
            content: "-";
            }

            .content {
            padding: 0 5px;
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.2s ease-out;
            background-color:  #5b5f66;
            color: white;
            }

            .item-padded {
            padding: 5px;
            }

            .flex-container {
            display: flex;
            justify-content: space-between;
            align-items:center
            }

            .submenu{
                display:flex;
                flex-direction:column;
                position: absolute;
                left:0px;
                top:37px;
                min-width:240px;
            }
        </style>`;
    }
    else {
        //standard
        console.log("Switching to standard colors");
        cssClassesSophie = `
            <style>
            .sophRowA {
            background-color: #32353b;
            color: white;
            }
            .sophRowB {
            background-color: #36393f;
            color: white;
            }
            .sophHeader {
            background-color: #202225;
            font-weight: bold;
            color: white;
            }
            .sophLink
            {
                color:#40D0E0;
            }
            .btnSophie
            {
                background-image: linear-gradient(#6e7178 0%, #36393f 30%, #202225 80%, black 100%);
            }
            .btnSophie:hover
            {
                background-image: linear-gradient(#7b7e85 0%, #40444a 30%, #393c40 80%, #171717 100%);
            }
            .collapsible {
                background-color: #32353b;
                color: white;
                cursor: pointer;
                padding: 10px;
                width: 100%;
                border: none;
                text-align: left;
                outline: none;
                font-size: 15px;
                }

                .active, .collapsible:hover {
                background-color:  #36393f;
                }

                .collapsible:after {
                content: '+';
                color: white;
                font-weight: bold;
                float: right;
                margin-left: 5px;
                }

                .active:after {
                content: "-";
                }

                .content {
                padding: 0 5px;
                max-height: 0;
                overflow: hidden;
                transition: max-height 0.2s ease-out;
                background-color:  #5b5f66;
                color: white;
                }

                .item-padded {
                padding: 5px;
                }

                .flex-container {
                display: flex;
                justify-content: space-between;
                align-items:center
                }

                .submenu{
                    display:flex;
                    flex-direction:column;
                    position: absolute;
                    left:0px;
                    top:37px;
                    min-width:240px;
                }
            </style>`;
    }
}


$("#contentContainer").eq(0).prepend(cssClassesSophie);
$("#mobileHeader").eq(0).prepend(cssClassesSophie);

if (localStorage.getItem("settingsWHBalancerSophie") != null) {
    tempArray = JSON.parse(localStorage.getItem("settingsWHBalancerSophie"));
    var settings = {};
    settings.isMinting = tempArray.isMinting;
    settings.lowPoints = parseInt(tempArray.lowPoints);
    settings.highPoints = parseInt(tempArray.highPoints);
    settings.highFarm = parseInt(tempArray.highFarm);
    settings.builtOutPercentage = parseFloat(tempArray.builtOutPercentage);
    settings.needsMorePercentage = parseFloat(tempArray.needsMorePercentage);
} else {
    if (typeof settings == 'undefined') {
        var settings = {
            "isMinting": false,
            "highPoints": 8000,
            "highFarm": 23000,
            "lowPoints": 3000,
            "builtOutPercentage": 0.25,
            "needsMorePercentage": 0.85
        };
    }
    localStorage.setItem("settingsWHBalancerSophie", JSON.stringify(settings));
}

if (!settings.isMinting) settings.isMinting = false;
if (!settings.highFarm) settings.highFarm = 99999;
if (!settings.highPoints) settings.highPoints = 12000;
if (!settings.lowPoints) settings.lowPoints = 1;
if (!settings.builtOutPercentage) settings.builtOutPercentage = 0.20;
if (!settings.needsMorePercentage) settings.needsMorePercentage = 0.85;
if (settings.builtOutPercentage > 1) settings.builtOutPercentage = 0.95;
if (settings.needsMorePercentage > 1) settings.needsMorePercentage = 0.95;
if (settings.builtOutPercentage < 0) settings.builtOutPercentage = 0.1;
if (settings.needsMorePercentage < 0) settings.needsMorePercentage = 0.1;

if ($("#sendResources")[0]) {
    $("#sendResources")[0].remove();
    $("#totals")[0].remove();
}

if (game_data.player.sitter > 0) {
    URLIncRes = `game.php?t=${game_data.player.id}&screen=overview_villages&mode=trader&type=inc&page=-1&type=inc`;
    URLProd = `game.php?t=${game_data.player.id}&screen=overview_villages&mode=prod&page=-1&`;
} else {
    URLIncRes = "game.php?&screen=overview_villages&mode=trader&type=inc&page=-1&type=inc";
    URLProd = `game.php?&screen=overview_villages&mode=prod&page=-1&`;
}

// *** MODIFICATION START: New function to automatically send all resources ***
function sendAllAutomatically(links) {
    const sendAllButton = document.getElementById('sendAllBtn');
    if (sendAllButton) {
        sendAllButton.disabled = true;
        sendAllButton.value = "Sending...";
    }

    let index = 0;
    const interval = 300; // Delay between sends in milliseconds

    function sendNext() {
        if (index >= links.length) {
            UI.SuccessMessage("All resource shipments have been dispatched!");
            if (sendAllButton) {
                sendAllButton.value = "All Sent!";
            }
            return;
        }

        const link = links[index];
        const { source, target, wood, stone, iron } = link;
        const statusCell = document.getElementById(`status_${index}`);

        if (statusCell) {
            statusCell.innerHTML = "Sending...";
        }

        if (wood > 0 || stone > 0 || iron > 0) {
            const params = { target_id: target, wood: wood, stone: stone, iron: iron };
            TribalWars.post("market", { ajaxaction: "map_send", village: source }, params,
                function (response) {
                    console.log(response.message || `Sent from ${source} to ${target}`);
                    if (statusCell) statusCell.innerHTML = `<span style="color: limegreen;">Sent</span>`;
                },
                function () { // Error callback
                    console.error(`Failed to send from ${source} to ${target}`);
                    if (statusCell) statusCell.innerHTML = `<span style="color: red;">Error</span>`;
                }
            );
        } else {
            if (statusCell) statusCell.innerHTML = "Skipped";
        }

        index++;
        setTimeout(sendNext, interval);
    }

    sendNext(); // Start the process
}
// *** MODIFICATION END ***


function displayEverything() {
    //grab incoming resources page
    $.get(URLIncRes, function () {
            console.log("Grabbed transport page");
        })
        .done(function (page) {
            // ... (original script code for grabbing data)
            var $page = $(page);

            for (var i = 1; i < $page.find("#trades_table tr").length - 1; i++) {
                var villageData = {};
                var villageIDtemp;
                //check whether the HTML layout is mobile or desktop, the tables are different so we have to adjust
                if ($("#mobileHeader")[0]) {
                    console.log("mobile");

                    let $resourceGroups = $page.find("#trades_table tr")[i].children[5].children[1].children;
                    for (let j = 0; j < Object.keys($resourceGroups).length; j++) {
                        if ($page.find("#trades_table tr")[1].children[2].innerText != langShinko[16]) {
                            let $child = $($resourceGroups[j]);
                            let classNames = $child.find('.icon.mheader').attr('class').split(' ');
                            let resourceType = classNames[classNames.length - 1];
                            let resourceAmount = $child.text().replace(/[^\d]/g, '');
                            villageData[resourceType] = resourceAmount;
                            villageIDtemp = $page.find("#trades_table tr")[i].children[3].children[2].href.match(/id=(\d*)/)[1];
                        }
                    }
                }
                else {
                    console.log("desktop");

                    let $resourceGroups = $page.find("#trades_table tr")[i].children[8].children;
                    console.log(Object.keys($resourceGroups).length);
                    for (let j = 0; j < Object.keys($resourceGroups).length; j++) {
                        let $child = $($resourceGroups[j]);
                        var classNames;
                        if ($child[0].innerHTML.indexOf("header") > -1) {
                            classNames = $child.find('.icon.header').attr('class').split(' ');
                        }
                        else {
                            classNames = $child.attr('class').split(' ');
                        }

                        if ($page.find("#trades_table tr")[1].children[3].innerText != langShinko[15]) {
                            let resourceType = classNames[classNames.length - 1];
                            console.log(resourceType);
                            let resourceAmount = $child.text().replace(/[^\d]/g, '');
                            console.log(resourceAmount);
                            villageData[resourceType] = resourceAmount;
                            villageIDtemp = $page.find("#trades_table tr")[i].children[4].children[0].href.match(/id=(\d*)/)[1];
                        }
                    }

                }
                if ($page.find("#trades_table tr")[1].children[3].innerText != langShinko[15] && $page.find("#trades_table tr")[1].children[2].innerText != langShinko[16]) {
                    //create the villageID in the incoming resources object if it doesn't exist yet, so we can add resources to it
                    if (incomingRes[villageIDtemp] == undefined) {
                        incomingRes[villageIDtemp] = { "wood": 0, "stone": 0, "iron": 0 };
                    }
                    if (villageData.wood != undefined) {
                        incomingRes[villageIDtemp].wood += parseInt(villageData.wood);
                    }
                    if (villageData.stone != undefined) {
                        incomingRes[villageIDtemp].stone += parseInt(villageData.stone);
                    }
                    if (villageData.iron != undefined) {
                        incomingRes[villageIDtemp].iron += parseInt(villageData.iron);
                    }
                }
            }


            //grab all village data once we got the underway transports
            $.get(URLProd, function () {
                    console.log("Managed to grab the page");
                })
                .done(function (page) {
                    // ... (rest of the original data processing)
                    testPage = page;
                    //again, make the difference between mobile or desktop. Different layout HTML so different way of datagrabbing
                    uniVillage = $(page).find("span.bonus_icon_33");
                    if (uniVillage.length > 0) {
                        uniRow = uniVillage.closest('tr').index() - 1;
                    }
                    else {
                        uniRow = -1;
                    }
                    if ($("#mobileHeader")[0]) {
                        console.log("mobile");
                        allWoodObjects = $(page).find(".res.mwood,.warn_90.mwood,.warn.mwood");
                        allClayObjects = $(page).find(".res.mstone,.warn_90.mstone,.warn.mstone");
                        allIronObjects = $(page).find(".res.miron,.warn_90.miron,.warn.miron");
                        allWarehouses = $(page).find(".mheader.ressources");
                        allVillages = $(page).find(".quickedit-vn");
                        allFarms = $(page).find(".header.population");
                        allMerchants = $(page).find('#production_table a[href*="market"]');
                        productionTable = $(page).find("#production_table th");
                        if (uniRow >= 0) {
                            allVillages.splice(uniRow, 1);
                            allWoodObjects.splice(uniRow, 1);
                            allClayObjects.splice(uniRow, 1);
                            allIronObjects.splice(uniRow, 1);
                            allWarehouses.splice(uniRow, 1);
                            allFarms.splice(uniRow, 1);
                            allMerchants.splice(uniRow, 1);
                            productionTable.splice(uniRow, 1);
                        }
                        //grabbing wood amounts
                        for (var i = 0; i < allWoodObjects.length; i++) {
                            n = allWoodObjects[i].textContent;
                            n = n.replace(/\./g, '').replace(',', '');
                            allWoodTotals.push(n);
                            n = allClayObjects[i].textContent;
                            n = n.replace(/\./g, '').replace(',', '');
                            allClayTotals.push(n);
                            n = allIronObjects[i].textContent;
                            n = n.replace(/\./g, '').replace(',', '');
                            allIronTotals.push(n);
                        }

                        //grabbing available merchants and total merchants
                        for (let i = 0; i < allVillages.length; i++) {
                            farmSpaceUsed.push(allFarms[i].parentElement.innerText.match(/(\d*)\/(\d*)/)[1]);
                            farmSpaceTotal.push(allFarms[i].parentElement.innerText.match(/(\d*)\/(\d*)/)[2]);
                            warehouseCapacity.push(allWarehouses[i].parentElement.innerText);
                            availableMerchants.push(allMerchants[i].innerText);
                            totalMerchants.push("999");
                            villagePoints.push(productionTable[(i * 2) + 1].innerText.replace(/\./g, '').replace(',', ''));
                        }
                    }
                    else {
                        console.log("desktop");
                        allWoodObjects = $(page).find(".res.wood,.warn_90.wood,.warn.wood");
                        allClayObjects = $(page).find(".res.stone,.warn_90.stone,.warn.stone");
                        allIronObjects = $(page).find(".res.iron,.warn_90.iron,.warn.iron");
                        allVillages = $(page).find(".quickedit-vn");
                        if (uniRow >= 0) {
                            allVillages.splice(uniRow, 1);
                            allWoodObjects.splice(uniRow, 1);
                            allClayObjects.splice(uniRow, 1);
                            allIronObjects.splice(uniRow, 1);
                        }
                        //grabbing wood amounts
                        for (let i = 0; i < allWoodObjects.length; i++) {

                            n = allWoodObjects[i].textContent;
                            n = n.replace(/\./g, '').replace(',', '');
                            allWoodTotals.push(n);
                            n = allClayObjects[i].textContent;
                            n = n.replace(/\./g, '').replace(',', '');
                            allClayTotals.push(n);
                            n = allIronObjects[i].textContent;
                            n = n.replace(/\./g, '').replace(',', '');
                            allIronTotals.push(n);
                        }

                        //grabbing warehouse capacity
                        for (let i = 0; i < allVillages.length; i++) {

                            warehouseCapacity.push(allIronObjects[i].parentElement.nextElementSibling.innerHTML);
                            availableMerchants.push(allIronObjects[i].parentElement.nextElementSibling.nextElementSibling.innerText.match(/(\d*)\/(\d*)/)[1]);
                            totalMerchants.push(allIronObjects[i].parentElement.nextElementSibling.nextElementSibling.innerText.match(/(\d*)\/(\d*)/)[2]);
                            farmSpaceUsed.push(allIronObjects[i].parentElement.nextElementSibling.nextElementSibling.nextElementSibling.innerText.match(/(\d*)\/(\d*)/)[1]);
                            farmSpaceTotal.push(allIronObjects[i].parentElement.nextElementSibling.nextElementSibling.nextElementSibling.innerText.match(/(\d*)\/(\d*)/)[2]);
                            villagePoints.push(allWoodObjects[i].parentElement.previousElementSibling.innerText.replace(/\./g, '').replace(',', ''));
                        }
                    }

                    //making a useable Data object
                    for (let i = 0; i < allVillages.length; i++) {
                        villagesData.push({
                            "id": allVillages[i].dataset.id,
                            "points": villagePoints[i],
                            "url": allVillages[i].children[0].children[0].href,
                            "name": allVillages[i].innerText.trim(),
                            "wood": allWoodTotals[i],
                            "stone": allClayTotals[i],
                            "iron": allIronTotals[i],
                            "availableMerchants": availableMerchants[i],
                            "totalMerchants": totalMerchants[i],
                            "warehouseCapacity": warehouseCapacity[i],
                            "farmSpaceUsed": farmSpaceUsed[i],
                            "farmSpaceTotal": farmSpaceTotal[i]
                        });
                    }
                    villagesData.sort((a, b) => (parseInt(a.points) < parseInt(b.points)) ? 1 : -1);

                    // ... (original calculations for averages, shortages, excesses, etc.)
                    // ... this part remains unchanged ...
                    totalWood = 0;
                    totalStone = 0;
                    totalIron = 0;

                    for (let i in allWoodTotals) { totalWood += parseInt(allWoodTotals[i]); }
                    for (let i in allClayTotals) { totalStone += parseInt(allClayTotals[i]); }
                    for (let i in allIronTotals) { totalIron += parseInt(allIronTotals[i]); }
                    //add the incoming res to the total!
                    for (let o = 0; o < Object.keys(incomingRes).length; o++) {
                        totalWood += incomingRes[Object.keys(incomingRes)[o]].wood;
                        totalStone += incomingRes[Object.keys(incomingRes)[o]].stone;
                        totalIron += incomingRes[Object.keys(incomingRes)[o]].iron;
                    }
                    woodAverage = Math.floor(totalWood / warehouseCapacity.length);
                    stoneAverage = Math.floor(totalStone / warehouseCapacity.length);
                    ironAverage = Math.floor(totalIron / warehouseCapacity.length);


                    if (settings.isMinting == false) {
                        //calculate actual averages
                        actualWoodAverage = woodAverage;
                        actualStoneAverage = stoneAverage;
                        actualIronAverage = ironAverage;
                        consideredBuiltOut = 0;
                        actualTotalWood = totalWood;
                        actualTotalStone = totalStone;
                        actualTotalIron = totalIron;
                        actualWHCountNeedsBalancingWood = warehouseCapacity.length;
                        actualWHCountNeedsBalancingStone = warehouseCapacity.length;
                        actualWHCountNeedsBalancingIron = warehouseCapacity.length;
                        for (let i = 0; i < warehouseCapacity.length; i++) {
                            actualWoodAverage = Math.floor(actualTotalWood / actualWHCountNeedsBalancingWood);
                            actualStoneAverage = Math.floor(actualTotalStone / actualWHCountNeedsBalancingStone);
                            actualIronAverage = Math.floor(actualTotalIron / actualWHCountNeedsBalancingIron);
                            //check if warehouseCapacity[i] is smaller than average
                            if (warehouseCapacity[i] < actualWoodAverage) {
                                console.log("Warehouse in village " + i + " too small for average, reducing resources, and increasing for every other village")
                                actualTotalWood -= actualWoodAverage - warehouseCapacity[i] * settings.needsMorePercentage;
                                actualWHCountNeedsBalancingWood--;
                            }
                            //check if warehouseCapacity[i] is smaller than average
                            if (warehouseCapacity[i] < actualStoneAverage) {
                                console.log("Warehouse in village " + i + " too small for average, reducing resources, and increasing for every other village")
                                actualTotalStone -= actualStoneAverage - warehouseCapacity[i] * settings.needsMorePercentage;
                                actualWHCountNeedsBalancingStone--;
                            }
                            //check if warehouseCapacity[i] is smaller than average
                            if (warehouseCapacity[i] < actualIronAverage) {
                                console.log("Warehouse in village " + i + " too small for average, reducing resources, and increasing for every other village")
                                actualTotalIron -= actualIronAverage - warehouseCapacity[i] * settings.needsMorePercentage;
                                actualWHCountNeedsBalancingIron--;
                            }
                            console.log("Current averages: " + actualWoodAverage + "-" + actualIronAverage + "-" + actualStoneAverage);
                        }
                        if (actualWoodAverage >= 350000 || actualStoneAverage >= 350000 || actualIronAverage >= 350000) {
                            alert(`With your current settings, you end up having a lot of excess resources that can't be assigned. Consider increasing the 'highFarm' setting to a higher value, or increasing the lowPoints value so more villages are included to have priority. This is usually due to having a lot of villages completely built out, or having very high average resources, and not a lot of villages that need resources badly.\nIf you just want to balance evenly, set highFarm to 99999\n\nWith the current settings, you are trying to assign an average of ${numberWithCommas(actualWoodAverage)} wood, ${numberWithCommas(actualStoneAverage)} clay, and ${numberWithCommas(actualIronAverage)} iron per village that isn't considered small, or fully built (currently ${numberWithCommas(consideredBuiltOut)} are considered finished), to spread evenly. Clearly, that is not a good idea`);
                        }

                    }
                    else {
                        actualWoodAverage = woodAverage;
                        actualStoneAverage = stoneAverage;
                        actualIronAverage = ironAverage;
                    }
                    totalsAndAverages = `<div id='totals' class='sophHeader' border=0>
                    <table id='totalsAndAverages' width='100%'>
                    <tr class='sophRowA'>
                    <td>${langShinko[9]}: ${numberWithCommas(totalWood)}</td>
                    <td>${langShinko[10]}: ${numberWithCommas(totalStone)}</td>
                    <td>${langShinko[11]}: ${numberWithCommas(totalIron)}</td>
                    </tr>
                    <tr class='sophRowB'>
                    <td>${langShinko[12]}: ${numberWithCommas(woodAverage)}</td>
                    <td>${langShinko[13]}: ${numberWithCommas(stoneAverage)}</td>
                    <td>${langShinko[14]}: ${numberWithCommas(ironAverage)}</td>
                    </tr>
                    <tr class='sophRowA'>
                    <td>Actual woodaverage after correction: ${numberWithCommas(actualWoodAverage)}</td>
                    <td>Actual clayaverage after correction: ${numberWithCommas(actualStoneAverage)}</td>
                    <td>Actual ironaverage after correction: ${numberWithCommas(actualIronAverage)}</td>
                    </tr>
                    </table>`;

                    $(".content-border").eq(0).prepend(`
                <div id="progressbar" style="width: 100%;
                background-color: #36393f;"><div id="progress" style="width: 0%;
                height: 35px;
                background-color: #4CAF50;
                text-align: center;
                line-height: 32px;
                color: black;"></div>
                </div>`);
                    $("#mobileHeader").eq(0).prepend(`
                <div id="progressbar" style="width: 100%;
                background-color: #36393f;"><div id="progress" style="width: 0%;
                height: 35px;
                background-color: #4CAF50;
                text-align: center;
                line-height: 32px;
                color: black;"></div>
                </div>`);
                    //find excess/shortage
                    for (let v = 0; v < villagesData.length; v++) {
                        console.log("%c-----------------------------------------------------------------------------------------",'color: red;');
                        excessResources[v] = [];
                        shortageResources[v] = [];
                        villageID.push(villagesData[v].id);
                        if (typeof incomingRes[villagesData[v].id] == "undefined") {
                            //no incoming res to this village
                            incomingWood = 0;
                            incomingStone = 0;
                            incomingIron = 0;
                        }
                        else {
                            //found incoming res to this village
                            incomingWood = incomingRes[villagesData[v].id].wood;
                            incomingStone = incomingRes[villagesData[v].id].stone;
                            incomingIron = incomingRes[villagesData[v].id].iron;
                        }
                        console.log(`%cIncoming resources:
                    Wood: ${incomingWood}
                    Clay: ${incomingStone}
                    Iron: ${incomingIron}`,'color: teal;');
                        if (actualWoodAverage < villagesData[v].warehouseCapacity * settings.needsMorePercentage) {
                            //average lower than capacity and max perc, we can use the average
                            tempWood = parseInt(villagesData[v].wood) + incomingWood - actualWoodAverage;
                        }
                        else {
                            console.log("Average is higher than capacity, reduce");
                            tempWood = -Math.round((villagesData[v].warehouseCapacity * settings.needsMorePercentage) - incomingWood - parseInt(villagesData[v].wood));
                        }
                        if (actualStoneAverage < villagesData[v].warehouseCapacity * settings.needsMorePercentage) {
                            //average lower than capacity and max perc, we can use the average
                            tempStone = parseInt(villagesData[v].stone) + incomingStone - actualStoneAverage;
                        }
                        else {
                            console.log("Average is higher than capacity, reduce");
                            tempStone = -Math.round((villagesData[v].warehouseCapacity * settings.needsMorePercentage) - incomingStone - parseInt(villagesData[v].stone));
                        }
                        if (actualIronAverage < villagesData[v].warehouseCapacity * settings.needsMorePercentage) {
                            tempIron = parseInt(villagesData[v].iron) + incomingIron - actualIronAverage;
                        }
                        else {
                            console.log("Average is higher than capacity, reduce");
                            tempIron = -Math.round((villagesData[v].warehouseCapacity * settings.needsMorePercentage) - incomingIron - parseInt(villagesData[v].iron));
                        }
                        console.log(tempWood);
                        console.log(tempStone);
                        console.log(tempIron);
                        //check if village almost built out
                        if (villagesData[v].farmSpaceUsed > settings.highFarm || villagesData[v].points > settings.highPoints) {
                            console.log("Farm almost full (" + villagesData[v].farmSpaceUsed + "/" + villagesData[v].farmSpaceTotal + ") in " + villagesData[v].name + ", or village points are higher than the required setting: " + villagesData[v].points + "/" + settings.highPoints + ". Adjusting what we leave at home to be " + (100 * settings.builtOutPercentage) + "%");
                            //high farm, reduce resources needed
                            if (parseInt(villagesData[v].wood) + incomingWood > settings.builtOutPercentage * villagesData[v].warehouseCapacity) {
                                //have more than needed, adjust
                                tempWood = Math.round((parseInt(villagesData[v].wood) + incomingWood) - (settings.builtOutPercentage * villagesData[v].warehouseCapacity));
                            }
                            if (parseInt(villagesData[v].stone) + incomingStone > settings.builtOutPercentage * villagesData[v].warehouseCapacity) {
                                //have more than needed, adjust
                                tempStone = Math.round((parseInt(villagesData[v].stone) + incomingStone) - (settings.builtOutPercentage * villagesData[v].warehouseCapacity));
                            }
                            if (parseInt(villagesData[v].iron) + incomingIron > settings.builtOutPercentage * villagesData[v].warehouseCapacity) {
                                //have more than needed, adjust
                                tempIron = Math.round((parseInt(villagesData[v].iron) + incomingIron) - (settings.builtOutPercentage * villagesData[v].warehouseCapacity));
                            }
                        }

                        //check if village is small and needs more res
                        if (villagesData[v].points < settings.lowPoints) {
                            console.log(villagesData[v].name + " (" + villagesData[v].points + ")" + " needs help growing, setting required resources to " + settings.needsMorePercentage * 100 + "% of WH capacity");
                            tempWood = -Math.round((villagesData[v].warehouseCapacity * settings.needsMorePercentage) - parseInt(villagesData[v].wood) - incomingWood);
                            tempStone = -Math.round((villagesData[v].warehouseCapacity * settings.needsMorePercentage) - parseInt(villagesData[v].stone) - incomingStone);
                            tempIron = -Math.round((villagesData[v].warehouseCapacity * settings.needsMorePercentage) - parseInt(villagesData[v].iron) - incomingIron);
                        }

                        if (incomingWood + parseInt(villagesData[v].wood) > villagesData[v].warehouseCapacity) {
                            console.log("Too much wood incoming in " + villagesData[v].name);
                            tempWood = -(Math.round((villagesData[v].warehouseCapacity * settings.needsMorePercentage) - incomingWood - parseInt(villagesData[v].wood)));
                        }
                        if (incomingStone + parseInt(villagesData[v].stone) > villagesData[v].warehouseCapacity) {
                            console.log("Too much clay incoming in " + villagesData[v].name);
                            tempStone = -(Math.round((villagesData[v].warehouseCapacity * settings.needsMorePercentage) - incomingStone - parseInt(villagesData[v].stone)));
                        }
                        if (incomingIron + parseInt(villagesData[v].iron) > villagesData[v].warehouseCapacity) {
                            console.log("Too much iron incoming in " + villagesData[v].name);
                            tempIron = -(Math.round((villagesData[v].warehouseCapacity * settings.needsMorePercentage) - incomingIron - parseInt(villagesData[v].iron)));
                        }

                        //check if the excess is bigger than the available resources right now (incase of incoming res, this could be possible)
                        if (tempWood > 0 && tempWood > parseInt(villagesData[v].wood)) {
                            console.log("Excess is bigger than current available resources, setting it to current available");
                            tempWood = parseInt(villagesData[v].wood);
                        }
                        if (tempStone > 0 && tempStone > parseInt(villagesData[v].stone)) {
                            console.log("Excess is bigger than current available resources, setting it to current available");
                            tempStone = parseInt(villagesData[v].stone);
                        }
                        if (tempIron > 0 && tempIron > parseInt(villagesData[v].iron)) {
                            console.log("Excess is bigger than current available resources, setting it to current available");
                            tempIron = parseInt(villagesData[v].iron);
                        }
                        console.log("Village: " + villagesData[v].name + '\n' + "                    Max final capacity: " + villagesData[v].warehouseCapacity * settings.needsMorePercentage + '\n' + "                    Warehouse capacity: " + villagesData[v].warehouseCapacity + '\n' + "                    Wood: " + parseInt(villagesData[v].wood) + '\n' + "                    Clay: " + parseInt(villagesData[v].stone) + '\n' + "                    Iron: " + parseInt(villagesData[v].iron));
                        console.log("Woodadjustement: " + tempWood + ", clayadjustement: " + tempStone + ", ironadjustement: " + tempIron);


                        //check wood
                        if (tempWood > 0) {
                            //excess
                            excessResources[v].push({ "wood": Math.floor(tempWood / 1000) * 1000 });
                            shortageResources[v].push({ "wood": 0 });
                        }
                        else {
                            //shortage
                            shortageResources[v].push({ "wood": Math.floor(-tempWood / 1000) * 1000 });
                            excessResources[v].push({ "wood": 0 });
                        }
                        //check stone
                        if (tempStone > 0) {
                            //excess
                            excessResources[v].push({ "stone": Math.floor(tempStone / 1000) * 1000 });
                            shortageResources[v].push({ "stone": 0 });
                        }
                        else {
                            //shortage
                            shortageResources[v].push({ "stone": Math.floor(-tempStone / 1000) * 1000 });
                            excessResources[v].push({ "stone": 0 });
                        }
                        //check iron
                        if (tempIron > 0) {
                            //excess
                            excessResources[v].push({ "iron": Math.floor(tempIron / 1000) * 1000 });
                            shortageResources[v].push({ "iron": 0 });
                        }
                        else {
                            //shortage
                            shortageResources[v].push({ "iron": Math.floor(-tempIron / 1000) * 1000 });
                            excessResources[v].push({ "iron": 0 });
                        }
                    }
                    // ... (rest of the original complex logic for assigning merchants and calculating transfers)
                    // ... this remains unchanged ...
                    for (let p = 0; p < excessResources.length; p++) {
                        tempAllExcessCombined = parseInt(Math.floor(excessResources[p][0].wood / 1000) * 1000) + parseInt(Math.floor(excessResources[p][1].stone / 1000) * 1000) + parseInt(Math.floor(excessResources[p][2].iron / 1000) * 1000);

                        if (tempAllExcessCombined > 0) {
                            //figure out % of merchants for each
                            tempMaxMerchantsNeeded = Math.floor(tempAllExcessCombined / 1000);
                            if (tempMaxMerchantsNeeded < villagesData[p].availableMerchants) {
                                //we have enough merchants to move all the excess res
                                merchantOrders.push({ "villageID": villagesData[p].id, "x": villagesData[p].name.match(/(\d+)\|(\d+)/)[1], "y": villagesData[p].name.match(/(\d+)\|(\d+)/)[2], "wood": Math.floor(excessResources[p][0].wood / 1000), "stone": Math.floor(excessResources[p][1].stone / 1000), "iron": Math.floor(excessResources[p][2].iron / 1000) });
                            }
                            else {
                                //not enough merchants, assign percentual
                                tempPercWood = excessResources[p][0].wood / tempAllExcessCombined;
                                tempPercStone = excessResources[p][1].stone / tempAllExcessCombined;
                                tempPercIron = excessResources[p][2].iron / tempAllExcessCombined;
                                merchantOrders.push({ "villageID": villagesData[p].id, "x": villagesData[p].name.match(/(\d+)\|(\d+)/)[1], "y": villagesData[p].name.match(/(\d+)\|(\d+)/)[2], "wood": Math.floor(tempPercWood * villagesData[p].availableMerchants), "stone": Math.floor(tempPercStone * villagesData[p].availableMerchants), "iron": Math.floor(tempPercIron * villagesData[p].availableMerchants) });
                            }
                        }
                    }

                    //assign excess to shortage
                    for (let q = shortageResources.length - 1; q >= 0; q--) {
                        $("#progress").css("width", `${(shortageResources.length - q) / shortageResources.length * 100}%`);
                        //check distances to all villages
                        for (let d = 0; d < merchantOrders.length; d++) {
                            merchantOrders[d].distance = checkDistance(merchantOrders[d].x, merchantOrders[d].y, villagesData[q].name.match(/(\d+)\|(\d+)/)[1], villagesData[q].name.match(/(\d+)\|(\d+)/)[2]);
                        }
                        merchantOrders.sort(function (left, right) { return left.distance - right.distance; });
                        if (shortageResources[q][0].wood <= 0) {
                            //no shortage
                        }
                        else {
                            //check if we need wood
                            while (shortageResources[q][0].wood > 0) {
                                var totalWoodToTrade = 0;

                                for (let m = 0; m < merchantOrders.length; m++) {
                                    totalWoodToTrade += merchantOrders[m].wood;
                                    if (merchantOrders[m].wood > 0) {
                                        //merchants assigned to wood, use them to fill up the request
                                        //check if more merchants than needed
                                        if (shortageResources[q][0].wood <= merchantOrders[m].wood * 1000) {
                                            //more  than needed, assign enough
                                            links.push({ "source": merchantOrders[m].villageID, "target": villageID[q], "wood": shortageResources[q][0].wood });
                                            merchantOrders[m].wood -= shortageResources[q][0].wood / 1000;
                                            shortageResources[q][0].wood = 0;
                                        }
                                        if (shortageResources[q][0].wood > merchantOrders[m].wood * 1000) {
                                            //less merchants than needed
                                            links.push({ "source": merchantOrders[m].villageID, "target": villageID[q], "wood": merchantOrders[m].wood * 1000 });
                                            shortageResources[q][0].wood -= merchantOrders[m].wood * 1000;
                                            merchantOrders[m].wood = 0;
                                        }
                                    }
                                    if (shortageResources[q][0].wood <= 0) { break; }
                                    if (m == merchantOrders.length - 1 && shortageResources[q][0].wood > 0) {
                                        console.log("Done with this cycle");
                                        totalWoodToTrade = 0;
                                        break;
                                    }
                                }
                                if (totalWoodToTrade == 0) {

                                    q = 0;
                                    //alert("No wood to trade left, breaking");
                                    break;
                                }
                            }
                        }
                    }

                    //assign excess to shortage
                    for (let q = shortageResources.length - 1; q >= 0; q--) {
                        $("#progress").css("width", `${(shortageResources.length - q) / shortageResources.length * 100}%`);
                        for (var d = 0; d < merchantOrders.length; d++) {
                            merchantOrders[d].distance = checkDistance(merchantOrders[d].x, merchantOrders[d].y, villagesData[q].name.match(/(\d+)\|(\d+)/)[1], villagesData[q].name.match(/(\d+)\|(\d+)/)[2]);
                        }
                        merchantOrders.sort(function (left, right) { return left.distance - right.distance; });
                        if (shortageResources[q][1].stone <= 0) {
                            //no shortage
                        }
                        else {
                            //check if we need stone
                            while (shortageResources[q][1].stone > 0) {
                                console.log(q);
                                var totalstoneToTrade = 0;
                                for (var m = 0; m < merchantOrders.length; m++) {
                                    totalstoneToTrade += merchantOrders[m].stone;
                                    if (merchantOrders[m].stone > 0) {
                                        //merchants assigned to stone, use them to fill up the request
                                        //check if more merchants than needed
                                        if (shortageResources[q][1].stone <= merchantOrders[m].stone * 1000) {
                                            //more  than needed, assign enough
                                            links.push({ "source": merchantOrders[m].villageID, "target": villageID[q], "stone": shortageResources[q][1].stone });
                                            merchantOrders[m].stone -= shortageResources[q][1].stone / 1000;
                                            shortageResources[q][1].stone = 0;
                                        }
                                        if (shortageResources[q][1].stone > merchantOrders[m].stone * 1000) {
                                            //less merchants than needed
                                            links.push({ "source": merchantOrders[m].villageID, "target": villageID[q], "stone": merchantOrders[m].stone * 1000 });
                                            shortageResources[q][1].stone -= merchantOrders[m].stone * 1000;
                                            merchantOrders[m].stone = 0;
                                        }
                                    }
                                    if (shortageResources[q][1].stone <= 0) { break; }
                                    if (m == merchantOrders.length - 1 && shortageResources[q][1].stone > 0) {
                                        console.log("Done with this cycle");
                                        totalstoneToTrade = 0;
                                        break;
                                    }
                                }
                                if (totalstoneToTrade == 0) {

                                    q = 0;
                                    //alert("No stone to trade left, breaking");
                                    break;
                                }
                            }
                        }
                    }

                    //assign excess to shortage
                    for (let q = shortageResources.length - 1; q >= 0; q--) {
                        $("#progress").css("width", `${(shortageResources.length - q) / shortageResources.length * 100}%`);
                        for (let d = 0; d < merchantOrders.length; d++) {
                            merchantOrders[d].distance = checkDistance(merchantOrders[d].x, merchantOrders[d].y, villagesData[q].name.match(/(\d+)\|(\d+)/)[1], villagesData[q].name.match(/(\d+)\|(\d+)/)[2]);
                        }
                        merchantOrders.sort(function (left, right) { return left.distance - right.distance; });
                        if (shortageResources[q][2].iron <= 0) {
                            //no shortage
                        }
                        else {
                            //check if we need iron
                            while (shortageResources[q][2].iron > 0) {
                                var totalironToTrade = 0;
                                for (let m = 0; m < merchantOrders.length; m++) {
                                    totalironToTrade += merchantOrders[m].iron;
                                    if (merchantOrders[m].iron > 0) {
                                        //merchants assigned to iron, use them to fill up the request
                                        //check if more merchants than needed
                                        if (shortageResources[q][2].iron <= merchantOrders[m].iron * 1000) {
                                            //more  than needed, assign enough
                                            links.push({ "source": merchantOrders[m].villageID, "target": villageID[q], "iron": shortageResources[q][2].iron });
                                            merchantOrders[m].iron -= shortageResources[q][2].iron / 1000;
                                            shortageResources[q][2].iron = 0;
                                        }
                                        if (shortageResources[q][2].iron > merchantOrders[m].iron * 1000) {
                                            //less merchants than needed
                                            links.push({ "source": merchantOrders[m].villageID, "target": villageID[q], "iron": merchantOrders[m].iron * 1000 });
                                            shortageResources[q][2].iron -= merchantOrders[m].iron * 1000;
                                            merchantOrders[m].iron = 0;
                                        }
                                    }
                                    if (shortageResources[q][2].iron <= 0) { break; }
                                    if (m == merchantOrders.length - 1 && shortageResources[q][2].iron > 0) {
                                        console.log("Done with this cycle");
                                        totalironToTrade = 0;
                                        break;
                                    }
                                }
                                if (totalironToTrade == 0) {

                                    q = 0;
                                    //alert("No iron to trade left, breaking");
                                    break;
                                }
                            }
                        }
                    }

                    $("#progress").remove();

                    // *** MODIFICATION START: Updated HTML with "Send All" button ***
                    htmlCode = `<div id="restart">${totalsAndAverages}</div>
                <div id="sendResources" class="flex-container sophHeader" style="position: relative">
                    <button class="sophRowA collapsible" style="width: 250px;min-width: 230px;">Open settings menu</button>
                    <div class="content submenu" style="width: 500px;height:500px;z-index:99999">
                        <form id="settings">
                            <table style="border-spacing: 2px;">
                            <tr>
                            <td style="padding: 6px;">
                            <label for="isMinting">Ignore settings</label></td><td style="padding: 6px;"><input type="checkbox" name="isMinting"></td></tr>
                            <tr>
                            <td style="padding: 6px;">
                            <label for="lowPoints">Prioritise</label></td><td style="padding: 6px;"><input type="range" min="0" max="13000" step="10" value="${settings.lowPoints}" class="slider" name="lowPoints" oninput="sliderChange('lowPoints',this.value)">
                            < <output id="lowPoints"></output> points</td></tr>
                            <tr>
                            <td style="padding: 6px;">
                            <label for="highPoints">Finished villages</label></td><td style="padding: 6px;"><input type="range" min="0" max="13000" step="10" value="${settings.highPoints}" class="slider" name="highPoints" oninput="sliderChange('highPoints',this.value)">
                            > <output id="highPoints"></output> points</td></tr>
                            <tr>
                            <td style="padding: 6px;">
                            <label for="highFarm">High farm</label></td><td style="padding: 6px;"><input type="range" min="0" max="33000" step="10" value="${settings.highFarm}" class="slider" name="highFarm" oninput="sliderChange('highFarm',this.value)">
                            <output id="highFarm"></output> pop</td></tr>
                            <tr>
                            <td style="padding: 6px;">
                            <label for="builtOutPercentage">WH capacity finished villages: </label></td><td style="padding: 6px;"><input type="range" min="0" max="1" step="0.01" value="${settings.builtOutPercentage}" class="slider" name="highFarm" oninput="sliderChange('builtOutPercentage',this.value)">
                            <output id="builtOutPercentage"></output></td></tr>
                            <tr>
                            <td style="padding: 6px;">
                            <label for="needsMorePercentage">WH capacity priority village: </label></td><td style="padding: 6px;"><input type="range" min="0" max="1" step="0.01" value="${settings.needsMorePercentage}" class="slider" name="needsMorePercentage" oninput="sliderChange('needsMorePercentage',this.value)">
                            <output id="needsMorePercentage"></output></td></tr>
                            <tr>
                            <td style="padding: 6px;">
                            <input type="button" class="btn evt-confirm-btn btn-confirm-yes" value="Save" onclick="saveSettings();"/></td></tr>
                            <td colspan="2" style="padding: 6px;">
                            <p style="padding:5px"><font size="1">Script by Sophie "Shinko to Kuma"</font></p>
                            </td>
                            </table>
                        </form>
                    </div>
                </div>
                <table id="tableSend" width="100%" class="sophHeader">
                <tbody id="appendHere">
                    <tr>
                        <td class="sophHeader" colspan="7" width="auto" style="text-align:center" >${langShinko[0]}</td>
                    </tr>
                    <tr>
                        <td class="sophHeader" width="25%" style="text-align:center">${langShinko[1]}</td>
                        <td class="sophHeader" width="25%" style="text-align:center">${langShinko[2]}</td>
                        <td class="sophHeader" width="5%" style="text-align:center">${langShinko[3]}</td>
                        <td class="sophHeader" width="10%" style="text-align:center">${langShinko[4]}</td>
                        <td class="sophHeader" width="10%" style="text-align:center">${langShinko[5]}</td>
                        <td class="sophHeader" width="10%" style="text-align:center">${langShinko[6]}</td>
                        <td class="sophHeader" width="15%" style="text-align:center;">
                            <input type="button" id="sendAllBtn" class="btn btnSophie" value="${langShinko[18]}" onclick="sendAllAutomatically(cleanLinks)">
                            <br><font size="1">${langShinko[17]}</font>
                        </td>
                    </tr>
                </tbody>
            </table>`;
                    // *** MODIFICATION END ***

                    $("#content_value").eq(0).prepend(htmlCode);
                    if (is_mobile == true) {
                        $("#mobile_header").eq(0).prepend(htmlCode);
                    }
                    $("input[name='isMinting']").attr("checked", settings.isMinting);
                    $("#lowPoints").val(settings.lowPoints);
                    $("#highPoints").val(settings.highPoints);
                    $("#highFarm").val(settings.highFarm);
                    $("#builtOutPercentage").val(settings.builtOutPercentage);
                    $("#needsMorePercentage").val(settings.needsMorePercentage);
                    makeThingsCollapsible();
                    createList();
                })
                .fail(function () { console.log("error"); })
                .always(function () { console.log("finished");

                                   sendAllAutomatically(cleanLinks)
                                    });
        });

    function createList() {
        console.log("Reached list creation");
        for (let i = 0; i < links.length; i++) {
            if (links[i].wood == undefined) links[i].wood = 0;
            if (links[i].stone == undefined) links[i].stone = 0;
            if (links[i].iron == undefined) links[i].iron = 0;
        }
        for (let i = 0; i < links.length; i++) {
            for (let j = 0; j < links.length; j++) {
                if (links[i].source == links[j].source && links[i].target == links[j].target && i != j) {
                    links[i].wood += parseInt(links[j].wood);
                    links[j].wood = 0;
                    links[i].stone += parseInt(links[j].stone);
                    links[j].stone = 0;
                    links[i].iron += parseInt(links[j].iron);
                    links[j].iron = 0;
                }
            }
        }
        for (let i = 0; i < links.length; i++) {
            if (links[i].wood + links[i].stone + links[i].iron == 0) {
                delete links[i];
            }
        }
        for (let i = 0; i < Object.keys(links).length; i++) {
            cleanLinks.push(links[Object.keys(links)[i]]);
        }
        cleanLinks = addDistanceToArray(cleanLinks);
        cleanLinks.sort(function (left, right) { return left.distance - right.distance; });

        // *** MODIFICATION START: Build table rows without individual buttons ***
        let listHTML = ``;
        for (let i = 0; i < cleanLinks.length; i++) {
            let tempRow = (i % 2 == 0) ? ` id='row_${i}' class='sophRowB'` : ` id='row_${i}' class='sophRowA'`;
            let sourceName, sourceURL, targetName, targetURL, targetWood, targetStone, targetIron, targetCapacity;

            for (let property in villagesData) {
                if (villagesData[property].id == cleanLinks[i].source) {
                    sourceName = villagesData[property].name;
                    sourceURL = villagesData[property].url;
                }
                if (villagesData[property].id == cleanLinks[i].target) {
                    targetName = villagesData[property].name;
                    targetURL = villagesData[property].url;
                    targetWood = villagesData[property].wood;
                    targetStone = villagesData[property].stone;
                    targetIron = villagesData[property].iron;
                    targetCapacity = villagesData[property].warehouseCapacity;
                }
            }

            listHTML += `
            <tr ${tempRow} height="40">
                <td><a href="${sourceURL}" class="sophLink">${sourceName}</a></td>
                <td><a href="${targetURL}" class="sophLink" data-toggle="tooltip" title="Wood: ${targetWood}&#10;Clay: ${targetStone}&#10;Iron: ${targetIron}&#10;Capacity: ${targetCapacity}">${targetName}</a></td>
                <td style="text-align:center">${cleanLinks[i].distance}</td>
                <td style="text-align:center">${cleanLinks[i].wood}<span class="icon header wood"></span></td>
                <td style="text-align:center">${cleanLinks[i].stone}<span class="icon header stone"></span></td>
                <td style="text-align:center">${cleanLinks[i].iron}<span class="icon header iron"></span></td>
                <td style="text-align:center" id="status_${i}">Pending</td>
            </tr>`;
        }
        $("#appendHere").eq(0).append(listHTML);
        // *** MODIFICATION END ***

        for (let i = 0; i < shortageResources.length; i++) {
            if (parseInt(shortageResources[i][0].wood) + parseInt(shortageResources[i][1].stone) + parseInt(shortageResources[i][2].iron) != 0) {
                stillShortage.push([villagesData[i].name, shortageResources[i]]);
            }
        }
        for (let i = 0; i < excessResources.length; i++) {
            if (parseInt(excessResources[i][0].wood) + parseInt(excessResources[i][1].stone) + parseInt(excessResources[i][2].iron) != 0) {
                stillExcess.push([villagesData[i].name, excessResources[i]]);
            }
        }
        $("#totals").eq(0).append(`<div id='aftermath'><center>
        <button type="button" class="btn btnSophie" name="showStats" style="padding: 10px;width: 300px" onclick="showStats()">Show excess/shortage</button>
        <button type="button" class="btn btnSophie" name="showEndResult" style="padding: 10px;width: 300px" onclick="resAfterBalance()">Show result of balance</button>
        </center></div>`);
        console.log("Finished");
    }
}

const premium=document.querySelector('#quickbar_outer');
        if(premium){
               if ((window.location.href.includes("screen=overview_villages&intro")||window.location.href.includes("screen=overview_villages"))) {

           displayEverything();
               }
        }


// ... (rest of the helper functions from original script like checkDistance, numberWithCommas, etc.)
function checkDistance(x1, y1, x2, y2) {
    var a = x1 - x2;
    var b = y1 - y2;
    var distance = Math.round(Math.hypot(a, b));
    return distance;
}

function addDistanceToArray(array) {
    for (let i = 0; i < array.length; i++) {
        for (let property in villagesData) {
            if (villagesData[property].id == array[i].source) {
                sourceName = villagesData[property].name;
                sourceURL = villagesData[property].url;
            }
        }
        for (let property in villagesData) {
            if (villagesData[property].id == array[i].target) {
                targetName = villagesData[property].name;
                targetURL = villagesData[property].url;
            }
        }
        array[i].distance = checkDistance(sourceName.match(/(\d+)\|(\d+)/)[1], sourceName.match(/(\d+)\|(\d+)/)[2], targetName.match(/(\d+)\|(\d+)/)[1], targetName.match(/(\d+)\|(\d+)/)[2]);
    }
    return array;
}
function numberWithCommas(x) {
    x = x.toString();
    var pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(x))
        x = x.replace(pattern, "$1.$2");
    return x;
}

function showStats() {
    htmlStats = "<div class='sophRowA' style='width:800px' ><center><h1>Shortages:</h1><table class='sophHeader'><tr class='sophHeader'><td>Village name</td><td>Res</td></tr>";

    for (let i = 0; i < stillShortage.length; i++) {
        if (i % 2 == 0) {
            tempRow = " id='" + i + "' class='sophRowB'";
        }
        else {
            tempRow = " id='" + i + "' class='sophRowA'";
        }

        htmlStats += `
        <tr ${tempRow} height="40">
            <td>${stillShortage[i][0]}</td>
            <td>${stillShortage[i][1][0].wood} , ${stillShortage[i][1][1].stone} , ${stillShortage[i][1][2].iron}</td>
        </tr>`;
    }

    htmlStats += "</table><h1>Excesses:</h1><table class='sophHeader'><tr class='sophHeader'><td>Village name</td><td>Res</td></tr>";

    for (let i = 0; i < stillExcess.length; i++) {
        if (i % 2 == 0) {
            tempRow = " id='" + i + "' class='sophRowB'";
        }
        else {
            tempRow = " id='" + i + "' class='sophRowA'";
        }

        htmlStats += `
        <tr ${tempRow} height="40">
            <td>${stillExcess[i][0]}</td>
            <td>${stillExcess[i][1][0].wood} , ${stillExcess[i][1][1].stone} , ${stillExcess[i][1][2].iron}</td>
        </tr>`;
    }
    htmlStats += "</table></center></div>";

    Dialog.show("content", htmlStats);
}
function makeThingsCollapsible() {
    var coll = $(".collapsible");
    for (var i = 0; i < coll.length; i++) {
        coll[i].addEventListener("click", function () {
            this.classList.toggle("active");
            var content = this.nextElementSibling;
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    }
}

function saveSettings() {
    tempArray = $("#settings").serializeArray();
    if ($("input[name='isMinting']")[0].checked == true) {
        settings.isMinting = true;
        settings.lowPoints = parseInt(tempArray[1].value);
        settings.highPoints = parseInt(tempArray[2].value);
        settings.highFarm = parseInt(tempArray[3].value);
        settings.builtOutPercentage = parseFloat(tempArray[4].value);
        settings.needsMorePercentage = parseFloat(tempArray[5].value);
    }
    else {
        settings.isMinting = false;
        settings.lowPoints = parseInt(tempArray[0].value);
        settings.highPoints = parseInt(tempArray[1].value);
        settings.highFarm = parseInt(tempArray[2].value);
        settings.builtOutPercentage = parseFloat(tempArray[3].value);
        settings.needsMorePercentage = parseFloat(tempArray[4].value);
    }
    localStorage.setItem("settingsWHBalancerSophie", JSON.stringify(settings));
    $(".flex-container").remove();
    $("div[id*='restart']").remove();
    $("div[id*='sendResources']").remove();
    init();
    displayEverything();
}

function sliderChange(name, val) {
    document.getElementById(name).innerHTML = val;
}
function resAfterBalance() {
    resBalancedHTML = `<div class='sophRowA' style='width:800px' ><table style='width:100%'><tr class="sophHeader"><td>Village</td><td>Points</td><td>Merchants left</td><td colspan="3">Resources</td><td>WH capacity</td></tr>`;
    for (var i = 0; i < villagesData.length; i++) {
        thisMerchantLeft = villagesData[i].availableMerchants;
        if (incomingRes[villagesData[i].id] != undefined) {
            console.log("adding res underway to target");
            thisVillageTotalWood = incomingRes[villagesData[i].id].wood + parseInt(villagesData[i].wood);
            thisVillageTotalStone = incomingRes[villagesData[i].id].stone + parseInt(villagesData[i].stone);
            thisVillageTotalIron = incomingRes[villagesData[i].id].iron + parseInt(villagesData[i].iron);
        }
        else {
            thisVillageTotalWood = parseInt(villagesData[i].wood);
            thisVillageTotalStone = parseInt(villagesData[i].stone);
            thisVillageTotalIron = parseInt(villagesData[i].iron);
        }
        for (var j = 0; j < cleanLinks.length; j++) {
            if (cleanLinks[j].target == villagesData[i].id) {
                console.log('adding rows to be received to the res at the target');
                thisVillageTotalWood += cleanLinks[j].wood;
                thisVillageTotalStone += cleanLinks[j].stone;
                thisVillageTotalIron += cleanLinks[j].iron;
            }
            if (cleanLinks[j].source == villagesData[i].id) {
                console.log('addings rows to be sent to the res at the target');
                thisVillageTotalWood -= cleanLinks[j].wood;
                thisVillageTotalStone -= cleanLinks[j].stone;
                thisVillageTotalIron -= cleanLinks[j].iron;
                thisMerchantLeft -= (cleanLinks[j].wood + cleanLinks[j].stone + cleanLinks[j].iron) / 1000;
            }
        }

        if (i % 2 == 0) {
            tempRow = "class='sophRowB'";
        }
        else {
            tempRow = "class='sophRowA'";
        }

        resBalancedHTML += `
        <tr ${tempRow}>
            <td>${villagesData[i].name}</td>
            <td>${villagesData[i].points}</td>
            <td style="text-align:right;padding-right:2em">
                ${thisMerchantLeft + "/" + villagesData[i].totalMerchants}
            </td>
            <td>
                <span class="res wood" style="padding-left:1em">&nbsp;</span>${numberWithCommas(thisVillageTotalWood)}
            </td>
            <td>
                <span class="res stone" style="padding-left:1em">&nbsp;</span>${numberWithCommas(thisVillageTotalStone)}
            </td>
            <td>
                <span class="res iron" style="padding-left:1em">&nbsp;</span>${numberWithCommas(thisVillageTotalIron)}
            </td>
            <td style="text-align:right">${numberWithCommas(villagesData[i].warehouseCapacity)}</td>
        </tr>`;
    }
    resBalancedHTML += `</table></div>`;
    Dialog.show('content', resBalancedHTML);
}
