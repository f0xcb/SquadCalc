
import { App } from "../app.js";
import { DivIcon } from "leaflet";
import { animateCSS } from "./animations.js";
import i18next from "i18next";


export default class SquadFactions {

    /**
     * * @param {Object} layerData - The layer data object containing the factions and units
     * * @param {SquadLayer} squadLayer - The SquadLayer object containing the main icons
     * */
    constructor(squadLayer) {
        this.squadLayer = squadLayer;
        this.FACTION1_SELECTOR = $(".dropbtn8");
        this.FACTION2_SELECTOR = $(".dropbtn10");
        this.UNIT1_SELECTOR = $(".dropbtn9");
        this.UNIT2_SELECTOR = $(".dropbtn11");
        this.init(squadLayer.layerData);
        this.initDropdowns();
    }


    /*
     *  Reset the factions button to its default state
     */
    resetFactionsButton() {
        $("#factionsButton button").empty().append(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
                <path fill="currentColor" d="M176 8c-6.6 0-12.4 4-14.9 10.1l-29.4 74L55.6 68.9c-6.3-1.9-13.1 .2-17.2 5.3s-4.6 12.2-1.4 17.9l39.5 69.1L10.9 206.4c-5.4 3.7-8 10.3-6.5 16.7s6.7 11.2 13.1 12.2l78.7 12.2L90.6 327c-.5 6.5 3.1 12.7 9 15.5s12.9 1.8 17.8-2.6l35.3-32.5 9.5-35.4 10.4-38.6c8-29.9 30.5-52.1 57.9-60.9l41-59.2c11.3-16.3 26.4-28.9 43.5-37.2c-.4-.6-.8-1.2-1.3-1.8c-4.1-5.1-10.9-7.2-17.2-5.3L220.3 92.1l-29.4-74C188.4 12 182.6 8 176 8zM367.7 161.5l135.6 36.3c6.5 1.8 11.3 7.4 11.8 14.2l4.6 56.5-201.5-54 32.2-46.6c3.8-5.6 10.8-8.1 17.3-6.4zm-69.9-30l-47.9 69.3c-21.6 3-40.3 18.6-46.3 41l-10.4 38.6-16.6 61.8-8.3 30.9c-4.6 17.1 5.6 34.6 22.6 39.2l15.5 4.1c17.1 4.6 34.6-5.6 39.2-22.6l8.3-30.9 247.3 66.3-8.3 30.9c-4.6 17.1 5.6 34.6 22.6 39.2l15.5 4.1c17.1 4.6 34.6-5.6 39.2-22.6l8.3-30.9L595 388l10.4-38.6c6-22.4-2.5-45.2-19.6-58.7l-6.8-84c-2.7-33.7-26.4-62-59-70.8L384.2 99.7c-32.7-8.8-67.3 4-86.5 31.8zm-17 131a24 24 0 1 1 -12.4 46.4 24 24 0 1 1 12.4-46.4zm217.9 83.2A24 24 0 1 1 545 358.1a24 24 0 1 1 -46.4-12.4z"/>
            </svg>
        `);
    }


    /**
     * * Format the factions for the select2 results and options
     * * @param {Object} state - The select2 state object
     * * @param {boolean} isSelection - Whether the state is a result (true) or an option (false)
     * */
    formatFactions(state, isSelection = false) {
        if (!state.id) return state.text;
        const imgHtml = `<img src="/icons/flags/${state.element.value}.webp" class="img-flag" />`;
        if (isSelection) return $(`<span class="countryFlags">${imgHtml}</span>`);
        return $(`
            <span class="countryFlags">
                <p>${imgHtml}</p>
                <span class="flag-label">${i18next.t("factions:" + state.element.value)}</span>
            </span>
        `);
    }


    /**
     * * Format the units for the select2 results and options
     * * * @param {Object} state - The select2 state object
     * * * @param {boolean} isSelection - Whether the option is a result (true) or an option (false)
     * */
    formatUnits(state, isSelection = false) {
        if (!state.id) return state.text;
        const $element = $(state.element);
        const type = $element.data("type");
        const name = $element.data("name");
        return $(`
            <div class="unit-option">
                <img src="/icons/units/${type}.webp" class="unit-logo${isSelection ? " selection" : ""}" alt="${state.text}" />
                <div class="unit-texts">
                    <div class="unit-type">${i18next.t(type, { ns: "units" })}</div>
                    ${isSelection ? "" : `<div class="unit-name">${i18next.t(name, { ns: "units" })}</div>`}
                </div>
            </div>
        `);
    }

    /**
     * * * Pin the selected unit to the map and start a timer for its respawn time
     * * @param {Array} teamfaction - The faction data for the selected unit
     * * @param {string} country - The country code for the flag icon (RGF, USA, etc.)
     *  * @param {string} faction - The faction name for the selected unit
     * */
    pinUnit(teamfaction, country, faction) {
    
        $("#factionsButton button").empty().append(`
            <img src="/icons/flags/${country}.webp" alt="Faction Icon" class="faction-img" />
        `);
        
        const selectedUnit = teamfaction.find((unit) => unit.unitObjectName === faction);

        if (!selectedUnit) return;

        selectedUnit.vehicles.forEach((vehicle) => {
            for (let i = 0; i < vehicle.count; i++){
                
                // Filter out vehicles with respawn time < 10 minutes
                if (App.userSettings.hideLowRespawn && vehicle.respawnTime < 5) return;

                $("#pinnedVehiclesTab").append(`
                    <div class="pinnedVehicles animate__animated animate__fadeInLeft" data-vehiclename="${vehicle.type}" data-vehtype="${vehicle.vehType}" data-vehicon="${vehicle.icon}" data-respawntime="${vehicle.respawnTime}">
                        <button type="button" class="btn-pined" aria-label="Select Factions">
                            <img src="/icons/ally/vehicles/${vehicle.icon}.webp" alt="Faction Icon"/>
                        </button>
                        <div class="pinedVehiclesMeta">
                            <div class="pinedVehiclesName">${vehicle.type}</div>
                            <div class="pinedVehiclesTimer">${vehicle.respawnTime}<span class="" data-i18n="common:min">${i18next.t("common:min")}</span></div>
                        </div>
                    </div>
                `);
            }
        });
            
        

        // Prevent focus
        $(document).off("mousedown", ".btn-pined, .pinnedVehicles");
        $(document).on("mousedown", ".btn-pined, .pinnedVehicles", (event) => {event.preventDefault();});

        $(document).off("click", ".pinnedVehicles");
        $(document).on("click", ".pinnedVehicles", (event) => {
            const SECONDSINAMINUTE = 60;
            const $vehicleDiv = $(event.currentTarget);
            const $timerDiv = $vehicleDiv.find(".pinedVehiclesTimer");
            let respawnTime = $vehicleDiv.data("respawntime") * SECONDSINAMINUTE;

            if ($vehicleDiv.hasClass("active")) {
                // If active, cancel the timer and reset
                const timerId = $vehicleDiv.data("timerId");
                if (timerId) clearInterval(timerId);
                $timerDiv.empty().append(`
                    ${respawnTime}<span class="unit" data-i18n="common:min">${i18next.t("common:min")}</span>
                `);
                $vehicleDiv.removeClass("active");
                $vehicleDiv.removeData("timerId");
                return;
            }
        
            $vehicleDiv.addClass("active");
            
            let vehIcon = $vehicleDiv.data("vehicon");
        
            $timerDiv.text(formatTime(respawnTime));
        
            const timerId = setInterval(() => {
                respawnTime--;
        
                if (respawnTime > 0) {
                    $timerDiv.text(formatTime(respawnTime));
                } else {
                    clearInterval(timerId);
                    $vehicleDiv.removeClass("active");
                    $vehicleDiv.removeData("timerId");
                    $timerDiv.empty().append(`
                        ${$vehicleDiv.data("respawntime") * SECONDSINAMINUTE}<span class="unit" data-i18n="common:min">${i18next.t("common:min")}</span>
                    `);
                    App.openToast("warning", "vehicleRespawned", "");
                    // TODO: support for every language
                    // use https://luvvoice.com/ if you want to add voice support for your language
                    if (!App.userSettings.disableSounds) new Audio(`/sounds/en/${vehIcon}.mp3`).play();    
                }
            }, 1000);
        
            $vehicleDiv.data("timerId", timerId);
        });
        
        function formatTime(seconds) {
            const minutes = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${minutes}:${secs.toString().padStart(2, "0")}`;
        }
    }


