let items = {
    "anti-virus": {
        name: "Run Anti-Virus Scan",
        base: 3.738,
        rate: 1.07,
        profit: 1.67,
        length: 50
    },
    "browser-toolbar": {
        name: "Install Browser Toolbar",
        base: 60,
        rate: 1.15,
        profit: 20,
        length: 100
    },
    "crypto-miner": {
        name: "Run Crypto-miner",
        base: 720,
        rate: 1.14,
        profit: 90,
        length: 200
    },
    "defrag": {
        name: "Run Defrag",
        base: 8640,
        rate: 1.13,
        profit: 360,
        length: 400
    },
    "render-animation": {
        name: "Render Animation",
        base: 103680,
        rate: 1.12,
        profit: 2160,
        length: 800
    }
};

let upgrades = {

};

$(function () {

    let money = parseInt(localStorage.getItem("money"));
    let ram = parseFloat(localStorage.getItem("ram"));

    if (isNaN(money)) money = 0;
    if (isNaN(ram)) ram = 0;

    $('[data-ram-usage]').text(ram.toFixed(2));
    $('[data-money]').text(money);

    let sections = ``;
    for (let key in items) {
        // load quantity from local storage
        items[key].quantity = parseInt(localStorage.getItem(key));
        if (isNaN(items[key].quantity)) items[key].quantity = (key === "anti-virus" ? 1 : 0);
        items[key].cost = calculateCost(key, items[key].quantity);
        sections += renderSection(key);
    }

    $('sections').replaceWith(sections);

    $('[data-item]').on('click', '[data-run]:not([disabled])', (elem) => {
        let item = $(elem.target).parents('[data-item]');
        item.find('progress').attr('data-enabled', true)[0].value = 0;
        $(item).find('[data-run]').attr('disabled', true);
    });

    $('[data-item]').on('click', '[data-upgrade]:not([disabled])', (elem) => {

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
            $(item).find('[data-upgrade]').removeAttr('disabled');
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

    });

    function step() {

        $("[data-item] progress[data-enabled]").each((_, elem) => {
            if (++$(elem)[0].value >= $(elem).attr("max")) {
                //todo update time remaining
                $(elem).removeAttr('data-enabled');
                let item = $(elem).parents('[data-item]');
                let key = item.attr("data-item");
                item.find('[data-run]').removeAttr('disabled');

                // increase our earnings
                money += Math.ceil(items[key].profit * items[key].quantity);
                $('[data-money]').text(money);
                localStorage.setItem("money", money);

            }
        });

        // update 'upgrade' buttons to see if they're able to afford it
        $("[data-item]").each((_, elem) => {
            let key = $(elem).attr("data-item");
            if (money >= calculateCost(key, items[key].quantity)) {
                $(elem).find('[data-upgrade]').removeAttr('disabled');
            } else {
                $(elem).find('[data-upgrade]').attr('disabled', true);
            }
        });

        window.requestAnimationFrame(step);
    }

    window.requestAnimationFrame(step);

});

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
                <p>${section.name}</p>
                <progress value="0" max="${section.length}"></progress>
                <table width="100%">
                    <tr>
                        <td width="30%">
                            <p>5 seconds remaining</p>
                        </td>
                        <td width="60%" align="right">
                            <button ${section.quantity >= 1 ? "" : "disabled"} data-run>Run x<span data-quantity>${section.quantity}</span></button>
                            &nbsp;
                            <button disabled data-upgrade>Upgrade (<span data-cost>${section.cost}</span>&micro;&#8383;)</button>
                        </td>
                    </tr>
                </table>
            <br/><hr/>
            </section>`;
}
