$(window).on('load', function () {
    // get an array with options of clicked variant (ie value: 'Black', index: 'option1')
    function getVariantFromSwatches() {
        let variantArr = [];
        $('.product-option input[type=radio]').map(function (i, el) {
            if ($(el).is(':checked')) {
                variantArr.push({
                    value: $(el).val(),
                    index: $(el).attr('data-index'),
                });
            }
        });
        return variantArr;
    }

    // update URL
    function updateHistoryState(variant) {
        if (!history.replaceState || !variant) {
            return;
        }
        let newUrl =
            window.location.protocol +
            "//" +
            window.location.host +
            window.location.pathname +
            "?variant=" +
            variant.id;

        window.history.replaceState({ path: newUrl }, "", newUrl);
    }

    // Money Format
    theme.Currency = (function () {
        let moneyFormat = "${{amount}}";
        function formatMoney(cents, format) {
            if (typeof cents === "string") {
                cents = cents.replace(".", "");
            }
            let value = "";
            let placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
            let formatString = format || moneyFormat;

            function formatWithDelimiters(number, precision, thousands, decimal) {
                thousands = thousands || ",";
                decimal = decimal || ".";

                if (isNaN(number) || number === null) {
                    return 0;
                }

                number = (number / 100.0).toFixed(precision);

                let parts = number.split(".");
                let dollarsAmount = parts[0].replace(
                    /(\d)(?=(\d\d\d)+(?!\d))/g,
                    "$1" + thousands
                );
                let centsAmount = parts[1] ? decimal + parts[1] : "";

                return dollarsAmount + centsAmount;
            }

            switch (formatString.match(placeholderRegex)[1]) {
                case "amount":
                    value = formatWithDelimiters(cents, 2);
                    break;
                case "amount_no_decimals":
                    value = formatWithDelimiters(cents, 0);
                    break;
                case "amount_with_comma_separator":
                    value = formatWithDelimiters(cents, 2, ".", ",");
                    break;
                case "amount_no_decimals_with_comma_separator":
                    value = formatWithDelimiters(cents, 0, ".", ",");
                    break;
                case "amount_no_decimals_with_space_separator":
                    value = formatWithDelimiters(cents, 0, " ");
                    break;
                case "amount_with_apostrophe_separator":
                    value = formatWithDelimiters(cents, 2, "'");
                    break;
            }

            return formatString.replace(placeholderRegex, value);
        }
        return {
            formatMoney: formatMoney,
        };
    })();

    //plus btn
    $('.add').on('click', function () {
        $(this)
            .prev()
            .val(+$(this).prev().val() + 1);
    });

    //minus btn
    $('.sub').on('click', function () {
        if ($(this).next().val() > 1) {
            if ($(this).next().val() > 1)
                $(this)
                    .next()
                    .val(+$(this).next().val() - 1);
        }
    });

    //change class for swatch
    $('.swatch').click(function () {
        $(this).closest('.options_wrap').find('.swatch').removeClass('active');
        $(this).addClass('active');
    })

    function update_variant_id(variant) {
        $('#variant_id').val(variant);
    }

    function update_slider_image(variantImg) {
        let slideIndex = $('#' + variantImg).attr('data-index');
        sliderMain.slick('slickGoTo', slideIndex - 1);
    }

    function update_product_price(variant) {
        let regular_price = variant.price;
        let compare_price = variant.compare_at_price;
        let regular_price_output =
            '<span class="money regular_price" id="regular_price">' +
            theme.Currency.formatMoney(regular_price, theme.moneyFormat) +
            "</span>";

        if (compare_price > regular_price) {
            let compare_price_output =
                '<span class="money compare_price" id="compare_price"> <del>' +
                theme.Currency.formatMoney(compare_price, theme.moneyFormat) +
                "</del></span>";
            let saved_price = Math.round(compare_price - regular_price);
            let saved_price_output =
                '<span class="save_amount" id="save_amount"> Save up to ' +
                theme.Currency.formatMoney(saved_price, theme.moneyFormat) +
                "</span>";
            let output = regular_price_output + compare_price_output + saved_price_output;
            $('#product_price').html(output);
        } else {
            let compare_price_output = "";
            let saved_price_output = "";
            let output = regular_price_output + compare_price_output + saved_price_output;
            $('#product_price').html(output);
        }
    }

    function update_add_to_cart_text(variant) {
        let addToCart = $('#addToCart');
        if (variant.available == false) {
            addToCart.attr('disabled', true);
            addToCart.text('Sold Out');
        } else {
            addToCart.attr('disabled', false);
            addToCart.text('Add to Cart');
        }
    }

    function updateMasterVariant(variant) {
        let masterSelect = $('.product-form__variants');
        masterSelect.val(variant.id);
    }

    //onchange main
    $('input[type=radio]').on('change', function () {
      let selectedValues = getVariantFromSwatches();
      let variants = window.product.variants;
      let found = false;
      variants.forEach(function (variant) {
        let satisfied = true;
        selectedValues.forEach(function (option) {
          if (satisfied) {
            satisfied = option.value === variant[option.index];
          }
        });
        if (satisfied) {
          found = variant;
        }
      });
      update_add_to_cart_text(found);
      update_variant_id(found.id);
      update_slider_image(found.featured_image);
      updateMasterVariant(found);
      updateHistoryState(found);
      update_product_price(found);
    });

    //slider
    let sliderMain = $('.product-slider');
    let sliderNav = $('.product-slider_nav');
    sliderNav.on('init', function (event, slick) {
        lazyLoadInstance.update()
    });

    sliderMain.slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        fade: true,
        cssEase: 'linear',
        asNavFor: '.product-slider_nav',
    });

    sliderNav.slick({
        slidesToShow: 3,
        slidesToScroll: 1,
        asNavFor: '.product-slider',
        dots: false,
        centerMode: true,
        focusOnSelect: true,
        prevArrow: $('.prev_btn'),
        nextArrow: $('.next_btn')
    });
});