    unpinUnit() {
        // Clear any active timers
        $("#pinnedVehiclesTab .pinnedVehicles").each(function() {
            const $vehicleDiv = $(this);
            const timerId = $vehicleDiv.data("timerId");
            if (timerId) clearInterval(timerId);
            $vehicleDiv.removeClass("active");
            $vehicleDiv.removeData("timerId");
        });

        // Now clear the pinned vehicles tab and reset buttons
        $("#pinnedVehiclesTab").empty();
        $(".btn-pin").removeClass("active").text(i18next.t("common:pinToMap")).attr("data-i18n", "common:pinToMap");
        this.resetFactionsButton();
    }


    /**
     * * Load the given units for a given faction into the selector
     * * @param {string} FACTION - The faction name
     * * @param {Array} UNITS - The array of all units and vehicles
     * * @param {Array} FACTIONS - The layer factions
     * * @param {jQuery} SELECTOR - The jQuery selector to load the units into
     * */
    loadUnits(FACTION, UNITS, FACTIONS, SELECTOR) {

        // Clear the selector
        SELECTOR.empty();

        // Load the factions units into the selector
        FACTIONS.forEach((faction) => {
            if (faction.factionID == FACTION) {
                for (const unit of UNITS) {
                    if (unit.unitObjectName === faction.defaultUnit) {
                        SELECTOR.append(`<option value="${faction.defaultUnit}" data-type="${unit.type}" data-name="${unit.displayName}"></option>`);
                        break;
                    }
                }
                for (const type of faction.types) {
                    for (const unit of UNITS) {
                        if (unit.unitObjectName === type.unit) {
                            SELECTOR.append(`<option value="${type.unit}" data-type="${unit.type}" data-name="${unit.displayName}"></option>`);
                            break;
                        }
                    }
                }
            }
        });

        // Set the default value to the first option
        SELECTOR.val(SELECTOR.find("option:first").val()).trigger("change");
    }


