let items = {
    "anti-virus": {
        name: "Run Anti-Virus Scan",
        base: 3.738,
        rate: 1.07,
        profit: 1.67,
        length: 50,
        auto: false
    },
    "browser-toolbar": {
        name: "Install Browser Toolbar",
        base: 60,
        rate: 1.15,
        profit: 20,
        length: 100,
        auto: false
    },
    "crypto-miner": {
        name: "Run Crypto-miner",
        base: 720,
        rate: 1.14,
        profit: 90,
        length: 200,
        auto: false
    },
    "defrag": {
        name: "Run Defrag",
        base: 8640,
        rate: 1.13,
        profit: 360,
        length: 400,
        auto: false
    },
    "render-animation": {
        name: "Render Animation",
        base: 103680,
        rate: 1.12,
        profit: 2160,
        length: 800,
        auto: false
    }
};

let upgrades = {
    "auto-anti-virus": {
        name: "AntiVirus.bat",
        description: "Automate running Anti-Virus scans so you can focus on more important things.",
        cost: 1000,
        key: "anti-virus",
        mod: "auto",
        value: true,
        purchased: false
    },
    "auto-browser-toolbar": {
        name: "BrowserToolbar.bat",
        description: "Automate installing browser toolbars so you can focus on more important things.",
        cost: 15000,
        key: "browser-toolbar",
        mod: "auto",
        value: true,
        purchased: false
    },
    "auto-crypto-miner": {
        name: "CryptoMiner.bat",
        description: "Automate running cryptominers so you can focus on more important things.",
        cost: 500000,
        key: "crypto-miner",
        mod: "auto",
        value: true,
        purchased: false
    },
    "auto-defrag": {
        name: "Defrag.bat",
        description: "Automate running defrags so you can focus on more important things.",
        cost: 1200000,
        key: "defrag",
        mod: "auto",
        value: true,
        purchased: false
    },
    "auto-render-animation": {
        name: "RenderAnimation.bat",
        description: "Automate rendering animations so you can focus on more important things.",
        cost: 10000000,
        key: "render-animation",
        mod: "auto",
        value: true,
        purchased: false
    }
};

