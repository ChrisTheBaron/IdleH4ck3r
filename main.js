$(function () {

    let money = 0;
    let ram = 0;

    // todo: check in local storage 

    $('[data-item]').on('click', '[data-run]:not([disabled])', (elem) => {
        let item = $(elem.target).parents('[data-item]');
        item.find('progress').attr('data-enabled', true)[0].value = 0;
        $(item).find('[data-run]').attr('disabled', true);
    });

    $('[data-item]').on('click', '[data-upgrade]:not([disabled])', (elem) => {
        let item = $(elem.target).parents('[data-item]');

        let cost = parseInt($(item).find('[data-cost]').text());

        let quantity = parseInt($(item).find('[data-quantity]').text());
        $(item).find('[data-quantity]').text(++quantity);

        if (quantity == 1) {
            // this was the first one bought, unlock the run button
            $(item).find('[data-run]').removeAttr('disabled');
        }

        money -= cost;

        $('[data-money]').text(money);

        if (money >= cost) {
            $(item).find('[data-upgrade]').removeAttr('disabled');
        } else {
            $(item).find('[data-upgrade]').attr('disabled', true);
        }

        // calculate the new cost
        let baseCost = parseFloat($(item).attr('data-base'));
        let rate = parseFloat($(item).attr('data-rate'));

        console.log(baseCost, rate);

        let newCost = Math.ceil(baseCost * Math.pow(rate, quantity));
        $(item).find('[data-cost]').text(newCost);

        let profit = Math.ceil(parseFloat($(item).attr('data-profit')));

        ram += profit;
        $('[data-ram-usage]').text(ram);

    });

    function step() {

        $("[data-item] progress[data-enabled]").each((ind, elem) => {
            if (++$(elem)[0].value >= 100) {
                //todo update time remaining
                $(elem).removeAttr('data-enabled');
                let item = $(elem).parents('[data-item]');
                $(item).find('[data-run]').removeAttr('disabled');

                let quantity = parseInt($(item).find('[data-quantity]').text());
                let profit = parseFloat($(item).attr('data-profit'));

                // increase our earnings
                money += Math.ceil(profit * quantity);

                $('[data-money]').text(money);

            }
        });

        // update 'upgrade' buttons to see if they're able to afford it
        $("[data-item]").each((ind, elem) => {
            let cost = parseInt($(elem).find('[data-cost]').text());
            if (money >= cost) {
                $(elem).find('[data-upgrade]').removeAttr('disabled');
            } else {
                $(elem).find('[data-upgrade]').attr('disabled', true);
            }
        });

        window.requestAnimationFrame(step);
    }

    window.requestAnimationFrame(step);

});
