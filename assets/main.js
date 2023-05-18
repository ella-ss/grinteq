"use strict";

(function ($) {
  $.fn.kp_load_more = function (options) {
    return $(this).each(function (e) {
      var $this = $(this);
      var elements = typeof options.elements === 'undefined' ? false : options.elements;
      var per_page = typeof options.per_page === 'undefined' ? 3 : options.per_page - 1;
      var load_data = typeof options.load_data === 'undefined' ? 3 : options.load_data - 1;
      var json_url = typeof options.json_url === 'undefined' ? '' : options.json_url;
      var shopify = typeof options.shopify === 'undefined' ? false : options.shopify;
      $($this).after('<button id="btn" class="load-btn btn large" data-page="1">View More</button>');
      $.ajax({
        method: 'GET',
        url: json_url,
        dataType: 'JSON',
        success: function (d, msg) {
          var data = d.products;
          console.log(data);
          $(data).each(function (index) {
            $this.append('<' + elements + ' class="product ' + index + '"><figure><a href="#"><img src="' + this.images[0].src + '>"</a><figcaption><h6><a href="/products/' + this.handle + '">' + this.title + '</a></h6><p>$' + this.variants[0].price + '</p></figcaption></figure>' + '</' + elements + '>');
            if (index === per_page) {
              return false;
            }
          });
        },
        error: function (msg) {
          alert(msg.statusText);
        }
      });
      var next_item = '';
      $(document).on('click', '.load-btn', function () {
        let next_page = parseInt($(this).attr('data-page'));
        $(this).attr('data-page', next_page + 1);
        next_item = per_page + 1;
        if (next_page != 1) {
          next_item = break_item + 1;
        }
        break_item = next_item + load_data;
        console.log(next_item + ' == ' + load_data + '==' + next_page + '==' + break_item);
        $.ajax({
          method: 'GET',
          url: json_url,
          dataType: 'JSON',
          success: function (d, msg) {
            var data = d.products;
            for (i = next_item; i < data.length; i++) {
              $this.append('<' + elements + ' class="product ' + i + '"><figure><a href="#"><img src="' + data[i].images[0].src + '>"</a><figcaption><h6><a href="/products/' + data[i].handle + '">' + data[i].title + '</a></h6><p>$' + data[i].variants[0].price + '</p></figcaption></figure>' + '</' + elements + '>');
              if (i == data.length - 1) {
                $('#btn').hide();
                console.log('hide');
              }
              if (i == break_item) {
                return false;
              }
            }
          },
          error: function (msg) {
            alert(msg.statusText);
          }
        });

        //return false;
      });
    }); // end loop
  }; //end slider
})(jQuery);
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
  $('.product-slider').slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    fade: true,
    cssEase: 'linear',
    asNavFor: '.product-slider_nav'
  });
  $('.product-slider_nav').slick({
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