    /**
     * * * Update the main icon on the map with the given faction
     * * @param {string} teamKey - The team key (team1 or team2)
     * * @param {string} FACTION - The faction name (USA, RGF, etc.)
     * * @param {SquadObjective} MAIN - The main object containing the icon and nameText
     * */
    updateMainIcon(teamKey, FACTION) {

        var mainFlag;
        
        this.squadLayer.mains.forEach((main) => {
            if (main.objectName.toLowerCase().includes(teamKey)) {
                mainFlag = main;
                return;
            }
        });
        
        const MAIN_ICON = mainFlag.flag._icon;

        // Remove any old country_XXX class
        MAIN_ICON.classList.forEach(className => {
            if (className.startsWith("country_")) MAIN_ICON.classList.remove(className);
        });
    
        const isValid = FACTION !== "";
    
        // Add new country_XXX class if valid
        if (isValid) MAIN_ICON.classList.add(`country_${FACTION}`);
    
        // Update the name text icon
        mainFlag.nameText.setIcon(
            new DivIcon({
                className: "objText main",
                keyboard: false,
                html: isValid ? FACTION : i18next.t(`common:${teamKey}`),
                iconSize: [300, 20],
                iconAnchor: App.userSettings.circlesFlags ? [150, 38] : [150, 32],
                shadowUrl: "../img/icons/markers/marker_shadow.webp",
                shadowSize: [0, 0],
            })
        );
    }


    /**
     * * * Copy the vehicle name to the clipboard
     * @param {*} event 
     */
    copyVehicleName(event) {
        navigator.clipboard.writeText(`CreateSquad ${event.target.innerText}`);
        animateCSS($(event.target), "fadeIn");
        const originalText = event.target.innerText;
        event.target.innerText = i18next.t("tooltips:copied");
        setTimeout(() => {
            animateCSS($(event.target), "fadeIn");
            event.target.innerText = originalText;
        }, 2000);
    }