$(function () {

    if (localStorage.getItem("timestamp") == null) {
        $('#help').toggleClass('hidden');
    }

    let sfx1 = new Howl({
        src: ['./sfx001.mp3']
    });

    let sfx2 = new Howl({
        src: ['./sfx002.mp3']
    });

    let sfx3 = new Howl({
        src: ['./sfx003.mp3']
    });

    let sfxback = new Howl({
        src: ['./POL-pocket-garden-short.mp3'],
        loop: true,
        autoplay: true,
        volume: 0.2
    });

    let playMusic = localStorage.getItem("music");
    let playSounds = localStorage.getItem("sounds");

    // parse as bool, default to true
    playMusic = playMusic != "false";
    playSounds = playSounds != "false";

    $('#music').prop('checked', playMusic);
    $('#sounds').prop('checked', playSounds);

    sfxback.mute(!playMusic);

    window.onfocus = function () {
        sfxback.mute(!playMusic);
    };
    window.onblur = function () {
        sfxback.mute(true);
    };

    let money = parseInt(localStorage.getItem("money"));
    let ram = parseFloat(localStorage.getItem("ram"));

    if (isNaN(money)) money = 0;
    if (isNaN(ram)) ram = 0;

    $('[data-ram-usage]').text(ram.toFixed(2));
    $('[data-money]').text(money);

    let sectionsHtml = ``;
    for (let key in items) {
        // load quantity from local storage
        items[key].quantity = parseInt(localStorage.getItem(key));
        if (isNaN(items[key].quantity)) items[key].quantity = (key === "anti-virus" ? 1 : 0);
        items[key].cost = calculateCost(key, items[key].quantity);
        sectionsHtml += renderSection(key);
    }
    $('sections').replaceWith(sectionsHtml);

    let upgradesHtml = ``;
    for (let key in upgrades) {
        if (localStorage.getItem(key)) {
            upgrades[key].purchased = true;
            applyUpdate(key);
        }
        upgradesHtml += renderUpgrade(key);
    }
    $('upgrades').replaceWith(upgradesHtml);

    $('#music').on('change', () => {
        playMusic = $('#music').prop('checked');
        localStorage.setItem("music", playMusic);
        sfxback.mute(!playMusic);
    });

    $('#sounds').on('change', () => {
        playSounds = $('#sounds').prop('checked')
        localStorage.setItem("sounds", playSounds);
    });

    $('[data-open-upgrades]').on('click', () => {
        $('#upgrades').toggleClass('hidden');
    });

    $('[data-open-help]').on('click', () => {
        $('#help').toggleClass('hidden');
    });

    $('.window').on('click', '[aria-label="Close"]', (elem) => {
        $(elem.target).parents('.window').toggleClass('hidden');
    });

    $('section[data-item]').on('click', '[data-run]:not([disabled])', (elem) => {
        let item = $(elem.target).parents('[data-item]');
        item.find('progress').attr('data-enabled', true)[0].value = 0;
        $(item).find('[data-run]').attr('disabled', true);
    });

    $('section[data-item]').on('click', '[data-upgrade]:not([disabled])', (elem) => {

        let item = $(elem.target).parents('[data-item]');
        let key = item.attr("data-item");

        let cost = calculateCost(key, items[key].quantity);

        $(item).find('[data-quantity]').text(++items[key].quantity);

        if (items[key].quantity == 1) {
            // this was the first one bought, unlock the run button
            $(item).find('[data-run]').removeAttr('disabled');
        }

        if (money < cost) {
            // oops can't afford it
            $(item).find('[data-upgrade]').attr('disabled', true);
            return;
        }

        money -= cost;
        $('[data-money]').text(money);
        localStorage.setItem("money", money);

        if (money >= cost) {
            $(item).find('[data-upgrade]').removeAttr('disabled');
        } else {
            $(item).find('[data-upgrade]').attr('disabled', true);
        }

        $(item).find('[data-cost]').text(calculateCost(key, items[key].quantity));

        ram += items[key].profit;
        $('[data-ram-usage]').text(ram.toFixed(2));
        localStorage.setItem("ram", ram);

        localStorage.setItem(key, items[key].quantity);

        if (playSounds) sfx1.play();

    });


    $('section[data-upgrade]').on('click', '[data-purchase]:not([disabled])', (elem) => {

        let item = $(elem.target).parents('[data-upgrade]');
        let key = item.attr("data-upgrade");

        $(item).find('[data-purchase]').attr('disabled', true);

        let cost = upgrades[key].cost;

        if (money < cost) {
            // oops can't afford it, the button is already disabled though
            return;
        }

        applyUpdate(key);

        localStorage.setItem(key, true);
        upgrades[key].purchased = true;

        money -= cost;
        $('[data-money]').text(money);
        localStorage.setItem("money", money);

        if (playSounds) sfx2.play();

    });

    function progress() {
        $("section[data-item] progress[data-enabled]").each((_, elem) => {
            if (++$(elem)[0].value >= $(elem).attr("max")) {

                let item = $(elem).parents('[data-item]');
                let key = item.attr("data-item");

                if (items[key].auto) {
                    $(elem)[0].value = 0;
                } else {
                    $(elem).removeAttr('data-enabled');
                    item.find('[data-run]').removeAttr('disabled');
                    if (playSounds) sfx3.play();
                }

                // increase our earnings
                money += Math.ceil(items[key].profit * items[key].quantity);
                $('[data-money]').text(money);
                localStorage.setItem("money", money);

                //todo update time remaining

            } else {
                let remaining = $(elem).attr("max") - $(elem)[0].value;
                remaining = Math.ceil(remaining / (1000 / 60));
                $(elem).parents('section[data-item]').find('[data-time-remaining]').text(remaining);
            }
        });
        localStorage.setItem("timestamp", new Date().getTime());
    }

    setInterval(progress, 1000 / 60); // 60 fps

    function step() {

        // update 'upgrade' buttons to see if they're able to afford it
        $("section[data-item]").each((_, elem) => {
            let key = $(elem).attr("data-item");
            if (money >= calculateCost(key, items[key].quantity)) {
                $(elem).find('[data-upgrade]').removeAttr('disabled');
            } else {
                $(elem).find('[data-upgrade]').attr('disabled', true);
            }
        });

        $("section[data-upgrade]").each((_, elem) => {
            let key = $(elem).attr("data-upgrade");
            if (money >= upgrades[key].cost && !upgrades[key].purchased) {
                $(elem).find('[data-purchase]').removeAttr('disabled');
            } else {
                $(elem).find('[data-purchase]').attr('disabled', true);
            }
        });

        window.requestAnimationFrame(step);
    }

    window.requestAnimationFrame(step);

});

function applyUpdate(key) {
    let upgrade = upgrades[key];
    items[upgrade.key][upgrade.mod] = upgrade.value;
    if (upgrade.mod == "auto") {
        let item = $(`section[data-item="${upgrade.key}"] `);
        item.find('progress').attr('data-enabled', true)[0].value = 0;
        $(item).find('[data-run]').attr('disabled', true);
    }
}

function calculateProfit(key, quantity) {
    let item = items[key];
    return Math.ceil(item.profit * quantity);
}

function calculateCost(key, quantity) {
    let item = items[key];
    return Math.ceil(item.base * Math.pow(item.rate, quantity));
}

function renderSection(key) {
    let section = items[key];
    return `<section data-item="${key}">
                <hr/>
                <p><u>${section.name}</u></p>
                <progress value="0" max="${section.length}"></progress>
                <table width="100%">
                    <tr>
                        <td width="30%">
                            <p><span data-time-remaining>0</span>&nbsp;seconds remaining</p>
                        </td>
                        <td width="60%" align="right">
                            <button ${section.quantity >= 1 ? "" : "disabled"} data-run>Run x<span data-quantity>${section.quantity}</span></button>
                            &nbsp;
                            <button disabled data-upgrade>Upgrade (<span data-cost>${section.cost}</span>&micro;&#8383;)</button>
                        </td>
                    </tr>
                </table>
            
            </section>`;
}

function renderUpgrade(key) {
    let upgrade = upgrades[key];
    return `<section data-upgrade="${key}">
                <p><u>${upgrade.name} ${upgrade.purchased ? "- Purchased" : ""}</u></p>
                <p>${upgrade.description}</p>
                <button ${upgrade.purchased ? "disabled" : ""} data-purchase><span ${upgrade.purchased ? "class='strikethrough'" : ""}>Upgrade (<span data-cost>${upgrade.cost}</span>&micro;&#8383;)</span></button>
            <br/><hr/>
            </section>`;
}