/**
 * Tribal Wars Spy Report Scanner (Console Version)
 * To use:
 * 1. Open your browser's developer console (usually by pressing F12).
 * 2. Copy this entire script and paste it into the console.
 * 3. Press Enter. The UI will appear and the scan will start automatically.
 * 4. You can still manually use `loadScannerCache()` or `shouldIAttack('111|222')` in the console.
 */

(function() {
    'use strict';

    // --- Configuration ---
    const PAGES_TO_SCAN = 3; // Number of report pages to scan at once
    const REPORTS_PER_PAGE = 12; // Number of reports per page in Tribal Wars

    // --- UI Creation and Management ---

    function injectStyles() {
        if (document.getElementById('scannerStyles')) return; // Prevent re-injecting styles
        const style = document.createElement('style');
        style.id = 'scannerStyles';
        style.innerHTML = `
            #scannerPanel {
                position: fixed; top: 150px; left: 50%; transform: translateX(-50%); width: 80%; max-width: 900px;
                background-color: #f4e4bc; border: 2px solid #804000; z-index: 10000; display: none;
                box-shadow: 5px 5px 15px rgba(0,0,0,0.5);
            }
            #scannerHeader {
                background-color: #c1a264; padding: 8px; font-weight: bold; cursor: move; display: flex;
                justify-content: space-between; align-items: center;
            }
            #scannerHeader h3 { margin: 0; color: #542e0a; }
            #scannerCloseBtn { cursor: pointer; border: 1px solid #804000; background: #e9d7b4; padding: 2px 8px; font-weight: bold; }
            #scannerContent { padding: 10px; max-height: 60vh; overflow-y: auto; }
            #scannerControls { padding: 10px; border-bottom: 1px solid #c1a264; display: flex; gap: 10px; }
            #scannerControls button { background-color: #c1a264; border: 1px solid #804000; padding: 5px 10px; font-weight: bold; cursor: pointer; }
            #scannerControls button:hover { background-color: #d1b274; }
            #reportTable { width: 100%; border-collapse: collapse; }
            #reportTable th, #reportTable td { border: 1px solid #c1a264; padding: 5px; text-align: left; }
            #reportTable th { background-color: #e9d7b4; cursor: pointer; }
            #reportTable .recommend-attack { color: green; font-weight: bold; }
            #reportTable .recommend-no-attack { color: red; font-weight: bold; }
        `;
        document.head.appendChild(style);
    }

    function createUIPanel() {
        if (document.getElementById('scannerPanel')) return; // Prevent creating multiple panels
        const panel = document.createElement('div');
        panel.id = 'scannerPanel';
        panel.innerHTML = `
            <div id="scannerHeader">
                <h3>Spy Report Scanner</h3>
                <span id="scannerCloseBtn">X</span>
            </div>
            <div id="scannerControls">
                <button id="scanBtn">Scan Reports</button>
                <button id="loadCacheBtn">Load From Cache</button>
                <button id="testLogicBtn">Test Attack Logic</button>
            </div>
            <div id="scannerContent">
                <table id="reportTable">
                    <thead>
                        <tr>
                            <th>Village</th><th>Recommendation</th><th>Send Ram?</th><th>Received</th><th>Resources (W/C/I)</th><th>Wall</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td colspan="6">Scan or load from cache to see reports.</td></tr>
                    </tbody>
                </table>
            </div>
        `;
        document.body.appendChild(panel);

        document.getElementById('scannerCloseBtn').addEventListener('click', () => panel.style.display = 'none');
        document.getElementById('scanBtn').addEventListener('click', fetchAndProcessMainReportPages);
        document.getElementById('loadCacheBtn').addEventListener('click', () => {
            const reports = Array.from(loadAndDeduplicateCache(false).values());
            renderReportsTable(reports);
            panel.style.display = 'block';
        });
        document.getElementById('testLogicBtn').addEventListener('click', () => {
             const coordsToTest = prompt("Enter village coordinates to test (e.g., 111|222):");
             if (coordsToTest) {
                 const result = shouldAttackVillage(coordsToTest);
                 alert(`Should you attack ${coordsToTest}? \n\nResult: ${result}`);
             }
        });
        dragElement(panel);
    }

    function renderReportsTable(reports) {
        const tbody = document.querySelector('#reportTable tbody');
        tbody.innerHTML = '';
        if (!reports || reports.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6">No reports found.</td></tr>';
            return;
        }
        reports.forEach(report => {
            const row = tbody.insertRow();
            const recommendationClass = report.recommendation === 'Attack' ? 'recommend-attack' : 'recommend-no-attack';
            const resources = report.scoutedResources;
            const resString = report.status === "Success" ? `${resources.wood || 0}/${resources.clay || 0}/${resources.iron || 0}` : 'N/A';
            row.innerHTML = `
                <td>${report.village}</td><td class="${recommendationClass}">${report.recommendation}</td>
                <td>${report.send_ram ? 'Yes' : 'No'}</td><td>${report.Received}</td><td>${resString}</td>
                <td>${report.buildings.Wall || (report.status === "Success" ? 0 : 'N/A')}</td>
            `;
        });
    }

    function dragElement(elmnt) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        const header = document.getElementById("scannerHeader");
        if (header) header.onmousedown = dragMouseDown;
        function dragMouseDown(e) {
            e = e || window.event; e.preventDefault();
            pos3 = e.clientX; pos4 = e.clientY;
            document.onmouseup = closeDragElement; document.onmousemove = elementDrag;
        }
        function elementDrag(e) {
            e = e || window.event; e.preventDefault();
            pos1 = pos3 - e.clientX; pos2 = pos4 - e.clientY;
            pos3 = e.clientX; pos4 = e.clientY;
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        }
        function closeDragElement() {
            document.onmouseup = null; document.onmousemove = null;
        }
    }

    // --- Helper Functions ---

    function parseTWDate(dateString) {
        if (!dateString || typeof dateString !== 'string') return null;
        const now = new Date();
        let date;
        try {
            if (dateString.toLowerCase().includes('today')) {
                const timeMatch = dateString.match(/(\d{1,2}):(\d{2})/);
                if (timeMatch) {
                    date = new Date();
                    date.setHours(parseInt(timeMatch[1], 10), parseInt(timeMatch[2], 10), 0, 0);
                }
            } else if (dateString.toLowerCase().includes('yesterday')) {
                const timeMatch = dateString.match(/(\d{1,2}):(\d{2})/);
                if (timeMatch) {
                    date = new Date();
                    date.setDate(date.getDate() - 1);
                    date.setHours(parseInt(timeMatch[1], 10), parseInt(timeMatch[2], 10), 0, 0);
                }
            } else {
                date = new Date(dateString + ' ' + now.getFullYear());
            }
            return isNaN(date.getTime()) ? null : date;
        } catch (e) {
            return null;
        }
    }

    // --- Cache and World ID Functions ---

    function getWorldId() {
        return window.location.hostname.split('.')[0];
    }

    function getCacheKey() {
        const worldId = getWorldId();
        return `tw_spy_reports_${worldId}`;
    }

    function saveToCache(data) {
        const cacheKey = getCacheKey();
        if (!data) return;
        console.log(`TW Report Scanner: Saving ${data.length} total unique reports to cache for world ${getWorldId()}...`);
        localStorage.setItem(cacheKey, JSON.stringify(data));
    }

    function loadAndDeduplicateCache(logToConsole = false) {
        const cacheKey = getCacheKey();
        const cachedData = localStorage.getItem(cacheKey);
        const finalReportMap = new Map();
        if (cachedData) {
            try {
                const reports = JSON.parse(cachedData);
                if (logToConsole) console.log(`TW Report Scanner: Loading and de-duplicating reports from cache for world ${getWorldId()}...`);
                reports.forEach(report => {
                    if (!report || !report.villageCoordinate) return;
                    const existingReport = finalReportMap.get(report.villageCoordinate);
                    if (!existingReport) {
                        finalReportMap.set(report.villageCoordinate, report);
                    } else {
                        const existingDate = parseTWDate(existingReport.Received);
                        const newDate = parseTWDate(report.Received);
                        if (newDate && (!existingDate || newDate > existingDate)) {
                             finalReportMap.set(report.villageCoordinate, report);
                        }
                    }
                });
                 if (logToConsole) {
                    console.log("--- CACHED SPY REPORT DATA (LATEST ONLY) ---");
                    console.log(Array.from(finalReportMap.values()));
                    console.log("--------------------------------------------");
                }
            } catch(e) {
                console.error("TW Report Scanner: Failed to parse cached data. It might be corrupted.", e);
                localStorage.removeItem(cacheKey);
            }
        } else {
            if (logToConsole) console.log(`TW Report Scanner: No cached data found for world ${getWorldId()}.`);
        }
        return finalReportMap;
    }

    // --- Core Scanning and Parsing Logic ---

    async function fetchAndProcessMainReportPages() {
        console.log(`TW Report Scanner: Starting scan of ${PAGES_TO_SCAN} report pages...`);
        document.getElementById('scannerPanel').style.display = 'block';
        document.getElementById('scanBtn').textContent = 'Scanning...';
        const cachedReportMap = loadAndDeduplicateCache(false);
        console.log(`TW Report Scanner: Loaded ${cachedReportMap.size} unique reports from cache to begin merge.`);

        const pagePromises = [];
        for (let i = 0; i < PAGES_TO_SCAN; i++) {
            const fromIndex = i * REPORTS_PER_PAGE;
            const reportsUrl = `/game.php?screen=report&mode=all&from=${fromIndex}`;
            pagePromises.push(fetchReportListPage(reportsUrl));
        }

        try {
            const reportListDocs = await Promise.all(pagePromises);
            const allDetailPromises = [];
            for (const doc of reportListDocs) {
                if (doc) processReportList(doc, allDetailPromises);
            }
            if (allDetailPromises.length === 0) {
                console.log("TW Report Scanner: No new spy reports found across all scanned pages.");
                saveToCache(Array.from(cachedReportMap.values()));
                document.getElementById('scanBtn').textContent = 'Scan Reports';
                return;
            }
            console.log(`TW Report Scanner: Waiting for ${allDetailPromises.length} reports to load...`);
            const newlyScannedReports = (await Promise.all(allDetailPromises)).filter(r => r !== null);
            newlyScannedReports.forEach(newReport => {
                const existingReport = cachedReportMap.get(newReport.villageCoordinate);
                if (!existingReport) {
                    cachedReportMap.set(newReport.villageCoordinate, newReport);
                } else {
                    const existingDate = parseTWDate(existingReport.Received);
                    const newDate = parseTWDate(newReport.Received);
                    if (newDate && (!existingDate || newDate > existingDate)) {
                        cachedReportMap.set(newReport.villageCoordinate, newReport);
                    }
                }
            });
            const finalMergedData = Array.from(cachedReportMap.values());
            renderReportsTable(finalMergedData);
            saveToCache(finalMergedData);
        } catch (error) {
            console.error("TW Report Scanner: An error occurred while fetching report pages.", error);
        } finally {
            document.getElementById('scanBtn').textContent = 'Scan Reports';
        }
    }

    async function fetchReportListPage(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.error(`TW Report Scanner: Failed to fetch report page at ${url}. Status: ${response.status}`);
                return null;
            }
            const text = await response.text();
            const parser = new DOMParser();
            return parser.parseFromString(text, 'text/html');
        } catch (error) {
            console.error(`TW Report Scanner: Error fetching report page at ${url}.`, error);
            return null;
        }
    }

    function processReportList(doc, reportDetailPromises) {
        const reportRows = doc.querySelectorAll('#report_list tr[class*="report-"]');
        for (const row of reportRows) {
            const spyIcon = row.querySelector('img[src*="graphic/command/spy.webp"]');
            if (!spyIcon) continue;
            const reportLinkElement = row.querySelector('a.report-link');
            if (!reportLinkElement) continue;
            const title = reportLinkElement.textContent.trim();
            const allCoordsMatches = title.match(/\(\d+\|\d+\)/g);
            if (!allCoordsMatches || allCoordsMatches.length < 2) continue;
            const lastMatch = allCoordsMatches[allCoordsMatches.length - 1];
            const villageCoords = lastMatch.replace(/[()]/g, '');
            const reportUrl = reportLinkElement.href;
            const receivedDateElement = row.querySelector('td:last-child');
            const receivedDate = receivedDateElement ? receivedDateElement.textContent.trim() : 'N/A';
            reportDetailPromises.push(fetchReportDetails(reportUrl, villageCoords, receivedDate));
        }
    }

    async function fetchReportDetails(url, villageCoords, receivedDate) {
        try {
            const response = await fetch(new URL(url, window.location.origin));
            if (!response.ok) {
                console.error(`TW Report Scanner: Failed to fetch report at ${url}. Status: ${response.status}`);
                return null;
            }
            const text = await response.text();
            return parseReportPage(text, villageCoords, receivedDate);
        } catch (error) {
            console.error(`TW Report Scanner: Error fetching report details from ${url}.`, error);
            return null;
        }
    }

    function parseReportPage(htmlText, villageCoords, receivedDate) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');
        const villageElement = doc.querySelector('#attack_info_def .village_anchor a');
        if (!villageElement) return null;
        const villageNameAndCoords = villageElement.textContent.trim();
        const espionageTable = doc.querySelector('#attack_spy_resources');
        if (!espionageTable) {
            return {
                village: villageNameAndCoords, recommendation: "Do Not Attack (Failed Spy Mission)",
                send_ram: false, Received: receivedDate, villageCoordinate: villageCoords,
                status: "Failed Spy Mission (No Data)", scoutedResources: {}, buildings: {}
            };
        }
        const resources = {};
        espionageTable.querySelectorAll('span.nowrap').forEach(span => {
            const resourceTypeElement = span.querySelector('span[data-title], span[title]');
            if(resourceTypeElement) {
                const type = (resourceTypeElement.getAttribute('data-title') || resourceTypeElement.getAttribute('title')).toLowerCase();
                const key = type === 'stone' ? 'clay' : type;
                const value = parseInt(span.textContent.trim().replace(/\./g, ''), 10);
                resources[key] = value;
            }
        });
        const buildingDataInput = doc.querySelector('#attack_spy_building_data');
        let buildings = {};
        if (buildingDataInput && buildingDataInput.value) {
            try {
                const buildingArray = JSON.parse(buildingDataInput.value);
                buildingArray.forEach(building => {
                    buildings[building.name] = parseInt(building.level, 10);
                });
            } catch (e) {
                console.error("TW Report Scanner: Failed to parse building data JSON.", e);
            }
        }
        let recommendation = "Attack";
        const wallLevel = buildings['Wall'] || 0;
        const totalResources = (resources['wood'] || 0) + (resources['clay'] || 0) + (resources['iron'] || 0);
        const isWallTooHigh = wallLevel >= 5;
        const areResourcesTooLow = totalResources <= 2000;
        if (isWallTooHigh && areResourcesTooLow) {
            recommendation = "Do Not Attack (Wall too high and resources too low)";
        } else if (isWallTooHigh) {
            recommendation = "Do Not Attack (Wall too high)";
        } else if (areResourcesTooLow) {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 14);
            const dateString = futureDate.toLocaleString('default', { month: 'short', day: 'numeric' });
            recommendation = `Do Not Attack (Resources too low, try again around ${dateString})`;
        }
        const send_ram = recommendation.includes("Wall too high");
        return {
            village: villageNameAndCoords, recommendation: recommendation, send_ram: send_ram,
            Received: receivedDate, villageCoordinate: villageCoords, status: "Success",
            scoutedResources: resources, buildings: buildings
        };
    }

    function shouldAttackVillage(coords) {
        console.log(`Checking attack logic for: ${coords}`);
        const cachedReportMap = loadAndDeduplicateCache(false);
        if (cachedReportMap.size === 0) {
            console.log(`Cache is empty. Recommending attack for ${coords}.`);
            return true;
        }
        const latestReport = cachedReportMap.get(coords);
        if (!latestReport) {
            console.log(`No report found in cache for ${coords}. Recommending attack.`);
            return true;
        }
        console.log(`Found latest report for ${coords}:`, latestReport);
        if (latestReport.recommendation === 'Attack') {
            console.log(`Recommendation is 'Attack'. Returning true.`);
            return true;
        } else {
            console.log(`Recommendation is not 'Attack' ('${latestReport.recommendation}'). Returning false.`);
            return false;
        }
    }

    // --- Script Initialization and Global Exposure ---
    function initialize() {
        injectStyles();
        createUIPanel();
        console.log("Tribal Wars Spy Report Scanner initialized. Automatically starting scan...");
        // Automatically start the scan and show the UI
        fetchAndProcessMainReportPages();
    }

    // Expose functions to the global window object so they can be called from the console
    window.runScanner = fetchAndProcessMainReportPages;
    window.loadScannerCache = () => {
        const reports = Array.from(loadAndDeduplicateCache(false).values());
        renderReportsTable(reports);
        document.getElementById('scannerPanel').style.display = 'block';
    };
    window.shouldIAttack = shouldAttackVillage;

    initialize();

})();