    /** 
     * * Initialize the factions selector and load the factions into it
     * * @param {Object} factionData - The faction data object
     * */
    init(factionData) {

        $(".dropbtn8, .dropbtn10").empty();
        this.resetFactionsButton();

        factionData.teamConfigs.factions.team1Units.forEach((faction) => {
            this.FACTION1_SELECTOR.append(`<option data-i18n=factions:${faction.factionID} value=${faction.factionID}></option>`);
        });

        factionData.teamConfigs.factions.team2Units.forEach((faction) => {
            this.FACTION2_SELECTOR.append(`<option data-i18n=factions:${faction.factionID} value=${faction.factionID}></option>`);
        });

        
        this.FACTION1_SELECTOR.off("change").on("change", (event) => {
            // Reset UI
            $("#team1Vehicles").empty();
            if ( $("#team1PinButton").hasClass("active") ) this.unpinUnit();
            // Update Unit selector and main icon
            this.loadUnits(event.target.value, factionData.units.team1Units, factionData.teamConfigs.factions.team1Units, this.UNIT1_SELECTOR);
            this.updateMainIcon("team1", event.target.value);
        });

        this.FACTION2_SELECTOR.off("change").on("change", (event) => {
            // Reset UI
            $("#team2Vehicles").empty();
            if ( $("#team2PinButton").hasClass("active") ) this.unpinUnit();
            // Update Unit selector and main icon
            this.loadUnits(event.target.value, factionData.units.team2Units, factionData.teamConfigs.factions.team2Units, this.UNIT2_SELECTOR);
            this.updateMainIcon("team2", event.target.value);
        });

        this.UNIT1_SELECTOR.off("change").on("change", (event) => {
            // Reset UI
            $("#team1Vehicles").empty();
            if ($("#team1PinButton").hasClass("active")) this.unpinUnit();
        
            const selectedUnit = factionData.units.team1Units.find((unit) => unit.unitObjectName === event.target.value);
        
            if (!selectedUnit) {
                console.warn("No matching unit found for", event.target.value);
                return;
            }

            selectedUnit.vehicles.forEach((vehicle) => {

                let delayInfo = "";
                if (vehicle.delay > 0) {
                    delayInfo = `
                        <span class="delay">
                            <span data-i18n="common:delayed">${i18next.t("common:delayed")}</span>
                            : ${vehicle.delay}
                            <span data-i18n="common:min">${i18next.t("common:min")}</span>
                        </span>
                    `;
                }

                $("#team1Vehicles").append(`
                    <div class="vehicle-card animate__animated animate__fadeIn animate__faster">
                        <div class="vehicle-icon">
                            <img src='/icons/ally/vehicles/${vehicle.icon}.webp' alt='${vehicle.type}' class='vehicle-icon-img'>
                        </div>
                        <div class="vehicle-icon">
                            <div class="vehicle-count">×${vehicle.count}</div>
                        </div>
                        <div class="vehicle-info">
                            <div class="vehicle-meta">
                                <span class="respawn">
                                    <span data-i18n="common:respawn">${i18next.t("common:respawn")}</span>
                                    : ${vehicle.respawnTime}
                                    <span data-i18n="common:min">${i18next.t("common:min")}</span>
                                </span>
                                <span class="count-delay"> ${delayInfo}</span>
                            </div>
                            <div class="vehicle-type">${vehicle.type}</div>
                        </div>
                    </div>
                `);
            });
    

            // tippy("#team1Vehicles .vehicle-type", {
            //     animation: "fade",
            //     placement: "bottom",
            //     offset: [0, 20],
            //     //allowHTML: true,
            //     touch: false,
            //     theme: "factionCopy",
            //     hideOnClick: true,
            //     maxWidth: 180,
            //     appendTo: document.querySelector("#factionsDialog"),
            //     onShow(tip) {
            //         tip.setContent(`
            //             ${i18next.t("clickToCopy", { ns: "tooltips" })}
            //         `);
            //     },
            // });

            // Handle click-to-copy
            $(".vehicle-type").off("click").on("click", (event) => { this.copyVehicleName(event); });
        });

        this.UNIT2_SELECTOR.off("change").on("change", (event) => {
            // Empty the vehicles container
            $("#team2Vehicles").empty();
            if ( $("#team2PinButton").hasClass("active") ) this.unpinUnit();

            const selectedUnit = factionData.units.team2Units.find((unit) => unit.unitObjectName === event.target.value);
        
            if (!selectedUnit) {
                console.warn("No matching unit found for", event.target.value);
                return;
            }

            selectedUnit.vehicles.forEach((vehicle) => {
                
                let delayInfo = "";
                if (vehicle.delay > 0) {
                    delayInfo = `
                        <span class="delay">
                            <span data-i18n="common:delayed">${i18next.t("common:delayed")}</span>
                            : ${vehicle.delay}
                            <span data-i18n="common:min">${i18next.t("common:min")}</span>
                        </span>
                    `;
                }

                $("#team2Vehicles").append(`
                    <div class="vehicle-card animate__animated animate__fadeIn animate__faster">
                        <div class="vehicle-icon">
                            <img src="/icons/ally/vehicles/${vehicle.icon}.webp" alt='${vehicle.type}' class='vehicle-icon-img'>
                        </div>
                        <div class="vehicle-icon">
                            <div class="vehicle-count">×${vehicle.count}</div>
                        </div>
                        <div class="vehicle-info">
                            <div class="vehicle-type">${vehicle.type}</div>
                            <div class="vehicle-meta">
                                <span class="respawn">
                                    <span data-i18n="common:respawn">${i18next.t("common:respawn")}</span>
                                    : ${vehicle.respawnTime}
                                    <span data-i18n="common:min">${i18next.t("common:min")}</span>
                                </span>
                                <span class="count-delay">${delayInfo}</span>
                            </div>
                        </div>
                    </div>
                `);
            });
    
            // Handle click-to-copy
            $(".vehicle-type").off("click").on("click", (event) => { this.copyVehicleName(event); });

        });

        if (App.userSettings.enableFactions) {
            if (App.userSettings.defaultFactions) {
                const team1DefaultFaction = factionData.teamConfigs.team1.defaultFactionUnit.split("_")[0];
                const team2DefaultFaction = factionData.teamConfigs.team2.defaultFactionUnit.split("_")[0];
                this.FACTION1_SELECTOR.val(team1DefaultFaction).trigger("change");
                this.FACTION2_SELECTOR.val(team2DefaultFaction).trigger("change");
            } else {
                this.FACTION1_SELECTOR.val("").trigger("change");
                this.FACTION2_SELECTOR.val("").trigger("change");
            }
        }

        $(".btn-pin").off("click").on("click", (event) => {
            
            if ($(event.currentTarget).hasClass("active")) {
                this.unpinUnit();
                $(event.currentTarget).removeClass("active");
                this.resetFactionsButton();
                return;
            }
            this.unpinUnit();

            $(".btn-pin").removeClass("active").text(i18next.t("common:pinToMap"));
            $(".btn-pin").attr("data-i18n", "common:pinToMap");

            let country;
            let faction;
            let teamfaction;
            
            if (event.currentTarget.id === "team1PinButton") {
                country = this.FACTION1_SELECTOR.val();
                faction = this.UNIT1_SELECTOR.val();
                teamfaction = factionData.units.team1Units;
            } else {
                country = this.FACTION2_SELECTOR.val();
                faction = this.UNIT2_SELECTOR.val();
                teamfaction = factionData.units.team2Units;
            }

            // if country of faction is empty or null, return
            if (country === null || faction === null) return;
            if (country === "" || faction === "") return;

            $(event.currentTarget).addClass("active").text(i18next.t("common:pinned"));
            $(event.currentTarget).attr("data-i18n", "common:pinned");

            this.pinUnit(teamfaction, country, faction);
    
        });

    }

