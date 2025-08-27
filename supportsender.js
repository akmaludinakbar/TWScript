// ==UserScript==
// @name         Enhanced Support Sender with Defense Planner
// @namespace    http://tampermonkey.net/
// @version      3.2
// @description  Combines the Support Sender script by Madalin with a defense planner to parse incomings and send support automatically.
// @author       Costache Madalin (Original) & Gemini (Enhancements)
// @match        *://*.tribalwars.net/game.php?*screen=place&mode=call*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tribalwars.net
// @grant        none
// @require      https://code.jquery.com/ui/1.12.1/jquery-ui.min.js
// ==/UserScript==

(function() {
    'use strict';

    let url = window.location.href;
    var countApiKey = "support_sender";
    var countNameSpace = "madalinoTribalWarsScripts";
    var heavyCav = 6;

    if (!url.includes("screen=place&mode=call")) {
        alert("This script must be run from Rally point-> Mass support");
        window.location.href = game_data.link_base_pure + "place&mode=call";
    }

    var units = Array.from(game_data.units.slice()).filter(value => value !== "snob" && value !== "militia" && value !== "knight");
    var troupesPop = { spear: 1, sword: 1, axe: 1, archer: 1, spy: 0, light: 4, marcher: 5, heavy: 6, ram: 5, catapult: 8, knight: 10, snob: 100 };
    troupesPop.heavy = heavyCav;

    var defaultTheme = '[["theme1",["#E0E0E0","#000000","#C5979D","#2B193D","#2C365E","#484D6D","#4B8F8C","62"]],["currentTheme","theme1"],["theme2",["#E0E0E0","#000000","#F76F8E","#113537","#37505C","#445552","#294D4A","62"]],["theme3",["#E0E0E0","#000000","#ACFCD9","#190933","#665687","#7C77B9","#623B5A","62"]],["theme4",["#E0E0E0","#000000","#181F1C","#60712F","#274029","#315C2B","#214F4B","62"]],["theme5",["#E0E0E0","#000000","#9AD1D4","#007EA7","#003249","#1F5673","#1C448E","62"]],["theme6",["#E0E0E0","#000000","#EA8C55","#81171B","#540804","#710627","#9E1946","62"]],["theme7",["#E0E0E0","#000000","#754043","#37423D","#171614","#3A2618","#523A34","62"]],["theme8",["#E0E0E0","#000000","#9E0031","#8E0045","#44001A","#600047","#770058","62"]],["theme9",["#E0E0E0","#000000","#C1BDB3","#5F5B6B","#323031","#3D3B3C","#575366","62"]],["theme10",["#E0E0E0","#000000","#E6BCCD","#29274C","#012A36","#14453D","#7E52A0","62"]]]';
    var localStorageThemeName = "supportSenderTheme";

    var textColor, backgroundInput, borderColor, backgroundContainer, backgroundHeader, backgroundMainTable, backgroundInnerTable, widthInterface;
    var backgroundAlternateTableEven, backgroundAlternateTableOdd;


    let defensePlan = [];
    const defensePlanStorageKey = `${game_data.world}_defensePlanData`;

    function httpGet(theUrl) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", theUrl, false);
        xmlHttp.send(null);
        return xmlHttp.responseText;
    }

    function addGlobalStyles() {
        const css = `
            .scriptContainer { width: 62%; background-color: ${backgroundContainer}; border: 2px solid ${borderColor}; z-index: 99999; text-align:center; padding: 5px; box-sizing: border-box; }
            .scriptHeader { width: 100%; height: 35px; background-color: ${backgroundHeader}; text-align: center; position: relative; }
            .scriptHeader h2 { margin: 0; padding-top: 5px; color: ${textColor}; }
            .scriptFooter { width: 100%; height: 25px; background-color: ${backgroundHeader}; text-align: center; }
            .scriptFooter h5 { margin: 0; padding-top: 2px; color: ${textColor}; }
            .scriptTable { border: 1px solid ${borderColor}; width: 100%; background-color: ${backgroundMainTable}; border-collapse: collapse; }
            .scriptTable td, .scriptTable th { color: ${textColor}; text-align: center; padding: 3px; border: 1px solid ${borderColor}; }
            .scriptTable th { background-color: ${backgroundHeader}; }
            .scriptInput { background-color: ${backgroundInput}; color: ${textColor}; text-align: center; max-width: 80%; border: 1px solid ${borderColor}; }
            #packets_total { color: red !important; background-color: #FDF3B7 !important; }
            #div_body { background-color: ${backgroundContainer}; max-height: 75vh; overflow-y: auto; padding: 10px; }
            #defense_plan_table th { background-color: ${backgroundHeader} !important; color: blue !important; padding: 5px !important; }
            #defense_plan_table.vis tbody tr { background-color: ${backgroundAlternateTableOdd} !important; color: blue !important; }
            #defense_plan_table.vis tbody tr:nth-child(even) { background-color: ${backgroundAlternateTableEven} !important; }
            #defense_plan_table.vis tbody tr.sent-row { background-color: #3a533a !important; }
            #defense_plan_table.vis tbody tr td { padding: 5px !important; vertical-align: middle; color: blue !important; }
            .send-support-btn.btn-disabled { filter: grayscale(80%); cursor: not-allowed; opacity: 0.7; }
        `;
        $('<style>').prop('type', 'text/css').html(css).appendTo('head');
    }

    async function main() {
        initializationTheme();
        addGlobalStyles();
        createMainInterface();
        changeTheme();
        addEvents();
        hitCountApi();
        loadDefensePlan();
        countTotalTroops();
    }

    function getColorDarker(hexInput, percent) {
        let hex = hexInput.replace(/^\s*#|\s*$/g, "");
        if (hex.length === 3) hex = hex.replace(/(.)/g, "$1$1");
        let r = parseInt(hex.substr(0, 2), 16), g = parseInt(hex.substr(2, 2), 16), b = parseInt(hex.substr(4, 2), 16);
        const calculatedPercent = (100 + percent) / 100;
        r = Math.round(Math.min(255, Math.max(0, r * calculatedPercent)));
        g = Math.round(Math.min(255, Math.max(0, g * calculatedPercent)));
        b = Math.round(Math.min(255, Math.max(0, b * calculatedPercent)));
        return `#${("00"+r.toString(16)).slice(-2).toUpperCase()}${("00"+g.toString(16)).slice(-2).toUpperCase()}${("00"+b.toString(16)).slice(-2).toUpperCase()}`;
    }

    function createMainInterface() {
        let rowsSpawnButtons = game_data.units.includes("archer") ? 7 : 6;
        let rowsSpawnDatetimes = game_data.units.includes("archer") ? 4 : 3;
        let html = `
    <div id="div_container" class="scriptContainer">
        <div class="scriptHeader">
            <h2>Enhanced Support Sender</h2>
            <div style="position:absolute;top:5px;right: 10px;"><a href="#" onclick="$('#div_container').remove()"><img src="https://img.icons8.com/emoji/24/000000/cross-mark-button-emoji.png"/></a></div>
            <div style="position:absolute;top:4px;right: 35px;" id="div_minimize"><a href="#"><img src="https://img.icons8.com/plasticine/28/000000/minimize-window.png"/></a></div>
            <div style="position:absolute;top:5px;right: 60px;" id="div_theme"><a href="#" onclick="$('#theme_settings').toggle()"><img src="https://img.icons8.com/material-sharp/24/fa314a/change-theme.png"/></a></div>
        </div>
        <div id="theme_settings"></div>
        <div id="div_body">
            <table id="table_upload" class="scriptTable">
                <tr><td>troops</td>`;
        units.forEach(unit => { if (!["knight", "snob", "militia", "axe", "light", "ram", "catapult", "marcher"].includes(unit)) { html += `<td class="fm_unit"><img src="${game_data.image_base}unit/unit_${unit}.png">${unit}</td>`; } });
        html += `<td>pop</td></tr><tr id="totalTroops"><td>total</td>`;
        units.forEach(unit => { if (!["knight", "snob", "militia", "axe", "light", "ram", "catapult", "marcher"].includes(unit)) { html += `<td><input style="color=red; !important ;color: red;" id="${unit}total" value="0" type="text" class="totalTroops scriptInput" disabled><font color="${textColor}" class="hideMobile">k</font></td>`; } });
        html += `<td><input id="packets_total" value="0" type="text" class="scriptInput" disabled><font color="${textColor}" class="hideMobile">k</font></td></tr><tr id="sendTroops"><td>send</td>`;
        units.forEach(unit => { if (!["knight", "snob", "militia", "axe", "light", "ram", "catapult", "marcher"].includes(unit)) { html += `<td align="center"><input id="${unit}total" value="0" type="number" class="scriptInput sendTroops"><font color="${textColor}" class="hideMobile">k</font></td>`; } });
        html += `<td align="center"><input id="packets_send" value="0" type="number" class="scriptInput"><font color="${textColor}" class="hideMobile">k</font></td></tr><tr id="reserveTroops"><td>reserve</td>`;
        units.forEach(unit => { if (!["knight", "snob", "militia", "axe", "light", "ram", "catapult", "marcher"].includes(unit)) { html += `<td align="center"><input id="${unit}Reserve" value="0" type="number" class="scriptInput reserveTroops"><font color="${textColor}" class="hideMobile">k</font></td>`; } });
        html += `<td align="center"><input id="packets_reserve" value="0" type="text" class="scriptInput" disabled><font color="${textColor}" class="hideMobile">k</font></td></tr>`;
        html += `
                <tr>
                    <td colspan="1"><center><font color="${textColor}"> sigil:</font><input type="number" id="flag_boost" class="scriptInput" min="0" max="100" placeholder="0" value="0" style="text-align: center"></center></td>
                    <td colspan="2"><center><input type="checkbox" id="checkbox_window" value="land_specific"><font color="${textColor}"> packets land between:</font></center></td>
                    <td colspan="${rowsSpawnDatetimes}"><center style="margin:5px"><font color="${textColor}">start:</font><input type="datetime-local" id="start_window" style="text-align:center;" class="scriptInput"></center><center style="margin:5px"><font color="${textColor}">end:</font><input type="datetime-local" id="stop_window" style="text-align:center;" class="scriptInput"></center></td>
                </tr>
                <tr>
                    <td colspan='${rowsSpawnButtons}'><button type="button" class="btn evt-confirm-btn btn-confirm-yes" id="calculateBtn">Calculate</button><button type="button" class="btn evt-confirm-btn btn-confirm-yes" id="fillInputsBtn">Fill inputs</button></td>
                </tr>
            </table>
            <div id="div_defense_planner" style="padding-top:10px; margin-top: 15px; border-top: 2px solid ${borderColor};">
                <h3 style="color:${textColor};">Defense Planner</h3>
                <table class="scriptTable">
                    <tr>
                        <td style="width: 50%;"><textarea id="incomings_text" style="width: 95%; height: 100px; background-color:${backgroundInput}; color:${textColor}; border:1px solid ${borderColor};" placeholder="Paste incoming attacks text here..."></textarea></td>
                        <td style="width: 50%; vertical-align: top; color:${textColor};">
                           Total Defense Population: <input id="total_defense_pop" type="number" value="10000" class="scriptInput" style="width: 80px;"><br>
                           <button id="process_incomings_btn" class="btn evt-confirm-btn btn-confirm-yes" style="margin-top: 10px;">Process Incomings & Plan Defense</button>
                           <button id="reset_plan_btn" class="btn evt-confirm-btn btn-confirm-no" style="margin-top: 10px;">Reset Plan</button><br>
                           <strong style="margin-top:10px; display:inline-block;">Total Pop Sent: <span id="total_pop_sent">0</span></strong>
                        </td>
                    </tr>
                </table>
                <div id="defense_table_container" style="margin-top:10px;"></div>
            </div>
        </div>
    </div>`;
        $("#div_container").remove();
        if ($("#contentContainer").length > 0) { $("#contentContainer").eq(0).prepend(html); } else { $("#mobileContent").eq(0).prepend(html); }
        $("#div_container").css("position", "fixed").draggable();
        $("#div_minimize").on("click", () => {
            let currentWidthPercentage = Math.ceil($('#div_container').width() / $('body').width() * 100);
            if (currentWidthPercentage >= widthInterface) { $('#div_container').css({ 'width': '10%' }); $('#div_body').hide(); } else { $('#div_container').css({ 'width': `${widthInterface}%` }); $('#div_body').show(); }
        });
        $('#calculateBtn').on('click', countTotalTroops);
        $('#fillInputsBtn').on('click', fillInputs);
        $('#process_incomings_btn').on('click', parseAndPlanDefense);
        $('#reset_plan_btn').on('click', resetDefensePlan);
        if (localStorage.getItem(game_data.world + "support_sender_settings2") != null) {
            let settings = JSON.parse(localStorage.getItem(game_data.world + "support_sender_settings2"));
            $('#table_upload input[type=checkbox]').each((index, elem) => elem.checked = settings[0][index]);
            $('#table_upload input[type=number], #table_upload input[type=datetime-local]').each((index, elem) => elem.value = settings[1][index]);
        }
        $('.sendTroops').val(0); $('.reserveTroops').val(0); $('#packets_send').val(0);
        $("#table_upload input").on("input change", function() {
            if ($(this).hasClass('reserveTroops')) { countTotalTroops(); }
            let list_checkbox = []; $('#table_upload input[type=checkbox]').each(function() { list_checkbox.push(this.checked); });
            let list_input = []; $('#table_upload input[type=number], #table_upload input[type=datetime-local]').each(function() { list_input.push(this.value); });
            localStorage.setItem(game_data.world + "support_sender_settings2", JSON.stringify([list_checkbox, list_input]));
        });
        if (game_data.device != "desktop") { $(".hideMobile").hide(); $("#table_upload").find("input[type=text]").css("width", "100%"); }
    }

    function changeTheme() { /* Unchanged */ }

    function initializationTheme() {
        if (!localStorage.getItem(localStorageThemeName)) { localStorage.setItem(localStorageThemeName, defaultTheme); }
        let mapTheme = new Map(JSON.parse(localStorage.getItem(localStorageThemeName)));
        let currentTheme = mapTheme.get("currentTheme") || "theme1";
        let colours = mapTheme.get(currentTheme);
        [textColor, backgroundInput, borderColor, backgroundContainer, backgroundHeader, backgroundMainTable, backgroundInnerTable, widthInterface] = colours;
        if (game_data.device != "desktop") widthInterface = 98;
        backgroundAlternateTableEven = backgroundContainer;
        backgroundAlternateTableOdd = getColorDarker(backgroundContainer, -20);
    }

    function countTotalTroops() {
        let dateStart = new Date(); dateStart.setFullYear(dateStart.getFullYear() - 1);
        let dateStop = new Date(); dateStop.setFullYear(dateStop.getFullYear() + 1);
        let sigil = 0;
        if (document.getElementById("checkbox_window").checked) {
            dateStart = new Date(document.getElementById("start_window").value);
            dateStop = new Date(document.getElementById("stop_window").value);
            sigil = parseInt(document.getElementById("flag_boost").value) || 0;
            if (dateStart.toString() === "Invalid Date") UI.ErrorMessage("start date has an invalid format", 2000);
            if (dateStop.toString() === "Invalid Date") UI.ErrorMessage("stop date has an invalid format", 2000);
        }

        let mapVillages = new Map();
        let coordDestination = ($(".village-name").text().match(/\d+\|\d+/) || [$("#inputx").val() + "|" + $("#inputy").val()])[0];
        if (!coordDestination) return;

        let speedConstants = getSpeedConstant();
        let speedWorld = speedConstants.worldSpeed;
        let speedTroupes = speedConstants.unitSpeed;
        let speedTroop = { snob: 35, ram: 30, catapult: 30, sword: 22, axe: 18, spear: 18, archer: 18, heavy: 11, light: 10, marcher: 10, knight: 10, spy: 9 };
        for (let key in speedTroop) {
            speedTroop[key] *= 60 * 1000 / (speedWorld * speedTroupes);
        }

        Array.from($("#village_troup_list tbody tr")).forEach(row => {
            let villageId = row.id.split('_')[2];
            if (!villageId) return;
            let coordMatch = row.children[0].innerText.match(/\d+\|\d+/);
            if (!coordMatch) return;
            let coord = coordMatch[0];
            let distance = calcDistance(coord, coordDestination);
            let objTroops = { distance: distance, villageId: villageId };

            units.forEach(troopName => {
                let totalTroops = parseInt($(row).find(`[data-unit='${troopName}']`).text()) || 0;
                let reserveTroops = parseFloat($(`#${troopName}Reserve`).val()) * 1000 || 0;
                totalTroops = (totalTroops > reserveTroops) ? totalTroops - reserveTroops : 0;
                if (speedTroop[troopName]) {
                    let timeTroop = speedTroop[troopName] * distance / (1 + sigil / 100.0);
                    let serverTime = document.getElementById("serverTime").innerText;
                    let serverDate = document.getElementById("serverDate").innerText.split("/");
                    let date_current = new Date(`${serverDate[1]}/${serverDate[0]}/${serverDate[2]} ${serverTime}`);
                    date_current = new Date(date_current.getTime() + timeTroop);
                    if (totalTroops > 0 && dateStart.getTime() < date_current.getTime() && date_current.getTime() < dateStop.getTime()) {
                        objTroops[troopName + "_speed"] = troopName;
                    }
                }
                objTroops[troopName] = totalTroops;
            });
            mapVillages.set(coord, objTroops);
        });

        let objTroopsTotal = { spear: 0, sword: 0, archer: 0, spy: 0, heavy: 0 };
        mapVillages.forEach(obj => {
            let slowestUnit = ['ram', 'catapult', 'sword', 'spear', 'archer', 'heavy', 'spy'].find(u => obj[`${u}_speed`]);
            if (slowestUnit) {
                if (game_data.units.includes('archer')) objTroopsTotal.archer += obj.archer || 0;
                objTroopsTotal.spear += obj.spear || 0;
                objTroopsTotal.sword += obj.sword || 0;
                objTroopsTotal.spy += obj.spy || 0;
                objTroopsTotal.heavy += obj.heavy || 0;
            }
        });

        if (!game_data.units.includes("archer")) delete objTroopsTotal.archer;
        let totalPop = 0;
        Object.keys(objTroopsTotal).forEach(key => {
            if (["spear", "sword", "archer", "spy", "heavy"].includes(key) && units.includes(key)) {
                $(`#${key}total`).val((objTroopsTotal[key] / 1000).toFixed(2));
                totalPop += objTroopsTotal[key] * (troupesPop[key] || 1);
            }
        });

        $("#packets_total").val((totalPop / 1000).toFixed(2));
        $('#total_defense_pop').val(Math.floor(totalPop));
        return mapVillages;
    }

    function fillInputs() {
        let mapVillages = countTotalTroops();
        let sendTotalObj = {};
        $('.sendTroops').each(function() { sendTotalObj[this.id.replace('total', '')] = parseFloat(this.value) * 1000 || 0; });
        let totalTroopsAvailable = {};
        units.forEach(u => totalTroopsAvailable[u] = 0);
        mapVillages.forEach(village => { units.forEach(u => totalTroopsAvailable[u] += village[u] || 0); });
        for (const troop in sendTotalObj) { if (sendTotalObj[troop] > totalTroopsAvailable[troop]) { return UI.ErrorMessage(`Not enough ${troop} troops.`); } }

        $("#village_troup_list").find("input[type=number]").val(0);
        $("#village_troup_list").find(".troop-request-selector").prop('checked', false);

        mapVillages.forEach((villageData, coord) => {
            const row = $(`#call_village_${villageData.villageId}`);
            if (row.length) {
                let troopsToSendInThisRow = 0;
                for (const troop in sendTotalObj) {
                    if (sendTotalObj[troop] > 0 && villageData[troop] > 0) {
                        let proportion = totalTroopsAvailable[troop] > 0 ? sendTotalObj[troop] / totalTroopsAvailable[troop] : 0;
                        let amountToSend = Math.floor(villageData[troop] * proportion);
                        if (amountToSend > 0) {
                            $(row).find(`.call-unit-box-${troop}`).val(amountToSend);
                            troopsToSendInThisRow += amountToSend;
                        }
                    }
                }
                if (troopsToSendInThisRow > 0) {
                    $(row).find('.troop-request-selector').prop('checked', true);
                }
            }
        });
    }

    function addEvents() {

        $('.sendTroops').off('input').on('input', function() {

            let totalPop = 0;
            $('.sendTroops').each(function() {
                let value = parseFloat(this.value) || 0;
                let troopName = this.id.replace('total', '');
                totalPop += value * 1000 * (troupesPop[troopName] || 0);
            });
            $('#packets_send').val((totalPop / 1000).toFixed(2));
        });
        $('#packets_send').off('input').on('input', function() {
            let needPop = parseFloat(this.value) || 0;
            let totalPop = parseFloat($('#packets_total').val()) || 0;
            if (totalPop === 0) return;
            let ratio = needPop / totalPop;
            $('.sendTroops').each(function() {
                let troopName = this.id.replace('total', '');
                if (troopName !== 'spy') {
                    let totalTroopK = parseFloat($(`#${troopName}total.totalTroops`).val()) || 0;
                    this.value = (totalTroopK * ratio).toFixed(2);
                } else { this.value = 0; }
            });
        });
    }

    function hitCountApi() { $.getJSON(`https://api.counterapi.dev/v1/${countNameSpace}/${countApiKey}/up`, r => {}); }
    function calcDistance(coord1, coord2) { let [x1, y1] = coord1.split("|").map(Number); let [x2, y2] = coord2.split("|").map(Number); return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)); }
    function getSpeedConstant() {
        let key = game_data.world + "speedWorld";
        if (localStorage.getItem(key)) {
            return JSON.parse(localStorage.getItem(key));
        } else {
            let data = httpGet("/interface.php?func=get_config");
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, "text/xml");
            let obj = {
                worldSpeed: Number(xmlDoc.getElementsByTagName("speed")[0].innerHTML),
                unitSpeed: Number(xmlDoc.getElementsByTagName("unit_speed")[0].innerHTML)
            };
            localStorage.setItem(key, JSON.stringify(obj));
            return obj;
        }
    }

    function parseAndPlanDefense() {
        const text = $('#incomings_text').val();
        const villages = text.split('Village:').slice(1);
        let parsedData = [];
        villages.forEach(villageText => {
            try {
                const villageNameMatch = villageText.match(/(.*?)\((\d+\|\d+)\)/);
                if (!villageNameMatch) return;
                const name = villageNameMatch[1].trim();
                const coords = villageNameMatch[2];
                const attacks = [...villageText.matchAll(/Arrival time: (.*?:\d{3})/g)];
                if (attacks.length > 0) {
                    const arrivalTimes = attacks.map(match => new Date(match[1].replace(/:(?=[^:]*$)/, '.')));
                    const soonestArrival = new Date(Math.min(...arrivalTimes));
                    parsedData.push({ name, coordinates: coords, arrival: soonestArrival, pop_to_send: 0, sent: false });
                }
            } catch (e) { console.error("Error parsing village block:", e); }
        });
        parsedData.sort((a, b) => a.arrival - b.arrival);
        const totalPop = parseInt($('#total_defense_pop').val(), 10) || 0;
        const popPerVillage = parsedData.length > 0 ? Math.floor(totalPop / parsedData.length) : 0;
        defensePlan = parsedData.map(v => ({...v, pop_to_send: popPerVillage }));
        renderDefenseTable();
        localStorage.setItem(defensePlanStorageKey, JSON.stringify(defensePlan));
    }

    function renderDefenseTable() {
        let tableHtml = `
            <table id="defense_plan_table" class="vis overview_table" style="width:100%;">
                <thead><tr><th>Village</th><th>Soonest Arrival</th><th>Pop to Send</th><th>Action</th><th>Status</th></tr></thead>
                <tbody>`;
        if (defensePlan.length === 0) {
            tableHtml += `<tr><td colspan="5" style="text-align:center;">No defense plan found. Process incomings to create one.</td></tr>`;
        } else {
            defensePlan.forEach((village, index) => {
                const isSent = village.sent;
                const sentClass = isSent ? 'sent-row' : '';
                tableHtml += `
                    <tr class="${sentClass}">
                        <td>${village.name} (${village.coordinates})</td>
                        <td>${village.arrival.toLocaleString()}</td>
                        <td><input type="number" class="scriptInput pop-to-send-input" data-coords="${village.coordinates}" value="${village.pop_to_send}" ${isSent ? 'disabled' : ''} style="width: 70px; ${isSent ? 'opacity:0.6;' : ''}"></td>
                        <td><button class="btn send-support-btn ${isSent ? 'btn-disabled' : 'evt-confirm-btn btn-confirm-yes'}" data-coords="${village.coordinates}" ${isSent ? 'disabled' : ''}>Send</button></td>
                        <td class="status-cell" data-coords="${village.coordinates}">${isSent ? 'Sent' : 'Pending'}</td>
                    </tr>`;
            });
        }
        tableHtml += `</tbody></table>`;
        $('#defense_table_container').html(tableHtml);
        $('.pop-to-send-input').on('change', function() { updatePopToSend($(this).data('coords'), $(this).val()); });
        $('.send-support-btn').on('click', function() { sendSupport($(this).data('coords')); });
        updateTotalSentPop();
    }

    function updatePopToSend(coords, newValue) {
        const village = defensePlan.find(v => v.coordinates === coords);
        if (village) {
            village.pop_to_send = parseInt(newValue, 10) || 0;
            localStorage.setItem(defensePlanStorageKey, JSON.stringify(defensePlan));
             updateTotalSentPop();
        }
    }

    async function sendSupport(coords) {

        const villageData = defensePlan.find(v => v.coordinates === coords);
        if (!villageData || villageData.sent) return;
        const [x, y] = coords.split('|');
        $('#inputx').val(x);
        $('#inputy').val(y);
        const popInK = (villageData.pop_to_send / 1000).toFixed(3);
        $('#packets_send').val(popInK).trigger('input');
        await new Promise(resolve => setTimeout(resolve, 250));
         document.querySelector('#place_call_select_all').click();
        fillInputs();
        await new Promise(resolve => setTimeout(resolve, 250));
        villageData.sent = true;

        updateTotalSentPop();
        localStorage.setItem(defensePlanStorageKey, JSON.stringify(defensePlan));
        $('#place_call_form_submit').click();
    }

    function updateTotalSentPop() {
        const totalSent = defensePlan.reduce((sum, village) => sum + (village.sent ? village.pop_to_send : 0), 0);
        $('#total_pop_sent').text(totalSent.toLocaleString());
    }

    function loadDefensePlan() {
        const savedPlan = localStorage.getItem(defensePlanStorageKey);
        if (savedPlan) {
            defensePlan = JSON.parse(savedPlan).map(v => ({ ...v, arrival: new Date(v.arrival) }));
            renderDefenseTable();
        }
    }

    function resetDefensePlan() {
        if (confirm("Are you sure you want to reset the defense plan? This will clear all sent statuses.")) {
            defensePlan = [];
            localStorage.removeItem(defensePlanStorageKey);
            $('#incomings_text').val('');
            renderDefenseTable();
        }
    }

    main();

})();
