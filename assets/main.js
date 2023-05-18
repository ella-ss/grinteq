"use strict";

$(window).on('load', function () {
  // get an array with options of clicked variant (ie value: 'Black', index: 'option1')
  function getVariantFromSwatches() {
    let variantArr = [];
    $('.product-option input[type=radio]').map(function (i, el) {
      if ($(el).is(':checked')) {
        variantArr.push({
          value: $(el).val(),
          index: $(el).attr('data-index')
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
    let newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + "?variant=" + variant.id;
    window.history.replaceState({
      path: newurl
    }, "", newurl);
  }

  /* Money Format */
  theme.Currency = function () {
    let moneyFormat = "${{amount}}"; // eslint-disable-line camelcase

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
        let dollarsAmount = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + thousands);
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
      formatMoney: formatMoney
    };
  }();

  //plus btn
  $('.add').on('click', function () {
    $(this).prev().val(+$(this).prev().val() + 1);
  });
  //minus btn
  $('.sub').on('click', function () {
    if ($(this).next().val() > 1) {
      if ($(this).next().val() > 1) $(this).next().val(+$(this).next().val() - 1);
    }
  });

  //change class for swatch
  $('.swatch').click(function () {
    $(this).closest('.options_wrap').find('.swatch').removeClass('active');
    $(this).addClass('active');
  });
  function update_variant_id(variant) {
    $('#variant_id').val(variant);
  }
  function update_slider_image(variantImg) {
    let slideIndex = $('#' + variantImg).attr('data-index');
    console.log(variantImg);
    $('.product-slider').slick('slickGoTo', slideIndex - 1);
  }
  function update_product_price(variant) {
    let regular_price = variant.price;
    let compare_price = variant.compare_at_price;
    let regular_price_output = '<span class="money regular_price" id="regular_price">' + theme.Currency.formatMoney(regular_price, theme.moneyFormat) + "</span>";
    if (compare_price > regular_price) {
      let compare_price_output = '<span class="money compare_price" id="compare_price"> <del>' + theme.Currency.formatMoney(compare_price, theme.moneyFormat) + "</del></span>";
      let saved_price = Math.round(compare_price - regular_price);
      let saved_price_output = '<span class="save_amount" id="save_amount"> Save up to ' + theme.Currency.formatMoney(saved_price, theme.moneyFormat) + "</span>";
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
  $('input[type=radio]').on('change', function () {
    let selectedValues = getVariantFromSwatches();
    let variants = window.product.variants;
    let found = false;
    variants.forEach(function (variant) {
      let satisfied = true;
      let options = variant.options;
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
    update_slider_image(found.featured_image.id);
    updateMasterVariant(found);
    updateHistoryState(found);
    update_product_price(found);
  });
  $('.product-slider').slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    fade: true,
    cssEase: 'linear',
    asNavFor: '.product-slider-nav'
  });
  $('.product-slider-nav').slick({
    slidesToShow: 3,
    slidesToScroll: 1,
    asNavFor: '.product-slider',
    dots: false,
    centerMode: true,
    focusOnSelect: true,
    prevArrow: "<button type='button' class='slick-prev p-slider-btn' id='pro_previous'><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" fill=\"none\">\n" + "<path d=\"M9.8 11H13C13.2833 11 13.521 10.904 13.713 10.712C13.905 10.52 14.0007 10.2827 14 10C14 9.71667 13.904 9.479 13.712 9.287C13.52 9.095 13.2827 8.99933 13 9H9.8L10.7 8.1C10.8833 7.91667 10.975 7.68333 10.975 7.4C10.975 7.11667 10.8833 6.88333 10.7 6.7C10.5167 6.51667 10.2833 6.425 10 6.425C9.71667 6.425 9.48333 6.51667 9.3 6.7L6.7 9.3C6.5 9.5 6.4 9.73333 6.4 10C6.4 10.2667 6.5 10.5 6.7 10.7L9.3 13.3C9.48333 13.4833 9.71667 13.575 10 13.575C10.2833 13.575 10.5167 13.4833 10.7 13.3C10.8833 13.1167 10.975 12.8833 10.975 12.6C10.975 12.3167 10.8833 12.0833 10.7 11.9L9.8 11ZM10 20C8.61667 20 7.31667 19.7373 6.1 19.212C4.88333 18.6867 3.825 17.9743 2.925 17.075C2.025 16.175 1.31267 15.1167 0.788 13.9C0.263333 12.6833 0.000666667 11.3833 0 10C0 8.61667 0.262667 7.31667 0.788 6.1C1.31333 4.88333 2.02567 3.825 2.925 2.925C3.825 2.025 4.88333 1.31267 6.1 0.788C7.31667 0.263333 8.61667 0.000666667 10 0C11.3833 0 12.6833 0.262667 13.9 0.788C15.1167 1.31333 16.175 2.02567 17.075 2.925C17.975 3.825 18.6877 4.88333 19.213 6.1C19.7383 7.31667 20.0007 8.61667 20 10C20 11.3833 19.7373 12.6833 19.212 13.9C18.6867 15.1167 17.9743 16.175 17.075 17.075C16.175 17.975 15.1167 18.6877 13.9 19.213C12.6833 19.7383 11.3833 20.0007 10 20Z\" fill=\"black\"/>\n" + "</svg></button>",
    nextArrow: "<button type='button' class='slick-next p-slider-btn' id='pro_next'><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" fill=\"none\">\n" + "<path d=\"M10.2 11H7C6.71667 11 6.479 10.904 6.287 10.712C6.095 10.52 5.99934 10.2827 6 10C6 9.71667 6.096 9.479 6.288 9.287C6.48 9.095 6.71733 8.99933 7 9H10.2L9.3 8.1C9.11667 7.91667 9.025 7.68333 9.025 7.4C9.025 7.11667 9.11667 6.88333 9.3 6.7C9.48333 6.51667 9.71667 6.425 10 6.425C10.2833 6.425 10.5167 6.51667 10.7 6.7L13.3 9.3C13.5 9.5 13.6 9.73333 13.6 10C13.6 10.2667 13.5 10.5 13.3 10.7L10.7 13.3C10.5167 13.4833 10.2833 13.575 10 13.575C9.71667 13.575 9.48333 13.4833 9.3 13.3C9.11667 13.1167 9.025 12.8833 9.025 12.6C9.025 12.3167 9.11667 12.0833 9.3 11.9L10.2 11ZM10 20C11.3833 20 12.6833 19.7373 13.9 19.212C15.1167 18.6867 16.175 17.9743 17.075 17.075C17.975 16.175 18.6873 15.1167 19.212 13.9C19.7367 12.6833 19.9993 11.3833 20 10C20 8.61667 19.7373 7.31667 19.212 6.1C18.6867 4.88333 17.9743 3.825 17.075 2.925C16.175 2.025 15.1167 1.31267 13.9 0.788C12.6833 0.263333 11.3833 0.000666667 10 0C8.61667 0 7.31667 0.262667 6.1 0.788C4.88334 1.31333 3.825 2.02567 2.925 2.925C2.025 3.825 1.31234 4.88333 0.787003 6.1C0.26167 7.31667 -0.000664282 8.61667 2.38419e-06 10C2.38419e-06 11.3833 0.262669 12.6833 0.788002 13.9C1.31334 15.1167 2.02567 16.175 2.925 17.075C3.825 17.975 4.88334 18.6877 6.1 19.213C7.31667 19.7383 8.61667 20.0007 10 20Z\" fill=\"black\"/>\n" + "</svg></button>"
  });
});