    initDropdowns() {
        let factionPlaceholder = i18next.t("common:faction");
        let unitPlaceholder = i18next.t("common:unit");

        // Initialize Select2 with the structured data

        this.FACTION1_SELECTOR.select2({
            dropdownCssClass: "dropbtn",
            dropdownParent: $("#faction1"),
            allowClear: true,
            placeholder: factionPlaceholder,
            minimumResultsForSearch: -1,
            templateResult: (state) => this.formatFactions(state, false),
            templateSelection: (state) => this.formatFactions(state, true),
        });

        this.FACTION2_SELECTOR.select2({
            dropdownCssClass: "dropbtn",
            dropdownParent: $("#faction2"),
            allowClear: true,
            placeholder: factionPlaceholder,
            minimumResultsForSearch: -1,
            templateResult: (state) => this.formatFactions(state, false),
            templateSelection: (state) => this.formatFactions(state, true),
        });

        this.UNIT1_SELECTOR.select2({
            dropdownCssClass: "dropbtn",
            dropdownParent: $("#unit1"),
            placeholder: unitPlaceholder,
            minimumResultsForSearch: -1,
            templateResult: (state) => this.formatUnits(state, false),
            templateSelection: (state) => this.formatUnits(state, true),
        });

        this.UNIT2_SELECTOR.select2({
            dropdownCssClass: "dropbtn",
            dropdownParent: $("#unit2"),
            placeholder: unitPlaceholder,
            minimumResultsForSearch: -1,
            templateResult: (state) => this.formatUnits(state, false),
            templateSelection: (state) => this.formatUnits(state, true),
        });
    }

}